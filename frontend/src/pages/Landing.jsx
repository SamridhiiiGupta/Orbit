import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/* ─── Data ─────────────────────────────────────────────────────── */
const WORDS = ["smarter.", "together.", "beautifully.", "faster."];

const FEATURES = [
  {
    icon: "◈",
    title: "Project Management",
    desc: "Create projects, define goals, and keep your entire team aligned — all in one place.",
    glow: "rgba(139,92,246,0.35)",
    accent: "#a78bfa",
  },
  {
    icon: "✦",
    title: "Task Assignment",
    desc: "Create tasks, assign them to members, set due dates, and track progress in real time.",
    glow: "rgba(244,114,182,0.35)",
    accent: "#f472b6",
  },
  {
    icon: "⊙",
    title: "Progress Tracking",
    desc: "Visual dashboard showing pending, in-progress, and completed tasks at a glance.",
    glow: "rgba(251,146,60,0.35)",
    accent: "#fb923c",
  },
  {
    icon: "⟡",
    title: "Role-Based Access",
    desc: "Admins control everything. Members stay focused. The right access for every person.",
    glow: "rgba(192,132,252,0.35)",
    accent: "#c084fc",
  },
];

const STEPS = [
  { num: "01", title: "Create a project", desc: "Name it, describe it, invite your team in seconds." },
  { num: "02", title: "Add & assign tasks", desc: "Break work into tasks, assign owners, set deadlines." },
  { num: "03", title: "Track & ship", desc: "Watch progress live on your dashboard. Never miss a beat." },
];

const STATS = [
  { value: 2400, suffix: "+", label: "Tasks completed" },
  { value: 180,  suffix: "+", label: "Teams onboarded" },
  { value: 99,   suffix: "%", label: "Uptime" },
  { value: 3,    suffix: "s", label: "Avg setup time" },
];

const TESTIMONIALS = [
  {
    quote: "Orbit replaced three tools we were using. Our team went from chaotic to coordinated in a single afternoon.",
    name: "Priya M.",
    role: "Product Lead @ Finstack",
    avatar: "P",
    color: "#c084fc",
  },
  {
    quote: "The role-based access is exactly what we needed. Admins control the big picture, members stay focused.",
    name: "Arjun S.",
    role: "CTO @ Loopbase",
    avatar: "A",
    color: "#f472b6",
  },
  {
    quote: "Beautiful, fast, and it just works. I've demoed this to three other teams who immediately wanted to switch.",
    name: "Neha R.",
    role: "Engineering Manager @ Vaultly",
    avatar: "N",
    color: "#fb923c",
  },
];

const ACTIVITY_ITEMS = [
  { user: "S", name: "Samridhi", action: "completed", task: "Design system audit", color: "#c084fc", status: "Completed", statusColor: "#34d399" },
  { user: "A", name: "Arjun",    action: "started",   task: "API integration",    color: "#f472b6", status: "In Progress", statusColor: "#c084fc" },
  { user: "N", name: "Neha",     action: "created",   task: "User testing plan",  color: "#fb923c", status: "Pending",     statusColor: "#f59e0b" },
  { user: "R", name: "Rohan",    action: "assigned",  task: "Deploy to staging",  color: "#34d399", status: "Pending",     statusColor: "#f59e0b" },
  { user: "S", name: "Samridhi", action: "completed", task: "Onboarding flow",    color: "#c084fc", status: "Completed",   statusColor: "#34d399" },
];

const MOCK_TASKS = [
  { title: "Design system audit", status: "In Progress", user: "S", color: "#c084fc" },
  { title: "API integration",     status: "Completed",   user: "A", color: "#f472b6" },
  { title: "User testing",        status: "Pending",     user: "R", color: "#fb923c" },
];

const STATUS_STYLES = {
  "In Progress": { bg: "rgba(192,132,252,0.15)", text: "#c084fc" },
  "Completed":   { bg: "rgba(52,211,153,0.15)",  text: "#34d399" },
  "Pending":     { bg: "rgba(251,146,60,0.15)",  text: "#fb923c" },
};

/* ─── Count-up hook ─────────────────────────────────────────────── */
function useCountUp(target, active, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, active, duration]);
  return val;
}

/* ─── Scroll reveal hook ────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── 3D tilt hook ──────────────────────────────────────────────── */
function useTilt() {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)";
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

