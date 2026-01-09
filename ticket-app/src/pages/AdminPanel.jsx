import React, { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, X, LayoutGrid, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const fetchEvents = async () => {
    try {
      setStatus("loading");
      const res = await api.get("/api/events"); // MongoDB-backed
      setEvents(res.data || []);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/events", {
        title: newTitle,
        date: new Date().toISOString().slice(0, 10), // cleaner than locale string
      });
      setNewTitle("");
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert("Server error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this event permanently?")) {
      try {
        await api.delete(`/api/events/${id}`);
        fetchEvents();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-10 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-[380px] h-[380px] bg-indigo-500/15 blur-[90px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-[380px] h-[380px] bg-blue-500/15 blur-[90px] rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-white flex items-center gap-3">
              <LayoutGrid className="text-blue-400" size={34} /> Admin Control
            </h1>
            <p className="text-slate-300/80 mt-4 font-semibold max-w-2xl">
              Create and manage events stored in MongoDB. Seat maps are generated per event on the server.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={22} /> Create Event
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.75rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-white">Events</h2>
          <span className="text-sm font-bold text-slate-400">
            {status === "ready" ? `${events.length} total` : "Loading..."}
          </span>
        </div>

        <div className="border-t border-white/10" />

        {status === "loading" ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="p-10 text-center text-slate-400 font-semibold">
            Failed to load events. Check your server + MongoDB connection.
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-white text-2xl font-black mb-2">No events created</div>
            <div className="text-slate-400 font-semibold mb-8">
              Create your first event to generate seats and start booking.
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-slate-300 text-xs uppercase tracking-[0.22em] font-black">
                <tr>
                  <th className="px-8 py-5">Event</th>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <div className="text-white font-black text-lg">{event.title}</div>
                          <div className="text-slate-400 font-semibold text-sm">MongoDB document</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6 text-slate-300 font-bold">
                      {event.date || "—"}
                    </td>

                    <td className="px-8 py-6">
                      <span className="bg-emerald-500/10 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest">
                        Active
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/seats/${event._id}`}
                          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition"
                          title="Open seat map"
                        >
                          <ArrowUpRight size={20} className="text-slate-200" />
                        </Link>

                        <button
                          onClick={() => handleDelete(event._id)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-2xl transition"
                          title="Delete"
                        >
                          <Trash2 size={20} className="text-red-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0b1224] border border-white/10 rounded-[2.75rem] p-10 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-white"
              aria-label="Close"
            >
              <X size={26} />
            </button>

            <h2 className="text-3xl font-black text-white mb-2">Create Event</h2>
            <p className="text-slate-400 font-semibold mb-8">
              Add an event title. The server will store it in MongoDB.
            </p>

            <form onSubmit={handleCreate} className="space-y-5">
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Grand Opera Night"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-slate-500 font-bold"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition active:scale-[0.99]"
              >
                Deploy Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
