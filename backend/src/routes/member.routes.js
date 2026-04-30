const router = require("express").Router();
const ctrl = require("../controllers/member.controller");
const auth = require("../middleware/auth.middleware");
const { requireRole, requireMember } = require("../middleware/role.middleware");

router.get("/:projectId",              auth, requireMember,       ctrl.getMembers);
router.post("/:projectId",             auth, requireRole("ADMIN"), ctrl.addMember);
router.patch("/:projectId/:userId",    auth, requireRole("ADMIN"), ctrl.updateMemberRole);
router.delete("/:projectId/:userId",   auth, requireRole("ADMIN"), ctrl.removeMember);

module.exports = router;
