import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  ArrowLeft,
  ShoppingCart,
  X,
  Minus,
  Plus,
  ShieldAlert,
  Map,
  Ticket,
  Zap,
} from "lucide-react";
import Seat from "./Seat";
import useTicketStore from "../store";
import { api } from "../lib/api";
import { socket } from "../lib/socket";

const SeatMap = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");

  const { cart, addToCart, removeFromCart, timeLeft, tick, timerActive, clearCart } =
    useTicketStore();

  // socket.id can be undefined initially; memo is fine, just be aware it updates on reconnect
  const clientId = useMemo(() => socket.id, [socket.id]);

  const loadEvent = async () => {
    if (!id) return;
    try {
      setStatus("loading");
      setError("");
      const res = await api.get(`/api/events/${id}`);
      setEventData(res.data);
      setStatus("ready");
    } catch (e) {
      setError(e?.message || "Failed to load seat map.");
      setStatus("error");
    }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Timer
  useEffect(() => {
    let interval;
    if (timerActive) interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerActive, tick]);

  // Socket listeners
  useEffect(() => {
    const onSeatLocked = (data) => {
      if (data?.eventId !== id) return;
      setEventData((prev) => {
        if (!prev?.seats) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) =>
            s.id === data.seatId ? { ...s, status: "locked", lockedBy: data.lockedBy } : s
          ),
        };
      });
    };

    const onSeatUnlocked = (data) => {
      if (data?.eventId !== id) return;
      setEventData((prev) => {
        if (!prev?.seats) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) =>
            s.id === data.seatId ? { ...s, status: "available", lockedBy: null } : s
          ),
        };
      });
    };

    const onSeatBooked = (data) => {
      if (data?.eventId !== id) return;
      setEventData((prev) => {
        if (!prev?.seats) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) =>
            s.id === data.seatId ? { ...s, status: "booked", lockedBy: null } : s
          ),
        };
      });
    };

    socket.on("seat_locked", onSeatLocked);
    socket.on("seat_unlocked", onSeatUnlocked);
    socket.on("seat_booked", onSeatBooked);

    return () => {
      socket.off("seat_locked", onSeatLocked);
      socket.off("seat_unlocked", onSeatUnlocked);
      socket.off("seat_booked", onSeatBooked);
    };
  }, [id]);

  // release locks on unmount
  useEffect(() => {
    return () => {
      if (cart.length > 0) {
        socket.emit("release_seats", { eventId: id, seatIds: cart });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") return;

    const lockedByMe = seat.status === "locked" && seat.lockedBy && seat.lockedBy === clientId;
    const lockedByOther = seat.status === "locked" && seat.lockedBy && seat.lockedBy !== clientId;

    if (lockedByOther) return;

    const alreadySelected = cart.includes(seat.id);

    // Toggle off
    if (alreadySelected || lockedByMe) {
      removeFromCart(seat.id);
      socket.emit("unselect_seat", { eventId: id, seatId: seat.id });
      return;
    }

    // Toggle on
    addToCart(seat.id);
    socket.emit("select_seat", { eventId: id, seatId: seat.id });
  };

  const handleCheckout = async () => {
    try {
      await api.post("/api/checkout", { eventId: id, seatIds: cart });
      alert("Tickets Purchased!");
      clearCart();
      navigate("/");
    } catch (err) {
      alert("Checkout failed");
    }
  };

  const handleClearCart = () => {
    if (cart.length > 0) socket.emit("release_seats", { eventId: id, seatIds: cart });
    clearCart();
  };

  const selectedSeats = useMemo(() => {
    if (!eventData?.seats) return [];
    const setIds = new Set(cart);
    return eventData.seats.filter((s) => setIds.has(s.id));
  }, [cart, eventData?.seats]);

  const stats = useMemo(() => {
    const seats = eventData?.seats || [];
    const available = seats.filter((s) => s.status === "available").length;
    const booked = seats.filter((s) => s.status === "booked").length;
    const locked = seats.filter((s) => s.status === "locked").length;
    return { available, booked, locked, total: seats.length };
  }, [eventData?.seats]);

  // UI states
  if (status === "loading") {
    return (
      <div className="w-full">
        <div className="h-10 w-40 bg-white/5 rounded-2xl animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-8 md:p-10 shadow-2xl">
            <div className="h-10 w-2/3 bg-white/10 rounded-xl animate-pulse mb-4" />
            <div className="h-5 w-1/3 bg-white/10 rounded-xl animate-pulse mb-10" />
            <div className="h-[560px] bg-white/5 rounded-[2rem] animate-pulse" />
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-6 shadow-2xl">
            <div className="h-8 w-2/3 bg-white/10 rounded-xl animate-pulse mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-10 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-6">
          <ShieldAlert size={26} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Seat map unavailable</h2>
        <p className="text-slate-400 font-medium mb-8">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-2xl font-black transition"
          >
            Go back
          </button>
          <button
            onClick={loadEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!eventData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="w-full space-y-6">
      {/* Top Back + Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-3 rounded-2xl font-black transition w-fit"
        >
          <ArrowLeft size={18} /> Back to Events
        </button>

        {/* Timer pill */}
        {timerActive && (
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl text-red-300 font-mono font-black">
            <Zap size={18} className="opacity-90" />
            Expires in {minutes}:{seconds}
          </div>
        )}
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-8 md:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-[340px] h-[340px] bg-blue-500/15 blur-[90px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-[340px] h-[340px] bg-indigo-500/15 blur-[90px] rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-black uppercase tracking-widest">
              <Ticket size={14} /> Seat Selection
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-black text-white tracking-tight">
              {eventData.title}
            </h1>
            <p className="mt-3 text-slate-300/80 font-semibold">
              {eventData.date || "Multiple Dates Available"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatChip label="Total" value={stats.total} />
            <StatChip label="Available" value={stats.available} />
            <StatChip label="Locked" value={stats.locked} />
            <StatChip label="Booked" value={stats.booked} />
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Map card */}
        <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.75rem] shadow-2xl">
          <div className="p-6 md:p-8">
            {/* Stage + Legend + Controls row */}
            <div className="flex flex-col gap-6">
              {/* Stage */}
              <div className="relative">
                <div className="w-2/3 h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                <div className="mt-3 text-center text-xs font-black uppercase tracking-[0.25em] text-slate-400">
                  Stage
                </div>
              </div>

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-2">
                  <LegendDot label="Available" dotClass="bg-emerald-500/80" />
                  <LegendDot label="Selected" dotClass="bg-blue-500" />
                  <LegendDot label="Locked" dotClass="bg-amber-500/80" />
                  <LegendDot label="Booked" dotClass="bg-slate-700" />
                </div>

                {/* Zoom controls */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shadow-inner">
                    <span className="px-3 text-xs font-black uppercase tracking-widest text-slate-400 inline-flex items-center gap-2">
                      <Map size={14} /> Map tools
                    </span>
                  </div>
                  {/* buttons rendered inside TransformWrapper for access */}
                </div>
              </div>
            </div>

            {/* Map viewport */}
            <div className="mt-6 bg-[#070b18]/50 border border-white/10 rounded-[2.25rem] overflow-hidden">
              <div className="h-[580px] w-full">
                <TransformWrapper centerOnInit initialScale={1}>
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="p-4 flex items-center justify-between border-b border-white/10 bg-white/5">
                        <div className="text-sm font-black text-slate-200">
                          Click seats to add/remove from cart
                        </div>

                        <div className="flex items-center gap-2">
                          <IconBtn onClick={zoomIn} title="Zoom in">
                            <Plus size={18} />
                          </IconBtn>
                          <IconBtn onClick={zoomOut} title="Zoom out">
                            <Minus size={18} />
                          </IconBtn>
                          <button
                            onClick={resetTransform}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl font-black text-sm transition"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <TransformComponent wrapperClass="w-full h-full">
                        <svg viewBox="0 0 1000 600" className="w-[980px] h-[580px] mx-auto">
                          {eventData.seats?.map((seat) => {
                            const lockedByMe =
                              seat.status === "locked" &&
                              seat.lockedBy &&
                              seat.lockedBy === clientId;

                            return (
                              <Seat
                                key={seat.id}
                                seat={seat}
                                isSelected={cart.includes(seat.id)}
                                lockedByMe={lockedByMe}
                                onClick={() => handleSeatClick(seat)}
                              />
                            );
                          })}
                        </svg>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </div>
          </div>
        </div>

        {/* Cart panel */}
        <aside className="lg:sticky lg:top-28 space-y-4">
          <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.75rem] p-6 shadow-2xl">
            <div className="absolute -top-24 -right-24 w-[260px] h-[260px] bg-blue-500/10 blur-[80px] rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-blue-400" />
                  <h2 className="text-lg font-black text-white">Checkout</h2>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-slate-400 hover:text-white transition"
                    title="Clear selection"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-slate-300 font-semibold">
                    Pick seats from the map to start checkout.
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Your events are stored in MongoDB via your server API. Seat locks are real-time
                    through Socket.IO.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                    {selectedSeats.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-300 font-black">
                            {String(s.id).slice(-2)}
                          </div>
                          <div>
                            <div className="font-black text-white">Seat {s.id}</div>
                            <div className="text-xs text-slate-500 font-semibold">Reserved</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            removeFromCart(s.id);
                            socket.emit("unselect_seat", { eventId: id, seatId: s.id });
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {timerActive && (
                      <div className="bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl text-red-300 font-mono font-black flex items-center justify-between">
                        <span>Hold timer</span>
                        <span>
                          {minutes}:{seconds}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl font-black transition shadow-xl shadow-blue-500/25"
                    >
                      Checkout ({cart.length})
                    </button>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Seats may be locked temporarily. Complete checkout before the timer ends.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile quick bar */}
          {cart.length > 0 && (
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl flex justify-between items-center shadow-2xl border border-white/10">
              <span className="font-black text-base flex items-center gap-2 text-white">
                <ShoppingCart size={20} /> {cart.length} Seats
              </span>
              <button
                onClick={handleCheckout}
                className="bg-white text-blue-700 px-5 py-2 rounded-xl font-black hover:bg-gray-100 transition"
              >
                Checkout
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const IconBtn = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl transition"
  >
    {children}
  </button>
);

const LegendDot = ({ label, dotClass }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
    <span className={`w-3 h-3 rounded-full ${dotClass}`} />
    <span className="text-xs font-black text-slate-200 uppercase tracking-widest">
      {label}
    </span>
  </div>
);

const StatChip = ({ label, value }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
    <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">
      {label}
    </div>
    <div className="text-white text-xl font-black">{value}</div>
  </div>
);

export default SeatMap;
