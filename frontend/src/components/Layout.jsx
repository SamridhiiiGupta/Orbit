import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/projects",  icon: "◈", label: "Projects"  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0c0910" }}>
      <div className="orbit-bg" style={{ opacity: 0.6 }}>
        <div className="orb orb-1" />
        <div className="orb orb-3" />
      </div>

      <aside className="sidebar relative z-10 w-60 flex flex-col shrink-0">
        {/* Logo — click to go back to landing */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(192,132,252,0.1)" }}>
          <Link to="/" className="flex items-center gap-2.5 group" style={{ textDecoration: "none" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs animate-glow"
              style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              ◎
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "#faf0ff" }}>
              Orbit
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span style={{ fontSize: "0.95rem" }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(192,132,252,0.1)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(192,132,252,0.3), rgba(244,114,182,0.3))",
                border: "1px solid rgba(192,132,252,0.25)",
                color: "#c084fc",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#faf0ff", fontFamily: "DM Sans, sans-serif" }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: "#5c4d6e" }}>{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="transition-colors text-sm"
              style={{ color: "#5c4d6e" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
              onMouseLeave={e => e.currentTarget.style.color = "#5c4d6e"}
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 overflow-y-auto" style={{ background: "rgba(12,9,16,0.5)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
