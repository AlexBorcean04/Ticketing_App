import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventList from "./pages/EventList";
import AdminPanel from "./pages/AdminPanel";
import SeatMap from "./components/SeatMap";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-200 bg-[#070b18] relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-blue-600/25 blur-[90px] rounded-full" />
          <div className="absolute top-40 -right-24 w-[520px] h-[520px] bg-indigo-600/20 blur-[110px] rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-[520px] h-[520px] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:28px_28px] opacity-40" />
        </div>

        <Navbar />

        <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/seats/:id" element={<SeatMap />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        <footer className="relative z-10 border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-6 text-sm text-slate-400 flex justify-between items-center">
            <span>© {new Date().getFullYear()} TicketPro</span>
            <span className="hidden md:block">MongoDB-powered event storage</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
