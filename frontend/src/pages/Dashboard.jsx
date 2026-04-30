import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import TaskCard from "../components/TaskCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Cell as PieCell,
} from "recharts";

/* ── Palette matching new brand ──────────────────────────────── */
const STATUS_CFG = {
  PENDING:     { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  label: "Pending",     icon: "◷" },
  IN_PROGRESS: { color: "#c084fc", bg: "rgba(192,132,252,0.12)", label: "In Progress", icon: "◈" },
  COMPLETED:   { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Completed",   icon: "✦" },
};

const FILTER_TABS = ["All", "Pending", "In Progress", "Completed"];
const STATUS_MAP  = { "Pending": "PENDING", "In Progress": "IN_PROGRESS", "Completed": "COMPLETED" };

/* ── Count-up hook ───────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    const start = performance.now();
    const tick  = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ── Custom tooltip ──────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div style={{
      background: "rgba(14,10,20,0.95)",
      border: "1px solid rgba(192,132,252,0.2)",
      borderRadius: 12, padding: "8px 14px",
      fontFamily: "DM Sans, sans-serif", fontSize: 13,
    }}>
      <span style={{ color: "#9d8aaf" }}>{name}: </span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ── Skeleton loader ─────────────────────────────────────────── */
function Skeleton({ h = "h-4", w = "w-full", rounded = "rounded-lg" }) {
  return (
    <div
      className={`${h} ${w} ${rounded} animate-pulse`}
      style={{ background: "rgba(192,132,252,0.08)" }}
    />
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function Dashboard() {
  const { user }                  = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setFilter] = useState("All");
  const [hoveredStat, setHovered] = useState(null);

  useEffect(() => {
    api.get("/tasks/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const pending     = data?.statusCounts?.PENDING     ?? 0;
  const inProgress  = data?.statusCounts?.IN_PROGRESS ?? 0;
  const completed   = data?.statusCounts?.COMPLETED   ?? 0;
  const total       = pending + inProgress + completed;
  const completePct = total ? Math.round((completed / total) * 100) : 0;

  const countTotal    = useCountUp(total);
  const countPending  = useCountUp(pending);
  const countProgress = useCountUp(inProgress);
  const countDone     = useCountUp(completed);

  const chartData = [
    { name: "Pending",     value: pending,    key: "PENDING",     color: "#f59e0b" },
    { name: "In Progress", value: inProgress, key: "IN_PROGRESS", color: "#c084fc" },
    { name: "Completed",   value: completed,  key: "COMPLETED",   color: "#34d399" },
  ];

  const donutData = total > 0 ? chartData : [{ name: "None", value: 1, color: "rgba(255,235,255,0.06)" }];

  const filteredTasks = data?.recentTasks?.filter((t) =>
    activeFilter === "All" ? true : t.status === STATUS_MAP[activeFilter]
  ) ?? [];

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-2">
          <Skeleton h="h-8" w="w-56" />
          <Skeleton h="h-4" w="w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-28" rounded="rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton h="h-52" rounded="rounded-2xl" />
          <Skeleton h="h-52" rounded="rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="animate-fade-up" style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.75rem", color: "#faf0ff" }}>
            Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 animate-fade-up-d1" style={{ color: "#9d8aaf", fontSize: "0.9rem" }}>
            Here's what's happening across your projects.
          </p>
        </div>
        <Link
          to="/projects"
          className="cta-btn animate-fade-up"
          style={{ padding: "9px 18px", fontSize: "0.8rem", whiteSpace: "nowrap" }}
        >
          <span>+ New Project</span>
        </Link>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks",  value: countTotal,    raw: total,      color: "#faf0ff",  icon: "◉", bg: "rgba(255,235,255,0.06)" },
          { label: "Pending",      value: countPending,  raw: pending,    color: "#f59e0b",  icon: "◷", bg: "rgba(245,158,11,0.08)" },
          { label: "In Progress",  value: countProgress, raw: inProgress, color: "#c084fc",  icon: "◈", bg: "rgba(192,132,252,0.08)" },
          { label: "Completed",    value: countDone,     raw: completed,  color: "#34d399",  icon: "✦", bg: "rgba(52,211,153,0.08)" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="glass animate-fade-up rounded-2xl p-5 relative overflow-hidden cursor-default"
            style={{
              animationDelay: `${i * 0.08}s`,
              border: hoveredStat === i ? `1px solid ${s.color}40` : undefined,
              boxShadow: hoveredStat === i ? `0 0 20px ${s.color}18` : undefined,
              transition: "all 0.2s",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Icon bg */}
            <div
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: s.bg, color: s.color }}
            >
              {s.icon}
            </div>
            <p
              className="font-bold mt-2"
              style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", color: s.color, lineHeight: 1 }}
            >
              {s.value}
            </p>
            <p className="text-xs mt-1.5" style={{ color: "#9d8aaf" }}>{s.label}</p>
            {/* Bottom progress bar */}
            {total > 0 && s.raw !== undefined && (
              <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,235,255,0.06)" }}>
                <div
                  className="h-0.5 rounded-full"
                  style={{
                    width: `${total ? (s.raw / total) * 100 : 0}%`,
                    background: s.color,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Bar chart */}
        <div className="glass rounded-2xl p-5">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff", marginBottom: 20 }}>
            Task Overview
          </h2>
          {total === 0 ? (
            <div className="h-36 flex flex-col items-center justify-center gap-2" style={{ color: "#5c4d6e" }}>
              <span style={{ fontSize: "1.5rem" }}>◉</span>
              <span style={{ fontSize: "0.8rem" }}>No tasks yet</span>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData} barSize={32} barCategoryGap="35%">
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#5c4d6e", fontSize: 11, fontFamily: "DM Sans" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(192,132,252,0.05)", radius: 8 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((e) => (
                      <Cell key={e.key} fill={e.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center justify-center gap-5 mt-2">
                {chartData.map((e) => (
                  <div key={e.key} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: e.color }} />
                    <span style={{ fontSize: "0.7rem", color: "#9d8aaf" }}>{e.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Donut + completion */}
        <div className="glass rounded-2xl p-5">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff", marginBottom: 20 }}>
            Completion Rate
          </h2>
          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
              <PieChart width={130} height={130}>
                <Pie
                  data={donutData}
                  cx={60} cy={60}
                  innerRadius={44} outerRadius={60}
                  startAngle={90} endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((e, i) => (
                    <PieCell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.4rem", color: "#34d399" }}>
                  {completePct}%
                </span>
                <span style={{ fontSize: "0.6rem", color: "#9d8aaf" }}>done</span>
              </div>
            </div>

            {/* Progress bars */}
            <div className="flex-1 space-y-3">
              {chartData.map((e) => (
                <div key={e.key}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: "0.75rem", color: "#9d8aaf" }}>{e.name}</span>
                    <span style={{ fontSize: "0.75rem", color: e.color, fontWeight: 600 }}>{e.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,235,255,0.06)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${total ? (e.value / total) * 100 : 0}%`,
                        background: e.color,
                        transition: "width 1.2s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Overdue ──────────────────────────────────────────── */}
      {data?.overdueTasks?.length > 0 && (
        <div className="glass rounded-2xl p-5" style={{ border: "1px solid rgba(251,113,133,0.2)" }}>
          <h2 className="flex items-center gap-2 mb-4" style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff" }}>
            <span style={{ color: "#f472b6" }}>⚠</span>
            Overdue Tasks
            <span className="badge" style={{ background: "rgba(244,114,182,0.12)", color: "#f472b6", fontSize: "0.7rem" }}>
              {data.overdueTasks.length}
            </span>
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {data.overdueTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl"
                style={{ background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.1)" }}
              >
                <div>
                  <p style={{ fontSize: "0.85rem", color: "#faf0ff", fontWeight: 500 }}>{task.title}</p>
                  <p style={{ fontSize: "0.75rem", color: "#9d8aaf" }}>{task.project?.name}</p>
                </div>
                <Link
                  to={`/projects/${task.projectId}`}
                  className="badge"
                  style={{ background: "rgba(244,114,182,0.12)", color: "#f472b6", fontSize: "0.7rem" }}
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Tasks ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#faf0ff" }}>
            Recent Tasks
          </h2>
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="badge transition-all duration-200"
                style={{
                  padding: "5px 12px",
                  cursor: "pointer",
                  background: activeFilter === tab ? "rgba(192,132,252,0.18)" : "rgba(255,235,255,0.04)",
                  border:     activeFilter === tab ? "1px solid rgba(192,132,252,0.35)" : "1px solid rgba(192,132,252,0.1)",
                  color:      activeFilter === tab ? "#c084fc" : "#9d8aaf",
                  fontSize: "0.75rem",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div
            className="glass rounded-2xl text-center py-12"
            style={{ color: "#5c4d6e", fontSize: "0.875rem" }}
          >
            {activeFilter === "All"
              ? <>No tasks yet. <Link to="/projects" style={{ color: "#c084fc" }}>Create a project</Link> to get started.</>
              : `No ${activeFilter.toLowerCase()} tasks.`
            }
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.slice(0, 6).map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
