const router = require("express").Router();
const ctrl = require("../controllers/project.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole, requireMember } = require("../middleware/role.middleware");

router.get("/",                                        auth, ctrl.getProjects);
router.post("/",                                       auth, ctrl.createProject);
router.get("/:projectId",                              auth, requireMember, ctrl.getProject);
router.patch("/:projectId",                            auth, requireRole("ADMIN"), ctrl.updateProject);
router.delete("/:projectId",                           auth, requireRole("ADMIN"), ctrl.deleteProject);

module.exports = router;
