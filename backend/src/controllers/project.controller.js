const prisma = require("../lib/prisma");

// GET /api/projects — all projects user is a member of
async function getProjects(req, res, next) {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, tasks: true } },
          },
        },
      },
    });

    const projects = memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
    }));

    res.json(projects);
  } catch (err) {
    next(err);
  }
}

// POST /api/projects — create project (creator becomes ADMIN)
async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Project name is required" });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: "ADMIN" },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    res.status(201).json({ ...project, myRole: "ADMIN" });
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:projectId — single project with members + tasks
async function getProject(req, res, next) {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    const myMembership = project.members.find((m) => m.userId === req.user.id);
    res.json({ ...project, myRole: myMembership?.role });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/projects/:projectId — update project (Admin only)
async function updateProject(req, res, next) {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name, description },
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:projectId — delete project (Admin only)
async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    await prisma.project.delete({ where: { id: projectId } });
    res.json({ message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject };
