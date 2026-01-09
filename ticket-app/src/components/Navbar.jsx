import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Ticket, LayoutDashboard, CalendarDays } from "lucide-react";

const routes = [
  { to: "/", label: "Browse Events", icon: CalendarDays },
  { to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
];

const Navbar = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  const activePath = useMemo(() => {
    // keep /admin active on /admin and any future /admin/*
    if (location.pathname.startsWith("/admin")) return "/admin";
    return "/";
  }, [location.pathname]);

  const measure = () => {
    const el = itemRefs.current[activePath];
    const parent = containerRef.current;
    if (!el || !parent) return;

    const indicate = () => {
      const r1 = el.getBoundingClientRect();
      const r2 = parent.getBoundingClientRect();
      setIndicator({ left: r1.left - r2.left, width: r1.width, ready: true });
    };

    // next frame (safer with fonts)
    requestAnimationFrame(indicate);
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePath]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-xl bg-[#0b1224]/75 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-6">
          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition" />
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                <Ticket className="text-white" size={26} />
              </div>
            </div>

            <div className="leading-none">
              <div className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
                Ticket<span className="text-blue-400">Pro</span>
              </div>
              <div className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                Real-time booking
              </div>
            </div>
          </NavLink>

          {/* Nav */}
          <div className="flex items-center gap-4">
            <nav
              ref={containerRef}
              className="relative hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 shadow-inner"
            >
              {/* Sliding active pill */}
              <div
                className={[
                  "absolute top-1.5 bottom-1.5 rounded-xl",
                  "bg-gradient-to-r from-blue-600/90 to-indigo-600/90",
                  "shadow-lg shadow-blue-500/20 transition-all duration-300",
                  indicator.ready ? "opacity-100" : "opacity-0",
                ].join(" ")}
                style={{ left: indicator.left, width: indicator.width }}
              />

              {routes.map((r) => {
                const Icon = r.icon;
                return (
                  <NavLink
                    key={r.to}
                    to={r.to}
                    ref={(node) => (itemRefs.current[r.to] = node)}
                    className={({ isActive }) =>
                      [
                        "relative z-10 px-5 py-3 rounded-xl",
                        "text-sm font-black tracking-wide",
                        "transition-colors flex items-center gap-2",
                        isActive ? "text-white" : "text-slate-300 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} className="opacity-90" />
                    {r.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile buttons */}
            <div className="md:hidden flex gap-2">
              {routes.map((r) => {
                const Icon = r.icon;
                return (
                  <NavLink
                    key={r.to}
                    to={r.to}
                    className={({ isActive }) =>
                      [
                        "p-3 rounded-2xl border transition",
                        isActive
                          ? "bg-blue-600 border-blue-500/40 text-white"
                          : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10",
                      ].join(" ")
                    }
                    aria-label={r.label}
                  >
                    <Icon size={20} />
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
