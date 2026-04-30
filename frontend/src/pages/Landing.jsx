import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const WORDS = ["smarter.", "together.", "beautifully.", "faster."];

const FEATURES = [
  { icon: "◈", title: "Project Management", desc: "Create projects, define goals, and keep your entire team aligned — all in one place.", glow: "rgba(139,92,246,0.35)" },
  { icon: "✦", title: "Task Assignment",    desc: "Create tasks, assign them to members, set due dates, and track progress in real time.", glow: "rgba(244,114,182,0.35)" },
  { icon: "⊙", title: "Progress Tracking",  desc: "Visual dashboard showing pending, in-progress, and completed tasks at a glance.", glow: "rgba(251,146,60,0.35)" },
  { icon: "⟡", title: "Role-Based Access",  desc: "Admins control everything. Members stay focused. The right access for every person.", glow: "rgba(192,132,252,0.35)" },
];

const STEPS = [
  { num: "01", title: "Create a project",   desc: "Name it, describe it, invite your team in seconds." },
  { num: "02", title: "Add & assign tasks", desc: "Break work into tasks, assign owners, set deadlines." },
  { num: "03", title: "Track & ship",       desc: "Watch progress live on your dashboard. Never miss a beat." },
];

const TESTIMONIALS = [
  { name: "Priya S.",  role: "Product Lead @ Nexify",    text: "Orbit replaced three tools we were juggling. The role-based access alone saved us hours every week.", avatar: "P", color: "#c084fc" },
  { name: "Arjun M.", role: "CTO @ BuildFast",           text: "The dashboard is the cleanest I have ever used. Our team onboarded in under 10 minutes. Zero friction.", avatar: "A", color: "#f472b6" },
  { name: "Riya K.",  role: "Design Lead @ Studiocraft", text: "Finally a task manager that actually looks premium. My team stopped using Notion for project tracking.", avatar: "R", color: "#fb923c" },
];

const STATS = [
  { value: "10K+",  label: "Tasks tracked"   },
  { value: "500+",  label: "Teams onboarded" },
  { value: "99.9%", label: "Uptime"          },
  { value: "4.9 star", label: "Avg. rating"  },
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

const LIVE_EVENTS = [
  { user: "Samridhi", action: "completed", task: "Landing page redesign", time: "just now", color: "#34d399" },
  { user: "Arjun",    action: "assigned",  task: "API rate limiting",      time: "1m ago",   color: "#c084fc" },
  { user: "Priya",    action: "created",   task: "Q3 roadmap review",      time: "3m ago",   color: "#f472b6" },
  { user: "Riya",     action: "updated",   task: "Mobile responsiveness",  time: "5m ago",   color: "#fb923c" },
  { user: "Dev",      action: "completed", task: "Auth flow testing",      time: "8m ago",   color: "#34d399" },
];

function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const COLORS = ["#c084fc","#f472b6","#fb923c","#818cf8","#e879f9"];
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.15,
    }));
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = (1 - dist / 110) * 0.06;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.5 }} />;
}

