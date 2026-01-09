import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Sparkles, ShieldAlert } from "lucide-react";
import { api } from "../lib/api";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setStatus("loading");
      setError("");
      const res = await api.get("/api/events"); // MongoDB-backed from your server
      setEvents(res.data || []);
      setStatus("ready");
    } catch (e) {
      setError(e?.message || "Failed to load events.");
      setStatus("error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-10 md:p-14 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-[320px] h-[320px] bg-blue-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[320px] h-[320px] bg-indigo-500/15 blur-[90px] rounded-full" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Live Experiences
          </div>

          <h1 className="mt-5 text-5xl md:text-6xl font-black tracking-tight text-white">
            Find Your Next <span className="text-blue-400">Adventure</span>
          </h1>

          <p className="mt-5 text-slate-300/80 text-lg max-w-2xl font-medium">
            Choose an event and pick seats in real-time. Your events are stored in MongoDB and served by your Node API.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition shadow-lg shadow-blue-500/20"
            >
              Create an Event
            </Link>
            <a
              href="#events"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-2xl font-black transition"
            >
              Browse Below
            </a>
          </div>
        </div>
      </section>

      {/* States */}
      {status === "error" && (
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
            <ShieldAlert size={26} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Couldn’t load events</h2>
          <p className="text-slate-400 font-medium mb-8">{error}</p>
          <button
            onClick={load}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition"
          >
            Retry
          </button>
        </div>
      )}

      {status === "ready" && events.length === 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-2">No events yet</h2>
          <p className="text-slate-400 font-medium mb-8">
            Go to Admin Dashboard and create your first event (saved in MongoDB).
          </p>
          <Link
            to="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition"
          >
            Go to Admin
          </Link>
        </div>
      )}

      {/* Grid */}
      {status !== "error" && (
        <section id="events" className="space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-black text-white">Events</h2>
            <div className="text-sm font-bold text-slate-400">{events.length} available</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(status === "loading" ? Array.from({ length: 6 }) : events).map((event, i) => (
              <div
                key={event?._id || i}
                className="group relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl hover:border-blue-500/40 transition"
              >
                <div className="absolute -top-24 -right-24 w-[220px] h-[220px] bg-blue-500/10 blur-[70px] rounded-full opacity-0 group-hover:opacity-100 transition" />

                {status === "loading" ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 mb-6 animate-pulse" />
                    <div className="h-6 w-2/3 bg-white/10 rounded mb-3 animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/10 rounded mb-10 animate-pulse" />
                    <div className="h-12 w-full bg-white/10 rounded-2xl animate-pulse" />
                  </>
                ) : (
                  <>
                    <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                      <Calendar size={28} />
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                      {event.title}
                    </h3>

                    <p className="text-slate-400 font-semibold mb-10">
                      {event.date || "To be announced"}
                    </p>

                    <Link
                      to={`/seats/${event._id}`}
                      className="flex items-center justify-between bg-white/5 group-hover:bg-blue-600 px-6 py-4 rounded-2xl text-white font-black transition-all shadow-inner"
                    >
                      Select Seats
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EventList;
