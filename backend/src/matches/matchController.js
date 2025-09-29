const db = require("../db");
const { withLinks } = require("../utils/hateoas");
const { respond } = require("../utils/respond");

const stmtInsertMatch = db.prepare(`
    INSERT INTO matches (creator_id, board, turn, status)
    VALUES (@creator_id, @board, @turn, @status)
`);
const stmtListMatches = db.prepare(`
    SELECT * FROM matches
    WHERE creator_id = @uid OR opponent_id = @uid
    ORDER BY created_at DESC
`);
const stmtGetMatch = db.prepare(`SELECT * FROM matches WHERE id = ?`);
const stmtJoinMatch = db.prepare(`
    UPDATE matches SET opponent_id = @oid, status='in_progress'
    WHERE id=@id AND opponent_id IS NULL
`);
const stmtUpdateMatch = db.prepare(`
    UPDATE matches
    SET board=@board, turn=@turn, status=@status, winner=@winner
    WHERE id=@id
`);
const stmtInsertMove = db.prepare(`
    INSERT INTO moves (match_id, player_id, index_pos, symbol)
    VALUES (@mid, @pid, @index, @symbol)
`);

function createMatch(req, res) {
    const user = req.user;
    const info = stmtInsertMatch.run({
        creator_id: user.id,
        board: "_________",
        turn: "X",
        status: "waiting",
    });
    const match = stmtGetMatch.get(info.lastInsertRowid);
    const links = {
        self: { href: `/api/v1/matches/${match.id}` },
        join: { href: `/api/v1/matches/${match.id}/join`, method: "POST" },
    };
    // JSON => {..}; HAL => {.., _links}; CSV => one-row csv
    respond(req, res, match, links, {
        headerOrder: [
            "id", "creator_id", "opponent_id", "board", "turn", "status", "winner", "created_at"
        ]
    }, 201);
}

function listMatches(req, res) {
    const user = req.user;
    const items = stmtListMatches.all({ uid: user.id });
    const links = { create: { href: "/api/v1/matches", method: "POST" } };
    // If Accept: text/csv -> rows = items
    respond(req, res, { items }, links, {
        headerOrder: ["id", "creator_id", "opponent_id", "board", "turn", "status", "winner", "created_at"],
        filename: "matches.csv"
    });
}

function joinMatch(req, res) {
    const id = Number(req.params.id);
    const user = req.user;
    const match = stmtGetMatch.get(id);
    if (!match) return respond(req, res, { error: "Match not found" }, {}, {}, 404);
    if (match.opponent_id) return respond(req, res, { error: "Match full" }, {}, {}, 400);
    if (match.creator_id === user.id) return respond(req, res, { error: "Cannot join own match" }, {}, {}, 400);

    stmtJoinMatch.run({ id, oid: user.id });
    const updated = stmtGetMatch.get(id);
    const links = {
        self: { href: `/api/v1/matches/${id}` },
        move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
    };
    respond(req, res, updated, links, {
        headerOrder: ["id", "creator_id", "opponent_id", "board", "turn", "status", "winner", "created_at"]
    });
}

function getMatch(req, res) {
    const id = Number(req.params.id);
    const match = stmtGetMatch.get(id);
    if (!match) return respond(req, res, { error: "Match not found" }, {}, {}, 404);
    const links = {
        self: { href: `/api/v1/matches/${id}` },
        move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
    };
    respond(req, res, match, links, {
        headerOrder: ["id", "creator_id", "opponent_id", "board", "turn", "status", "winner", "created_at"]
    });
}

function makeMove(req, res) {
    const id = Number(req.params.id);
    const { index } = req.body || {};
    const user = req.user;
    const match = stmtGetMatch.get(id);
    if (!match) return respond(req, res, { error: "Match not found" }, {}, {}, 404);
    if (match.status !== "in_progress") return respond(req, res, { error: "Match not in progress" }, {}, {}, 400);
    if (match.winner) return respond(req, res, { error: "Match finished" }, {}, {}, 400);

    const symbol = match.turn;
    const isX = match.creator_id === user.id;
    const isO = match.opponent_id === user.id;
    if (!isX && !isO) return respond(req, res, { error: "Not a player in this match" }, {}, {}, 403);
    if ((symbol === "X" && !isX) || (symbol === "O" && !isO)) return respond(req, res, { error: "Not your turn" }, {}, {}, 400);
    if (index < 0 || index > 8) return respond(req, res, { error: "Invalid index" }, {}, {}, 400);

    const board = match.board.split("");
    if (board[index] !== "_") return respond(req, res, { error: "Cell taken" }, {}, {}, 400);
    board[index] = symbol;

    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    let winner = null;
    let status = match.status;
    if (wins.some(w => w.every(i => board[i] === symbol))) {
        winner = symbol; status = "finished";
    } else if (!board.includes("_")) {
        winner = "draw"; status = "finished";
    }
    const nextTurn = winner ? match.turn : (symbol === "X" ? "O" : "X");

    stmtInsertMove.run({ mid: id, pid: user.id, index, symbol });
    stmtUpdateMatch.run({ id, board: board.join(""), turn: nextTurn, status, winner });

    const updated = stmtGetMatch.get(id);
    const links = {
        self: { href: `/api/v1/matches/${id}` },
        move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
    };
    respond(req, res, updated, links, {
        headerOrder: ["id", "creator_id", "opponent_id", "board", "turn", "status", "winner", "created_at"]
    });
}

module.exports = { createMatch, listMatches, joinMatch, getMatch, makeMove };