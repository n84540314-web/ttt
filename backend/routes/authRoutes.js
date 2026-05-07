const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const { checkAuth } = require("../middleware/authMiddleware");

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/logout", ctrl.logout);
router.get("/me", checkAuth, ctrl.me);

module.exports = router;
