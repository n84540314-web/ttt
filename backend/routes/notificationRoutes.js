const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/notificationController");
const { checkAuth } = require("../middleware/authMiddleware");

router.get("/", checkAuth, ctrl.list);
router.post("/read", checkAuth, ctrl.markRead);

module.exports = router;
