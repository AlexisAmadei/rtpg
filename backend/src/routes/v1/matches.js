const { Router } = require("express");
const { requireAuth } = require("../../auth/authController");
const {
    createMatch,
    listMatches,
    joinMatch,
    getMatch,
    makeMove,
} = require("../../matches/matchController");

const router = Router();

router.use(requireAuth); // all match routes require login

router.post("/", createMatch);
router.get("/", listMatches);
router.get("/:id", getMatch);
router.post("/:id/join", joinMatch);
router.post("/:id/move", makeMove);

module.exports = router;