function TiltCard({ children, style, className }) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const card = ref.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const rotX = (((e.clientY - rect.top)  / rect.height) - 0.5) * -10;
    const rotY = (((e.clientX - rect.left) / rect.width)  - 0.5) *  10;
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    card.style.boxShadow = "0 24px 50px rgba(192,132,252,0.14)";
  }, []);
  const handleLeave = useCallback(() => {
    const card = ref.current; if (!card) return;
    card.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
    card.style.boxShadow = "";
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ ...style, transition:"transform 0.18s ease, box-shadow 0.18s ease", willChange:"transform" }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease` }}>
      {children}
    </div>
  );
}

function LiveFeed() {
  const [events, setEvents] = useState(LIVE_EVENTS);
  const [pulse,  setPulse]  = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      const e = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setEvents(prev => [{ ...e, time: "just now" }, ...prev.slice(0, 4)]);
      setPulse(true); setTimeout(() => setPulse(false), 600);
    }, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(192,132,252,0.15)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom:"1px solid rgba(192,132,252,0.08)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background:"#34d399", boxShadow: pulse ? "0 0 8px #34d399" : "none", transition:"box-shadow 0.3s" }} />
        <span style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"0.85rem", color:"#faf0ff" }}>Live Activity</span>
        <span className="badge ml-auto" style={{ background:"rgba(52,211,153,0.12)", color:"#34d399", fontSize:"0.65rem" }}>LIVE</span>
      </div>
      <div>
        {events.map((ev, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3"
            style={{ background: i === 0 ? "rgba(192,132,252,0.04)" : "transparent", borderBottom: i < events.length - 1 ? "1px solid rgba(192,132,252,0.06)" : "none", transition:"background 0.4s" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: ev.color + "22", color: ev.color, fontFamily:"Syne, sans-serif" }}>{ev.user[0]}</div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize:"0.78rem", color:"#d4b8ff", lineHeight:1.4 }}>
                <span style={{ color: ev.color, fontWeight:600 }}>{ev.user}</span> {ev.action} <span style={{ color:"#faf0ff" }}>"{ev.task}"</span>
              </p>
            </div>
            <span style={{ fontSize:"0.68rem", color:"#5c4d6e", whiteSpace:"nowrap" }}>{ev.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [wordIdx,     setWordIdx]     = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [scrolled,    setScrolled]    = useState(false);
  const [mousePos,    setMousePos]    = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % WORDS.length); setWordVisible(true); }, 380);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div className="min-h-screen relative grain" style={{ background:"#0c0910", overflowX:"hidden" }}>
      <ParticleCanvas />
      <div className="orbit-bg">
        <div className="orb orb-1" style={{ transform:`translate(${mousePos.x*30}px,${mousePos.y*20}px)` }} />
        <div className="orb orb-2" style={{ transform:`translate(${-mousePos.x*20}px,${mousePos.y*15}px)` }} />
        <div className="orb orb-3" style={{ transform:`translate(${mousePos.x*15}px,${-mousePos.y*25}px)` }} />
        <div className="orb orb-4" style={{ transform:`translate(${-mousePos.x*10}px,${-mousePos.y*10}px)` }} />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
        style={{ background: scrolled ? "rgba(12,9,16,0.9)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? "1px solid rgba(192,132,252,0.1)" : "none" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm animate-glow"
            style={{ background:"linear-gradient(135deg,#c084fc,#f472b6)" }}>◎</div>
          <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, fontSize:"1.15rem", color:"#faf0ff" }}>Orbit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"    className="secondary-btn" style={{ padding:"9px 20px", fontSize:"0.875rem" }}>Sign in</Link>
          <Link to="/register" className="cta-btn"       style={{ padding:"9px 22px", fontSize:"0.875rem" }}><span>Get started free</span></Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-up"><span className="section-label">Team Collaboration Reimagined</span></div>
        <h1 className="animate-fade-up-d1 mt-8 font-bold leading-tight tracking-tight"
          style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(2.8rem,7vw,5.5rem)", color:"#faf0ff", maxWidth:"820px" }}>
          Organize your team{" "}<br />
          <span className="gradient-text" style={{ display:"inline-block", minWidth:"220px", transition:"opacity 0.3s, transform 0.3s", opacity: wordVisible ? 1 : 0, transform: wordVisible ? "translateY(0)" : "translateY(-8px)" }}>
            {WORDS[wordIdx]}
          </span>
        </h1>
        <p className="animate-fade-up-d2 mt-6 text-lg leading-relaxed" style={{ color:"#9d8aaf", maxWidth:"520px" }}>
          Orbit brings projects, tasks, and your entire team into one elegant workspace. Ship faster. Stay aligned. Never drop the ball.
        </p>
        <div className="animate-fade-up-d3 flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link to="/register" className="cta-btn"><span>Start for free</span></Link>
          <Link to="/login"    className="secondary-btn">Already have an account?</Link>
        </div>

        {/* Floating mock card */}
        <div className="animate-fade-up-d4 mt-16 w-full max-w-sm animate-float">
          <div className="glass p-5 text-left" style={{ boxShadow:"0 20px 60px rgba(192,132,252,0.14), 0 0 0 1px rgba(192,132,252,0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"0.9rem", color:"#faf0ff" }}>Product Launch</span>
              <span className="badge" style={{ background:"rgba(192,132,252,0.15)", color:"#c084fc" }}>ADMIN</span>
            </div>
            <div className="space-y-2.5">
              {MOCK_TASKS.map((task, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background:"rgba(255,235,255,0.04)", border:"1px solid rgba(192,132,252,0.08)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                      style={{ background:task.color+"22", color:task.color, fontSize:"0.65rem", fontFamily:"Syne, sans-serif" }}>{task.user}</div>
                    <span style={{ fontSize:"0.8rem", color:"#d4b8ff" }}>{task.title}</span>
                  </div>
                  <span className="badge" style={{ background:STATUS_STYLES[task.status].bg, color:STATUS_STYLES[task.status].text, fontSize:"0.65rem" }}>{task.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background:"rgba(255,235,255,0.06)" }}>
                <div className="h-1.5 rounded-full" style={{ width:"66%", background:"linear-gradient(90deg,#c084fc,#f472b6)" }} />
              </div>
              <span style={{ fontSize:"0.7rem", color:"#9d8aaf" }}>2/3 done</span>
            </div>
          </div>
        </div>
        <div className="mt-10" style={{ color:"#5c4d6e", fontSize:"0.75rem", letterSpacing:"0.1em" }}>scroll to explore</div>
      </section>

      {/* STATS */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="glass rounded-2xl px-8 py-7" style={{ border:"1px solid rgba(192,132,252,0.15)" }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center">
                    <p style={{ fontFamily:"Syne, sans-serif", fontWeight:800, fontSize:"2rem", background:"linear-gradient(135deg,#c084fc,#f472b6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{s.value}</p>
                    <p style={{ fontSize:"0.78rem", color:"#9d8aaf", marginTop:4 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="section-label">Features</span>
            <h2 className="mt-5 font-bold" style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#faf0ff" }}>Everything your team needs</h2>
            <p style={{ color:"#9d8aaf", maxWidth:"420px", margin:"12px auto 0" }}>No bloat. No learning curve. Just the tools that make teams faster.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <TiltCard className="feature-card glass relative overflow-hidden cursor-default" style={{ padding:"28px 24px", height:"100%" }}>
                  <div className="hero-glow" style={{ background:`radial-gradient(circle at center,${f.glow},transparent 70%)` }} />
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                    style={{ background:f.glow.replace("0.35","0.12"), border:"1px solid rgba(192,132,252,0.15)", color:"#c084fc" }}>{f.icon}</div>
                  <h3 style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"1rem", color:"#faf0ff", marginBottom:8 }}>{f.title}</h3>
                  <p style={{ fontSize:"0.85rem", color:"#9d8aaf", lineHeight:1.6 }}>{f.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="section-label">Live Preview</span>
            <h2 className="mt-5 font-bold" style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#faf0ff" }}>Watch your team in motion</h2>
            <p style={{ color:"#9d8aaf", marginTop:8 }}>Real-time updates. Always in sync.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Reveal delay={0.1}><LiveFeed /></Reveal>
            <Reveal delay={0.2}>
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5">
                  <p style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"0.85rem", color:"#faf0ff", marginBottom:16 }}>Sprint Overview</p>
                  {[{label:"Completed",pct:62,color:"#34d399"},{label:"In Progress",pct:25,color:"#c084fc"},{label:"Pending",pct:13,color:"#fb923c"}].map((bar,i) => (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize:"0.75rem", color:"#9d8aaf" }}>{bar.label}</span>
                        <span style={{ fontSize:"0.75rem", color:bar.color, fontWeight:600 }}>{bar.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,235,255,0.06)" }}>
                        <div style={{ height:"100%", width:`${bar.pct}%`, background:bar.color, borderRadius:999, transition:"width 1.2s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-2xl p-5">
                  <p style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"0.85rem", color:"#faf0ff", marginBottom:12 }}>Team Members</p>
                  {[{name:"Samridhi G.",tasks:4,color:"#c084fc",role:"Admin"},{name:"Arjun M.",tasks:3,color:"#f472b6",role:"Member"},{name:"Priya S.",tasks:2,color:"#fb923c",role:"Member"}].map((m,i) => (
                    <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: i < 2 ? "1px solid rgba(192,132,252,0.06)" : "none" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background:m.color+"22", color:m.color, fontFamily:"Syne, sans-serif" }}>{m.name[0]}</div>
                      <div className="flex-1"><p style={{ fontSize:"0.8rem", color:"#faf0ff" }}>{m.name}</p></div>
                      <span className="badge" style={{ fontSize:"0.65rem", background:m.color+"18", color:m.color }}>{m.role}</span>
                      <span style={{ fontSize:"0.72rem", color:"#9d8aaf" }}>{m.tasks} tasks</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="section-label">Process</span>
            <h2 className="mt-5 font-bold" style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#faf0ff" }}>Up and running in minutes</h2>
          </Reveal>
          <div className="flex flex-col md:flex-row items-start gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.15} className="flex-1 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg animate-glow"
                    style={{ fontFamily:"Syne, sans-serif", background:"rgba(192,132,252,0.1)", border:"1px solid rgba(192,132,252,0.25)", color:"#c084fc" }}>{step.num}</div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-full step-line" style={{ width:"calc(100% + 2rem)", marginLeft:"1rem" }} />
                  )}
                </div>
                <h3 style={{ fontFamily:"Syne, sans-serif", fontWeight:600, fontSize:"1.05rem", color:"#faf0ff", marginBottom:8 }}>{step.title}</h3>
                <p style={{ fontSize:"0.85rem", color:"#9d8aaf", lineHeight:1.6, maxWidth:"200px" }}>{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="section-label">Social Proof</span>
            <h2 className="mt-5 font-bold" style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#faf0ff" }}>Loved by teams everywhere</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <TiltCard className="glass rounded-2xl p-6" style={{ cursor:"default", height:"100%" }}>
                  <div style={{ color:t.color, fontSize:"1.6rem", lineHeight:1, marginBottom:16 }}>&#10077;</div>
                  <p style={{ fontSize:"0.875rem", color:"#d4b8ff", lineHeight:1.75, marginBottom:20 }}>{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                      style={{ background:t.color+"22", color:t.color, fontFamily:"Syne, sans-serif" }}>{t.avatar}</div>
                    <div>
                      <p style={{ fontSize:"0.83rem", fontWeight:600, color:"#faf0ff" }}>{t.name}</p>
                      <p style={{ fontSize:"0.72rem", color:"#9d8aaf" }}>{t.role}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="glass text-center rounded-3xl overflow-hidden relative" style={{ padding:"60px 40px", border:"1px solid rgba(192,132,252,0.25)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(192,132,252,0.14) 0%,transparent 70%)" }} />
              <div className="relative z-10">
                <h2 className="font-bold mb-4" style={{ fontFamily:"Syne, sans-serif", fontSize:"clamp(1.8rem,4vw,2.6rem)", color:"#faf0ff" }}>
                  Ready to <span className="shimmer-text">launch your team?</span>
                </h2>
                <p className="mb-8" style={{ color:"#9d8aaf", fontSize:"1.05rem" }}>Join teams shipping faster with Orbit. Free to start, no credit card required.</p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link to="/register" className="cta-btn"><span>Create your workspace</span></Link>
                  <Link to="/login"    className="secondary-btn">Sign in</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-10 text-center" style={{ borderTop:"1px solid rgba(192,132,252,0.08)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background:"linear-gradient(135deg,#c084fc,#f472b6)" }}>◎</div>
          <span style={{ fontFamily:"Syne, sans-serif", fontWeight:700, color:"#faf0ff" }}>Orbit</span>
        </div>
        <p style={{ color:"#5c4d6e", fontSize:"0.8rem" }}>Built for teams that move fast. &copy; {new Date().getFullYear()} Orbit.</p>
      </footer>
    </div>
  );
}