/* ─── Canvas Particles ──────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const particles = [];
    const COUNT = 55;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight * 3;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.5 + 0.4,
        dx: (Math.random() - 0.5) * 0.18,
        dy: (Math.random() - 0.5) * 0.18,
        opacity: Math.random() * 0.35 + 0.05,
        color: ["#c084fc","#f472b6","#fb923c","#a78bfa"][Math.floor(Math.random()*4)],
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2,"0");
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 1,
        opacity: 0.6,
      }}
    />
  );
}

/* ─── Stat card ─────────────────────────────────────────────────── */
function StatCard({ value, suffix, label, active }) {
  const count = useCountUp(value, active);
  return (
    <div className="glass text-center rounded-2xl px-6 py-7" style={{ transition: "transform 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.4rem", color: "#faf0ff", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#9d8aaf", marginTop: 6 }}>{label}</div>
    </div>
  );
}

/* ─── Live activity feed ─────────────────────────────────────────── */
function ActivityFeed() {
  const [items, setItems] = useState(ACTIVITY_ITEMS.slice(0, 3));
  const [entering, setEntering] = useState(false);
  const indexRef = useRef(3);

  useEffect(() => {
    const id = setInterval(() => {
      setEntering(true);
      setTimeout(() => {
        const next = ACTIVITY_ITEMS[indexRef.current % ACTIVITY_ITEMS.length];
        indexRef.current++;
        setItems(prev => [next, ...prev.slice(0, 2)]);
        setEntering(false);
      }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass rounded-2xl p-5" style={{ minHeight: 210 }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#34d399" }} />
        <span style={{ fontSize: "0.75rem", color: "#9d8aaf", fontFamily: "DM Sans, sans-serif" }}>
          Live activity
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}-${indexRef.current}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,235,255,0.04)",
              border: "1px solid rgba(192,132,252,0.08)",
              transition: "all 0.35s ease",
              opacity: i === 0 && entering ? 0 : 1,
              transform: i === 0 && entering ? "translateY(-6px)" : "translateY(0)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0"
              style={{ background: item.color + "22", color: item.color, fontSize: "0.7rem" }}
            >
              {item.user}
            </div>
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: "0.78rem", color: "#d4b8ff" }}>{item.name}</span>
              <span style={{ fontSize: "0.78rem", color: "#5c4d6e" }}> {item.action} </span>
              <span style={{ fontSize: "0.78rem", color: "#faf0ff", fontWeight: 500 }} className="truncate">{item.task}</span>
            </div>
            <span
              className="badge shrink-0"
              style={{ background: item.statusColor + "22", color: item.statusColor, fontSize: "0.62rem", padding: "3px 8px" }}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Feature card with 3D tilt ─────────────────────────────────── */
function FeatureCard({ f, i, visible }) {
  const tilt = useTilt();
  return (
    <div
      {...tilt}
      ref={tilt.ref}
      className="feature-card glass relative overflow-hidden group cursor-default"
      style={{
        padding: "28px 24px",
        transition: "transform 0.15s ease, box-shadow 0.3s ease, opacity 0.6s ease, translate 0.6s ease",
        transitionDelay: `${i * 0.1}s`,
        opacity: visible ? 1 : 0,
        translate: visible ? "0 0" : "0 30px",
        willChange: "transform",
      }}
    >
      <div
        className="hero-glow"
        style={{ background: `radial-gradient(circle at center, ${f.glow}, transparent 70%)` }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
        style={{
          background: `${f.accent}18`,
          border: `1px solid ${f.accent}30`,
          color: f.accent,
          transition: "all 0.3s",
        }}
      >
        {f.icon}
      </div>
      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff", marginBottom: 8 }}>
        {f.title}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#9d8aaf", lineHeight: 1.6 }}>{f.desc}</p>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */
export default function Landing() {
  const [wordIdx,     setWordIdx]     = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [scrolled,    setScrolled]    = useState(false);

  // Section reveal refs
  const [featRef,    featVisible]    = useReveal(0.1);
  const [stepsRef,   stepsVisible]   = useReveal(0.1);
  const [statsRef,   statsVisible]   = useReveal(0.2);
  const [demoRef,    demoVisible]    = useReveal(0.15);
  const [testiRef,   testiVisible]   = useReveal(0.1);
  const [ctaRef,     ctaVisible]     = useReveal(0.2);

  /* Word cycling */
  useEffect(() => {
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % WORDS.length); setWordVisible(true); }, 380);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  /* Navbar scroll */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen relative grain" style={{ background: "#0c0910", overflowX: "hidden" }}>

      {/* ── Particle canvas ──────────────────────────────────────── */}
      <ParticleCanvas />

      {/* ── Animated orbs ────────────────────────────────────────── */}
      <div className="orbit-bg" style={{ zIndex: 2 }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        {/* Extra depth orbs */}
        <div className="orb" style={{
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)",
          top: "60%", left: "20%",
          animation: "orbFloat 22s ease-in-out infinite reverse",
        }} />
        <div className="orb" style={{
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)",
          top: "80%", right: "15%",
          animation: "orbFloat 18s ease-in-out infinite 4s",
        }} />
      </div>

      {/* ── Grain overlay ────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 3,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.028,
        }}
      />

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500"
        style={{
          background: scrolled ? "rgba(12,9,16,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
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
          <Link to="/login" className="secondary-btn" style={{ padding: "9px 20px", fontSize: "0.875rem" }}>
            Sign in
          </Link>
          <Link to="/register" className="cta-btn" style={{ padding: "9px 22px", fontSize: "0.875rem" }}>
            <span>Get started free</span>
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center"
        style={{ zIndex: 10 }}
      >
        <div className="animate-fade-up">
          <span className="section-label">✦ Team Collaboration Reimagined</span>
        </div>

        <h1
          className="animate-fade-up-d1 mt-8 font-bold leading-[1.08] tracking-tight"
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            color: "#faf0ff",
            maxWidth: "820px",
          }}
        >
          Organize your team{" "}
          <br />
          <span
            className="gradient-text"
            style={{
              display: "inline-block",
              minWidth: "220px",
              transition: "opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1)",
              opacity: wordVisible ? 1 : 0,
              transform: wordVisible ? "translateY(0)" : "translateY(-10px)",
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

        {/* Floating hero card */}
        <div className="animate-fade-up-d4 mt-16 w-full max-w-sm animate-float" style={{ filter: "drop-shadow(0 24px 48px rgba(192,132,252,0.18))" }}>
          <div
            className="glass p-5 text-left"
            style={{ boxShadow: "0 20px 60px rgba(192,132,252,0.14), 0 0 0 1px rgba(192,132,252,0.18)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#faf0ff" }}>
                🚀 Product Launch
              </span>
              <span className="badge" style={{ background: "rgba(192,132,252,0.15)", color: "#c084fc" }}>ADMIN</span>
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
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                      style={{ background: task.color + "28", color: task.color, fontSize: "0.65rem" }}
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
                <div className="h-1.5 rounded-full" style={{ width: "66%", background: "linear-gradient(90deg,#c084fc,#f472b6)", transition: "width 1s ease" }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "#9d8aaf" }}>2/3 done</span>
            </div>
          </div>
        </div>

        <div className="mt-12" style={{ color: "#5c4d6e", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          scroll to explore ↓
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section ref={statsRef} className="relative px-6 py-16" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{
              transition: "opacity 0.7s ease, translate 0.7s ease",
              opacity: statsVisible ? 1 : 0,
              translate: statsVisible ? "0 0" : "0 24px",
            }}
          >
            {STATS.map((s, i) => (
              <StatCard key={i} {...s} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section ref={featRef} className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto">
          <div
            className="text-center mb-16"
            style={{
              transition: "opacity 0.6s ease, translate 0.6s ease",
              opacity: featVisible ? 1 : 0,
              translate: featVisible ? "0 0" : "0 20px",
            }}
          >
            <span className="section-label">⊙ Features</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#faf0ff" }}
            >
              Everything your team needs
            </h2>
            <p className="mt-3" style={{ color: "#9d8aaf", maxWidth: "420px", margin: "12px auto 0" }}>
              No bloat. No learning curve. Just the tools that make teams faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} f={f} i={i} visible={featVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO + ACTIVITY ─────────────────────────────────── */}
      <section ref={demoRef} className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="text-center mb-14"
            style={{
              transition: "opacity 0.6s ease, translate 0.6s ease",
              opacity: demoVisible ? 1 : 0,
              translate: demoVisible ? "0 0" : "0 20px",
            }}
          >
            <span className="section-label">⟡ Live Preview</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#faf0ff" }}
            >
              Watch your team move
            </h2>
            <p className="mt-3" style={{ color: "#9d8aaf" }}>
              Real-time updates. Always in sync.
            </p>
          </div>

          <div
            className="grid md:grid-cols-2 gap-6"
            style={{
              transition: "opacity 0.7s ease 0.1s, translate 0.7s ease 0.1s",
              opacity: demoVisible ? 1 : 0,
              translate: demoVisible ? "0 0" : "0 30px",
            }}
          >
            {/* Activity feed */}
            <ActivityFeed />

            {/* Mini project view */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#faf0ff" }}>
                  📐 Website Redesign
                </span>
                <div className="flex items-center gap-1.5">
                  {["#c084fc","#f472b6","#fb923c"].map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 -ml-1.5 first:ml-0" style={{ background: c + "30", borderColor: c + "60" }}>
                      <div className="w-full h-full rounded-full flex items-center justify-center text-[9px] font-bold" style={{ color: c }}>
                        {["S","A","N"][i]}
                      </div>
                    </div>
                  ))}
                  <span style={{ fontSize: "0.7rem", color: "#9d8aaf", marginLeft: 4 }}>3 members</span>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {[
                  { title: "Homepage redesign",   status: "Completed",   pct: 100, color: "#34d399" },
                  { title: "Component library",   status: "In Progress", pct: 65,  color: "#c084fc" },
                  { title: "Mobile responsive",   status: "In Progress", pct: 40,  color: "#c084fc" },
                  { title: "Performance audit",   status: "Pending",     pct: 0,   color: "#f59e0b" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,235,255,0.03)", border: "1px solid rgba(192,132,252,0.07)" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: "0.8rem", color: "#d4b8ff" }}>{t.title}</span>
                      <span className="badge" style={{ background: t.color + "18", color: t.color, fontSize: "0.6rem" }}>
                        {t.status}
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,235,255,0.06)" }}>
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: demoVisible ? `${t.pct}%` : "0%",
                          background: t.color,
                          transition: `width 1.2s ease ${i * 0.15 + 0.3}s`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: "#9d8aaf" }}>
                <span>Overall progress</span>
                <span style={{ color: "#c084fc", fontWeight: 600 }}>51%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,235,255,0.06)" }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: demoVisible ? "51%" : "0%",
                    background: "linear-gradient(90deg, #c084fc, #f472b6)",
                    transition: "width 1.5s ease 0.5s",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section ref={stepsRef} className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div
            className="text-center mb-16"
            style={{
              transition: "opacity 0.6s ease, translate 0.6s ease",
              opacity: stepsVisible ? 1 : 0,
              translate: stepsVisible ? "0 0" : "0 20px",
            }}
          >
            <span className="section-label">⟡ Process</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#faf0ff" }}
            >
              Up and running in minutes
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center text-center"
                style={{
                  transition: `opacity 0.6s ease ${i * 0.15}s, translate 0.6s ease ${i * 0.15}s`,
                  opacity: stepsVisible ? 1 : 0,
                  translate: stepsVisible ? "0 0" : "0 24px",
                }}
              >
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
                    <div className="hidden md:block absolute top-7 left-full step-line" style={{ width: "calc(100% + 2rem)", marginLeft: "1rem" }} />
                  )}
                </div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1.05rem", color: "#faf0ff", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "#9d8aaf", lineHeight: 1.6, maxWidth: "200px" }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section ref={testiRef} className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto">
          <div
            className="text-center mb-14"
            style={{
              transition: "opacity 0.6s ease, translate 0.6s ease",
              opacity: testiVisible ? 1 : 0,
              translate: testiVisible ? "0 0" : "0 20px",
            }}
          >
            <span className="section-label">✦ Testimonials</span>
            <h2
              className="mt-5 font-bold"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#faf0ff" }}
            >
              Teams that moved faster
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6"
                style={{
                  transition: `all 0.6s ease ${i * 0.12}s`,
                  opacity: testiVisible ? 1 : 0,
                  translate: testiVisible ? "0 0" : "0 28px",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px ${t.color}18`;
                  e.currentTarget.style.borderColor = `${t.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} style={{ color: t.color, fontSize: "0.75rem" }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: "0.875rem", color: "#c4a8d4", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: t.color + "22", color: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#faf0ff" }}>{t.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#9d8aaf" }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section ref={ctaRef} className="relative px-6 py-20" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="glass text-center rounded-3xl overflow-hidden relative"
            style={{
              padding: "60px 40px",
              border: "1px solid rgba(192,132,252,0.25)",
              transition: "opacity 0.7s ease, translate 0.7s ease",
              opacity: ctaVisible ? 1 : 0,
              translate: ctaVisible ? "0 0" : "0 24px",
              boxShadow: "0 0 80px rgba(192,132,252,0.08)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(192,132,252,0.14) 0%, transparent 70%)" }}
            />
            <div className="relative z-10">
              <h2
                className="font-bold mb-4"
                style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "#faf0ff" }}
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

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="relative px-6 py-10 text-center" style={{ zIndex: 10, borderTop: "1px solid rgba(192,132,252,0.08)" }}>
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
