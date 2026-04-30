import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import Modal from "../components/Modal";
import TaskCard from "../components/TaskCard";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"];
const STATUS_LABELS  = { PENDING: "Pending", IN_PROGRESS: "In Progress", COMPLETED: "Completed" };

export default function ProjectDetail() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [project,  setProject]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("tasks");    // tasks | members
  const [filter,   setFilter]   = useState("ALL");

  // Modals
  const [taskModal,   setTaskModal]   = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [editTask,    setEditTask]    = useState(null);  // task being edited/viewed

  const isAdmin = project?.myRole === "ADMIN";

  const load = useCallback(() => {
    api.get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => navigate("/projects"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(load, [load]);

  // ── Task CRUD ──────────────────────────────────────────────────────
  async function handleCreateTask(form) {
    const res = await api.post(`/tasks/project/${id}`, form);
    setProject((prev) => ({ ...prev, tasks: [res.data, ...prev.tasks] }));
  }

  async function handleUpdateTask(taskId, data) {
    const res = await api.patch(`/tasks/${taskId}`, data);
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? res.data : t)),
    }));
  }

  async function handleDeleteTask(taskId) {
    await api.delete(`/tasks/${taskId}`);
    setProject((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    setEditTask(null);
  }

  // ── Member CRUD ────────────────────────────────────────────────────
  async function handleAddMember(email, role) {
    const res = await api.post(`/members/${id}`, { email, role });
    setProject((prev) => ({ ...prev, members: [...prev.members, res.data] }));
  }

  async function handleRemoveMember(memberId) {
    await api.delete(`/members/${id}/${memberId}`);
    setProject((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.userId !== memberId),
    }));
  }

  // ── Delete project ─────────────────────────────────────────────────
  async function handleDeleteProject() {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await api.delete(`/projects/${id}`);
    navigate("/projects");
  }

  if (loading) return <div className="text-gray-500 text-sm animate-pulse">Loading project…</div>;
  if (!project) return null;

  const filteredTasks = filter === "ALL"
    ? project.tasks
    : project.tasks.filter((t) => t.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            className="text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors"
            onClick={() => navigate("/projects")}
          >
            ← All Projects
          </button>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className={`badge ${isAdmin ? "bg-brand/10 text-brand" : "bg-gray-800 text-gray-400"}`}>
            {project.myRole}
          </span>
          {isAdmin && (
            <button className="btn-danger text-xs py-1.5 px-3" onClick={handleDeleteProject}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6 w-fit border border-gray-800">
        {["tasks", "members"].map((t) => (
          <button
            key={t}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? "bg-brand text-white" : "text-gray-400 hover:text-gray-200"
            }`}
            onClick={() => setTab(t)}
          >
            {t} {t === "tasks" ? `(${project.tasks.length})` : `(${project.members.length})`}
          </button>
        ))}
      </div>

      {/* ── TASKS TAB ── */}
      {tab === "tasks" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            {/* Filter */}
            <div className="flex gap-2">
              {["ALL", ...STATUS_OPTIONS].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    filter === s
                      ? "bg-brand text-white"
                      : "bg-gray-800 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {s === "ALL" ? "All" : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            <button className="btn-primary text-sm py-1.5" onClick={() => setTaskModal(true)}>
              + Add Task
            </button>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="card text-center py-12 text-gray-500 text-sm">
              No tasks{filter !== "ALL" ? ` with status "${STATUS_LABELS[filter]}"` : ""}.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={setEditTask} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === "members" && (
        <div>
          <div className="flex justify-end mb-4">
            {isAdmin && (
              <button className="btn-primary text-sm py-1.5" onClick={() => setMemberModal(true)}>
                + Add Member
              </button>
            )}
          </div>
          <div className="space-y-3">
            {project.members.map((m) => (
              <div key={m.id} className="card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold">
                    {m.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${m.role === "ADMIN" ? "bg-brand/10 text-brand" : "bg-gray-800 text-gray-400"}`}>
                    {m.role}
                  </span>
                  {isAdmin && m.userId !== user.id && (
                    <button
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => handleRemoveMember(m.userId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TASK CREATE MODAL ── */}
      {taskModal && (
        <TaskModal
          members={project.members}
          onClose={() => setTaskModal(false)}
          onSave={handleCreateTask}
        />
      )}

      {/* ── TASK EDIT/VIEW MODAL ── */}
      {editTask && (
        <TaskEditModal
          task={editTask}
          members={project.members}
          isAdmin={isAdmin}
          currentUserId={user.id}
          onClose={() => setEditTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* ── ADD MEMBER MODAL ── */}
      {memberModal && (
        <AddMemberModal
          onClose={() => setMemberModal(false)}
          onSave={handleAddMember}
        />
      )}
    </div>
  );
}

// ── Task Create Modal ──────────────────────────────────────────────────────────
function TaskModal({ members, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", description: "", assigneeId: "", dueDate: "", status: "PENDING",
  });
  const [error,  setError]  = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await onSave({
        ...form,
        assigneeId: form.assigneeId || undefined,
        dueDate:    form.dueDate    || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
          <input className="input" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Assign to</label>
            <select className="input" value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
            <select className="input" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Due date</label>
          <input type="date" className="input" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1 justify-center" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
            {saving ? "Creating…" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Task Edit Modal ───────────────────────────────────────────────────────────
function TaskEditModal({ task, members, isAdmin, currentUserId, onClose, onUpdate, onDelete }) {
  const canEdit = isAdmin || task.assigneeId === currentUserId;
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || "",
    status:      task.status,
    assigneeId:  task.assigneeId  || "",
    dueDate:     task.dueDate ? format(parseISO(task.dueDate), "yyyy-MM-dd") : "",
  });
  const [error,  setError]  = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await onUpdate(task.id, {
        ...form,
        assigneeId: form.assigneeId || null,
        dueDate:    form.dueDate    || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Task Details" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
          <input className="input" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            disabled={!isAdmin} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
          <textarea className="input resize-none" rows={2} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={!isAdmin} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
            <select className="input" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              disabled={!canEdit}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Assigned to</label>
            <select className="input" value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              disabled={!isAdmin}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Due date</label>
          <input type="date" className="input" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            disabled={!isAdmin} />
        </div>

        <div className="flex gap-3 pt-1">
          {isAdmin && (
            <button type="button" className="btn-danger px-3 py-2 text-xs"
              onClick={() => onDelete(task.id)}>
              Delete
            </button>
          )}
          <button type="button" className="btn-ghost flex-1 justify-center" onClick={onClose}>
            {canEdit ? "Cancel" : "Close"}
          </button>
          {canEdit && (
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}

// ── Add Member Modal ──────────────────────────────────────────────────────────
function AddMemberModal({ onClose, onSave }) {
  const [email, setEmail] = useState("");
  const [role,  setRole]  = useState("MEMBER");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await onSave(email, role);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Member" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
          <input className="input" type="email" placeholder="teammate@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          <p className="text-xs text-gray-600 mt-1">They must already have an Orbit account.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" className="btn-ghost flex-1 justify-center" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
            {saving ? "Adding…" : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
