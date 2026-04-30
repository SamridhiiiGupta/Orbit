import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative grain" style={{ background: "#0c0910" }}>
      {/* Background orbs */}
      <div className="orbit-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm transition-colors z-20"
        style={{ color: "#9d8aaf", fontFamily: "DM Sans, sans-serif" }}
        onMouseEnter={e => e.currentTarget.style.color = "#faf0ff"}
        onMouseLeave={e => e.currentTarget.style.color = "#9d8aaf"}
      >
        ← Orbit
      </Link>

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-4 animate-glow"
            style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)", boxShadow: "0 0 30px rgba(192,132,252,0.35)" }}
          >
            ◎
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#faf0ff" }}>
            Welcome back
          </h1>
          <p className="mt-1.5" style={{ color: "#9d8aaf", fontSize: "0.9rem" }}>
            Sign in to your Orbit workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="glass p-6 space-y-4"
          style={{ boxShadow: "0 20px 60px rgba(192,132,252,0.08)" }}
        >
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "#fca5a5",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              className="block mb-1.5 text-xs font-medium"
              style={{ color: "#9d8aaf", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em" }}
            >
              Email address
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label
              className="block mb-1.5 text-xs font-medium"
              style={{ color: "#9d8aaf", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.04em" }}
            >
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cta-btn w-full justify-center mt-1"
            style={{ width: "100%", padding: "13px 24px" }}
          >
            <span>{loading ? "Signing in…" : "Sign in →"}</span>
          </button>
        </div>

        <p className="text-center mt-5" style={{ color: "#9d8aaf", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#c084fc", fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = "#e879f9"}
            onMouseLeave={e => e.currentTarget.style.color = "#c084fc"}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
