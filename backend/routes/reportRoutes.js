const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { checkAuth, checkAdmin } = require("../middleware/authMiddleware");

router.get("/dashboard", checkAuth, ctrl.dashboard);
router.get("/performance", checkAuth, checkAdmin, ctrl.performance);

module.exports = router;
