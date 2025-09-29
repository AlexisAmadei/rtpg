const db = require("../db");
const { withLinks } = require("../utils/hateoas");

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
    res.status(201).json(
        withLinks(match, {
            self: { href: `/api/v1/matches/${match.id}` },
            join: { href: `/api/v1/matches/${match.id}/join`, method: "POST" },
        })
    );
}

function listMatches(req, res) {
    const user = req.user;
    const items = stmtListMatches.all({ uid: user.id });
    res.json(
        withLinks({ items }, { create: { href: "/api/v1/matches", method: "POST" } })
    );
}

function joinMatch(req, res) {
    const id = Number(req.params.id);
    const user = req.user;
    const match = stmtGetMatch.get(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.opponent_id) return res.status(400).json({ error: "Match full" });
    if (match.creator_id === user.id)
        return res.status(400).json({ error: "Cannot join own match" });

    stmtJoinMatch.run({ id, oid: user.id });
    const updated = stmtGetMatch.get(id);
    res.json(
        withLinks(updated, {
            self: { href: `/api/v1/matches/${id}` },
            move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
        })
    );
}

function getMatch(req, res) {
    const id = Number(req.params.id);
    const match = stmtGetMatch.get(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(
        withLinks(match, {
            self: { href: `/api/v1/matches/${id}` },
            move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
        })
    );
}

function makeMove(req, res) {
    const id = Number(req.params.id);
    const { index } = req.body || {};
    const user = req.user;
    const match = stmtGetMatch.get(id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status !== "in_progress")
        return res.status(400).json({ error: "Match not in progress" });
    if (match.winner) return res.status(400).json({ error: "Match finished" });

    const symbol = match.turn;
    const isX = match.creator_id === user.id;
    const isO = match.opponent_id === user.id;
    if (!isX && !isO)
        return res.status(403).json({ error: "Not a player in this match" });
    if ((symbol === "X" && !isX) || (symbol === "O" && !isO))
        return res.status(400).json({ error: "Not your turn" });
    if (index < 0 || index > 8) return res.status(400).json({ error: "Invalid index" });

    const board = match.board.split("");
    if (board[index] !== "_") return res.status(400).json({ error: "Cell taken" });
    board[index] = symbol;

    // winner check
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    let winner = null;
    let status = match.status;
    if (wins.some(w => w.every(i => board[i] === symbol))) {
        winner = symbol;
        status = "finished";
    } else if (!board.includes("_")) {
        winner = "draw";
        status = "finished";
    }
    const nextTurn = winner ? match.turn : (symbol === "X" ? "O" : "X");

    stmtInsertMove.run({ mid: id, pid: user.id, index, symbol });
    stmtUpdateMatch.run({
        id,
        board: board.join(""),
        turn: nextTurn,
        status,
        winner,
    });

    const updated = stmtGetMatch.get(id);
    res.json(
        withLinks(updated, {
            self: { href: `/api/v1/matches/${id}` },
            move: { href: `/api/v1/matches/${id}/move`, method: "POST" },
        })
    );
}

module.exports = { createMatch, listMatches, joinMatch, getMatch, makeMove };
