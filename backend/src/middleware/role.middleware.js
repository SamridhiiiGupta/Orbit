const prisma = require("../lib/prisma");

// Usage: requireRole("ADMIN") — must come after authMiddleware
// Requires :projectId in req.params
function requireRole(role) {
  return async (req, res, next) => {
    const projectId = req.params.projectId || req.body.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "projectId required" });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Not a member of this project" });
    }

    if (role === "ADMIN" && membership.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.membership = membership;
    next();
  };
}

// Just checks membership (any role)
async function requireMember(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ error: "projectId required" });
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: req.user.id,
        projectId,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ error: "Not a member of this project" });
  }

  req.membership = membership;
  next();
}

module.exports = { requireRole, requireMember };
