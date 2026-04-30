import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const WORDS = ["smarter.", "together.", "beautifully.", "faster."];

const FEATURES = [
  {
    icon: "◈",
    title: "Project Management",
    desc: "Create projects, define goals, and keep your entire team aligned — all in one place.",
    color: "from-violet-500/20 to-purple-500/10",
    glow: "rgba(139, 92, 246, 0.3)",
  },
  {
    icon: "✦",
    title: "Task Assignment",
    desc: "Create tasks, assign them to members, set due dates, and track progress in real time.",
    color: "from-pink-500/20 to-rose-500/10",
    glow: "rgba(244, 114, 182, 0.3)",
  },
  {
    icon: "⊙",
    title: "Progress Tracking",
    desc: "Visual dashboard showing pending, in-progress, and completed tasks at a glance.",
    color: "from-orange-500/20 to-amber-500/10",
    glow: "rgba(251, 146, 60, 0.3)",
  },
  {
    icon: "⟡",
    title: "Role-Based Access",
    desc: "Admins control everything. Members stay focused. The right access for every person.",
    color: "from-lavender-500/20 to-indigo-500/10",
    glow: "rgba(192, 132, 252, 0.3)",
  },
];

const STEPS = [
  { num: "01", title: "Create a project", desc: "Name it, describe it, invite your team in seconds." },
  { num: "02", title: "Add & assign tasks", desc: "Break work into tasks, assign owners, set deadlines." },
  { num: "03", title: "Track & ship", desc: "Watch progress live on your dashboard. Never miss a beat." },
];

const MOCK_TASKS = [
  { title: "Design system audit", status: "In Progress", user: "S", color: "#c084fc" },
  { title: "API integration", status: "Completed", user: "A", color: "#f472b6" },
  { title: "User testing", status: "Pending", user: "R", color: "#fb923c" },
];

const STATUS_STYLES = {
  "In Progress": { bg: "rgba(96, 165, 250, 0.15)", text: "#93c5fd" },
  "Completed":   { bg: "rgba(34, 197, 94, 0.15)",  text: "#86efac" },
  "Pending":     { bg: "rgba(251, 146, 60, 0.15)",  text: "#fdba74" },
};

