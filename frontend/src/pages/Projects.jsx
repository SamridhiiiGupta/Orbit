import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Modal from "../components/Modal";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function load() {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function createProject(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await api.post("/projects", form);
      setProjects((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm animate-pulse">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">◈</div>
          <p className="text-gray-400 font-medium">No projects yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first project to get started</p>
          <button className="btn-primary mt-4" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="card hover:border-gray-700 transition-colors group block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                  {p.name[0].toUpperCase()}
                </div>
                <span className={`badge ${p.myRole === "ADMIN" ? "bg-brand/10 text-brand" : "bg-gray-800 text-gray-400"}`}>
                  {p.myRole}
                </span>
              </div>
              <h3 className="font-semibold text-gray-100 group-hover:text-white">{p.name}</h3>
              {p.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span>👥 {p._count?.members ?? 0} members</span>
                <span>✓ {p._count?.tasks ?? 0} tasks</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={createProject} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Project name *</label>
              <input
                className="input"
                placeholder="e.g. Website Redesign"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="What's this project about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-ghost flex-1 justify-center" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? "Creating…" : "Create Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
