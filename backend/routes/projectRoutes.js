const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/projectController");
const { checkAuth, checkAdmin } = require("../middleware/authMiddleware");

router.get("/", checkAuth, ctrl.list);
router.post("/", checkAuth, checkAdmin, ctrl.create);
router.get("/:id", checkAuth, ctrl.getOne);
router.put("/:id", checkAuth, checkAdmin, ctrl.update);
router.delete("/:id", checkAuth, checkAdmin, ctrl.remove);
router.post("/:id/members", checkAuth, checkAdmin, ctrl.addMember);
router.delete("/:id/members/:userId", checkAuth, checkAdmin, ctrl.removeMember);

module.exports = router;