export default function Landing() {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % WORDS.length);
        setWordVisible(true);
      }, 380);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen relative grain" style={{ background: "#0c0910" }}>
      {/* Floating orbs */}
      <div className="orbit-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
        style={{
          background: scrolled ? "rgba(12, 9, 16, 0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(192,132,252,0.1)" : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm animate-glow"
            style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)" }}
          >
            ◎
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#faf0ff" }}>
            Orbit
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="secondary-btn"
            style={{ padding: "9px 20px", fontSize: "0.875rem" }}
          >
            Sign in
          </Link>
          <Link to="/register" className="cta-btn" style={{ padding: "9px 22px", fontSize: "0.875rem" }}>
            <span>Get started free</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-up">
          <span className="section-label">✦ Team Collaboration Reimagined</span>
        </div>

        <h1
          className="animate-fade-up-d1 mt-8 font-bold leading-[1.08] tracking-tight"
          style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.8rem, 7vw, 5.5rem)", color: "#faf0ff", maxWidth: "820px" }}
        >
          Organize your team{" "}
          <br />
          <span
            className="gradient-text"
            style={{
              display: "inline-block",
              minWidth: "220px",
              transition: "opacity 0.3s, transform 0.3s",
              opacity: wordVisible ? 1 : 0,
              transform: wordVisible ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            {WORDS[wordIdx]}
          </span>
        </h1>

        <p
          className="animate-fade-up-d2 mt-6 text-lg leading-relaxed"
          style={{ color: "#9d8aaf", maxWidth: "520px" }}
        >
          Orbit brings projects, tasks, and your entire team into one elegant workspace.
          Ship faster. Stay aligned. Never drop the ball.
        </p>

        <div className="animate-fade-up-d3 flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link to="/register" className="cta-btn">
            <span>Start for free →</span>
          </Link>
          <Link to="/login" className="secondary-btn">
            Already have an account?
          </Link>
        </div>

        {/* Floating mock card */}
        <div className="animate-fade-up-d4 mt-16 w-full max-w-sm animate-float">
          <div
            className="glass p-5 text-left"
            style={{ boxShadow: "0 20px 60px rgba(192,132,252,0.12), 0 0 0 1px rgba(192,132,252,0.15)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#faf0ff" }}>
                🚀 Product Launch
              </span>
              <span className="badge" style={{ background: "rgba(192,132,252,0.15)", color: "#c084fc" }}>
                ADMIN
              </span>
            </div>
            <div className="space-y-2.5">
              {MOCK_TASKS.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,235,255,0.04)", border: "1px solid rgba(192,132,252,0.08)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: task.color + "33", color: task.color, fontSize: "0.65rem" }}
                    >
                      {task.user}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#d4b8ff" }}>{task.title}</span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: STATUS_STYLES[task.status].bg,
                      color: STATUS_STYLES[task.status].text,
                      fontSize: "0.65rem",
                    }}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,235,255,0.06)" }}>
                <div className="h-1.5 rounded-full" style={{ width: "66%", background: "linear-gradient(90deg, #c084fc, #f472b6)" }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "#9d8aaf" }}>2/3 done</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12" style={{ color: "#5c4d6e", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          scroll to explore ↓
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label">⊙ Features</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#faf0ff" }}
            >
              Everything your team needs
            </h2>
            <p className="mt-3" style={{ color: "#9d8aaf", maxWidth: "420px", margin: "12px auto 0" }}>
              No bloat. No learning curve. Just the tools that make teams faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card glass relative overflow-hidden group cursor-default"
                style={{ padding: "28px 24px" }}
              >
                <div className="hero-glow" style={{ background: `radial-gradient(circle at center, ${f.glow}, transparent 70%)` }} />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                  style={{
                    background: `linear-gradient(135deg, ${f.glow.replace("0.3","0.15")}, transparent)`,
                    border: "1px solid rgba(192,132,252,0.15)",
                    color: "#c084fc",
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff", marginBottom: 8 }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#9d8aaf", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label">⟡ Process</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#faf0ff" }}
            >
              Up and running in minutes
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg animate-glow"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      background: "rgba(192,132,252,0.1)",
                      border: "1px solid rgba(192,132,252,0.25)",
                      color: "#c084fc",
                    }}
                  >
                    {step.num}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-7 left-full w-full step-line"
                      style={{ width: "calc(100% + 2rem)", marginLeft: "1rem" }}
                    />
                  )}
                </div>
                <h3
                  style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#faf0ff", marginBottom: 8 }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#9d8aaf", lineHeight: 1.6, maxWidth: "200px" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div
            className="glass text-center rounded-3xl overflow-hidden relative"
            style={{ padding: "60px 40px", border: "1px solid rgba(192,132,252,0.25)" }}
          >
            {/* inner glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(192,132,252,0.12) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <h2
                className="font-bold mb-4"
                style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "#faf0ff" }}
              >
                Ready to{" "}
                <span className="shimmer-text">launch your team?</span>
              </h2>
              <p className="mb-8" style={{ color: "#9d8aaf", fontSize: "1.05rem" }}>
                Join teams shipping faster with Orbit. Free to start, no credit card required.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/register" className="cta-btn">
                  <span>Create your workspace →</span>
                </Link>
                <Link to="/login" className="secondary-btn">Sign in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 py-10 text-center" style={{ borderTop: "1px solid rgba(192,132,252,0.08)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)" }}
          >
            ◎
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#faf0ff" }}>Orbit</span>
        </div>
        <p style={{ color: "#5c4d6e", fontSize: "0.8rem" }}>
          Built for teams that move fast. © {new Date().getFullYear()} Orbit.
        </p>
      </footer>
    </div>
  );
}
