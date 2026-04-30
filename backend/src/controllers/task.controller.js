const prisma = require("../lib/prisma");

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
};

// GET /api/tasks/dashboard — all tasks across user's projects for dashboard
async function getDashboard(req, res, next) {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);

    const now = new Date();

    const [allTasks, overdueTasks, statusCounts] = await Promise.all([
      prisma.task.findMany({
        where: { projectId: { in: projectIds } },
        include: taskInclude,
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.task.findMany({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: now },
          status: { not: "COMPLETED" },
        },
        include: taskInclude,
        orderBy: { dueDate: "asc" },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: { projectId: { in: projectIds } },
        _count: { status: true },
      }),
    ]);

    const counts = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    statusCounts.forEach((s) => { counts[s.status] = s._count.status; });

    res.json({
      recentTasks: allTasks,
      overdueTasks,
      statusCounts: counts,
      totalTasks: allTasks.length,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/project/:projectId — all tasks in a project
async function getProjectTasks(req, res, next) {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        ...(status ? { status } : {}),
      },
      include: taskInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks/project/:projectId — create task
async function createTask(req, res, next) {
  try {
    const { projectId } = req.params;
    const { title, description, assigneeId, dueDate, status } = req.body;

    if (!title) return res.status(400).json({ error: "title is required" });

    // Validate assignee is a project member
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId } },
      });
      if (!isMember) {
        return res.status(400).json({ error: "Assignee is not a project member" });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        createdById: req.user.id,
      },
      include: taskInclude,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:taskId — single task
async function getTask(req, res, next) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: taskInclude,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:taskId — update task
async function updateTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { title, description, status, assigneeId, dueDate } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ error: "Task not found" });

    // Members can only update status of their own tasks
    if (req.membership?.role === "MEMBER") {
      if (existing.assigneeId !== req.user.id) {
        return res.status(403).json({ error: "You can only update tasks assigned to you" });
      }
      // Members can only change status, not reassign
      const task = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: taskInclude,
      });
      return res.json(task);
    }

    // Admin: full update
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title       !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status      !== undefined && { status }),
        ...(assigneeId  !== undefined && { assigneeId: assigneeId || null }),
        ...(dueDate     !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: taskInclude,
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:taskId — delete task (Admin only)
async function deleteTask(req, res, next) {
  try {
    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
