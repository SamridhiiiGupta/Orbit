const prisma = require("../lib/prisma");

// GET /api/members/:projectId — list members
async function getMembers(req, res, next) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId: req.params.projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(members);
  } catch (err) {
    next(err);
  }
}

// POST /api/members/:projectId — add member by email (Admin only)
async function addMember(req, res, next) {
  try {
    const { projectId } = req.params;
    const { email, role = "MEMBER" } = req.body;

    if (!email) return res.status(400).json({ error: "email is required" });
    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ error: "role must be ADMIN or MEMBER" });
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: targetUser.id, projectId } },
    });
    if (existing) {
      return res.status(409).json({ error: "User is already a member" });
    }

    const member = await prisma.projectMember.create({
      data: { userId: targetUser.id, projectId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/members/:projectId/:userId — change role (Admin only)
async function updateMemberRole(req, res, next) {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ error: "role must be ADMIN or MEMBER" });
    }

    // Prevent removing the last admin
    if (role === "MEMBER") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" },
      });
      const targetIsAdmin = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });
      if (adminCount === 1 && targetIsAdmin?.role === "ADMIN") {
        return res.status(400).json({ error: "Cannot demote the last admin" });
      }
    }

    const member = await prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json(member);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/members/:projectId/:userId — remove member (Admin only)
async function removeMember(req, res, next) {
  try {
    const { projectId, userId } = req.params;

    // Prevent removing the last admin
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (member?.role === "ADMIN") {
      const adminCount = await prisma.projectMember.count({
        where: { projectId, role: "ADMIN" },
      });
      if (adminCount === 1) {
        return res.status(400).json({ error: "Cannot remove the last admin" });
      }
    }

    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });

    res.json({ message: "Member removed" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMembers, addMember, updateMemberRole, removeMember };
