const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/taskController");
const { checkAuth, checkAdmin } = require("../middleware/authMiddleware");

router.get("/", checkAuth, ctrl.list);
router.post("/", checkAuth, checkAdmin, ctrl.create);
router.get("/:id", checkAuth, ctrl.getOne);
router.put("/:id", checkAuth, ctrl.update);
router.delete("/:id", checkAuth, checkAdmin, ctrl.remove);
router.post("/:id/submit", checkAuth, ctrl.submit);
router.post("/:id/notes", checkAuth, ctrl.addNote);

module.exports = router;
