const { Router } = require("express");
const { withLinks } = require("../../utils/hateoas");

const v1 = Router();
const authRouter = require("./auth");
const matchesRouter = require("./matches");

v1.get("/", (req, res) => {
    const { respond } = require("../../utils/respond");
    const entry = { version: "v1" };
    const links = {
        self: { href: "/api/v1" },
        health: { href: "/api/health" },
        matches: { href: "/api/v1/matches" },
        matches_csv: { href: "/api/v1/matches", type: "text/csv" },
    };
    respond(req, res, entry, links);
});

v1.use("/matches", matchesRouter);
v1.use("/auth", authRouter);

module.exports = v1;
