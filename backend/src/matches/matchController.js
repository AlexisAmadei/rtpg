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
    const match = matches.find((m) => m.id === id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.opponentId) return res.status(400).json({ error: "Match full" });
    if (match.creatorId === user.id) return res.status(400).json({ error: "Cannot join own match" });

    match.opponentId = user.id;
    match.status = "in_progress";
    res.json(
        withLinks(match, {
            self: { href: `/api/v1/matches/${match.id}` },
            move: { href: `/api/v1/matches/${match.id}/move`, method: "POST" },
        })
    );
}

function getMatch(req, res) {
    const id = Number(req.params.id);
    const match = matches.find((m) => m.id === id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(
        withLinks(match, {
            self: { href: `/api/v1/matches/${match.id}` },
            move: { href: `/api/v1/matches/${match.id}/move`, method: "POST" },
        })
    );
}

function makeMove(req, res) {
    const id = Number(req.params.id);
    const { index } = req.body || {};
    const user = req.user;

    const match = matches.find((m) => m.id === id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    if (match.status !== "in_progress")
        return res.status(400).json({ error: "Match not in progress" });
    if (match.winner) return res.status(400).json({ error: "Match finished" });

    const symbol = match.turn;
    const isPlayerX = match.creatorId === user.id;
    const isPlayerO = match.opponentId === user.id;

    if (!isPlayerX && !isPlayerO)
        return res.status(403).json({ error: "Not a player in this match" });

    if ((symbol === "X" && !isPlayerX) || (symbol === "O" && !isPlayerO))
        return res.status(400).json({ error: "Not your turn" });

    if (index < 0 || index > 8) return res.status(400).json({ error: "Invalid index" });
    if (match.board[index] !== "_") return res.status(400).json({ error: "Cell taken" });

    match.board[index] = symbol;

    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    if (wins.some(w => w.every(i => match.board[i] === symbol))) {
        match.winner = symbol;
        match.status = "finished";
    } else if (match.board.every(c => c !== "_")) {
        match.winner = "draw";
        match.status = "finished";
    } else {
        match.turn = symbol === "X" ? "O" : "X";
    }

    res.json(
        withLinks(match, {
            self: { href: `/api/v1/matches/${match.id}` },
            move: { href: `/api/v1/matches/${match.id}/move`, method: "POST" },
        })
    );
}

module.exports = {
    createMatch,
    listMatches,
    joinMatch,
    getMatch,
    makeMove,
};
