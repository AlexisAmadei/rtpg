const express = require("express");
const router = express.Router();

// Example in-memory resource
let todos = [{ id: 1, title: "Hello Express", done: false }];

router.get("/health", (_req, res) => res.json({ ok: true, service: "api", ts: Date.now() }));

router.get("/todos", (_req, res) => res.json(todos));
router.post("/todos", (req, res) => {
    const { title } = req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });
    const todo = { id: Date.now(), title, done: false };
    todos.push(todo);
    res.status(201).json(todo);
});

router.patch("/todos/:id", (req, res) => {
    const id = Number(req.params.id);
    const t = todos.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: "not found" });
    Object.assign(t, req.body || {});
    res.json(t);
});

router.delete("/todos/:id", (req, res) => {
    const id = Number(req.params.id);
    todos = todos.filter(x => x.id !== id);
    res.status(204).end();
});

module.exports = router;
