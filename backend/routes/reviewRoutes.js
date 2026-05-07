const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reviewController");
const { checkAuth, checkAdmin } = require("../middleware/authMiddleware");

router.get("/pending", checkAuth, checkAdmin, ctrl.pending);
router.post("/:id/approve", checkAuth, checkAdmin, ctrl.approve);
router.post("/:id/rework", checkAuth, checkAdmin, ctrl.rework);

module.exports = router;
