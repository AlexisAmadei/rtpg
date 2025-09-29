const { Router } = require("express");
const { withLinks } = require("../../utils/hateoas");

const v1 = Router();
const authRouter = require("./auth");
const matchesRouter = require("./matches");

v1.get("/", (req, res) => {
    res.json(
        withLinks(
            { version: "v1" },
            {
                self: { href: "/api/v1" },
                health: { href: "/api/health" },
                matches: { href: "/api/v1/matches" },
                auth_register: { href: "/api/v1/auth/register", method: "POST" },
                auth_login: { href: "/api/v1/auth/login", method: "POST" },
            }
        )
    );
});

v1.use("/matches", matchesRouter);
v1.use("/auth", authRouter);

module.exports = v1;
