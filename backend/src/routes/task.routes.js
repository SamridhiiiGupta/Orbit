const router = require("express").Router();
const ctrl = require("../controllers/task.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole, requireMember } = require("../middleware/role.middleware");

// Dashboard (no project context needed)
router.get("/dashboard", auth, ctrl.getDashboard);

// Project-scoped
router.get("/project/:projectId",  auth, requireMember,       ctrl.getProjectTasks);
router.post("/project/:projectId", auth, requireMember,       ctrl.createTask);

// Single task operations
// NOTE: requireMember needs projectId — we get it from task in controller
// So we just use auth here and do role check inside controller
router.get("/:taskId",    auth, ctrl.getTask);
router.patch("/:taskId",  auth, ctrl.updateTask);
router.delete("/:taskId", auth, ctrl.deleteTask);

module.exports = router;
