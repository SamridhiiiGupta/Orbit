require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes    = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes    = require("./routes/task.routes");
const memberRoutes  = require("./routes/member.routes");

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks",    taskRoutes);
app.use("/api/members",  memberRoutes);

// ─── Health check ───────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "Orbit" }));

// ─── Global error handler ───────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Orbit backend running on port ${PORT}`));
