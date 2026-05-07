const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/activityController");
const { checkAuth } = require("../middleware/authMiddleware");

router.get("/", checkAuth, ctrl.list);

module.exports = router;
