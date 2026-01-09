import React from "react";

const getSeatStyle = ({ status, isSelected, lockedByMe }) => {
  // available | locked | booked
  if (status === "booked") {
    return {
      fill: "fill-slate-700",
      ring: "stroke-white/10",
      cursor: "cursor-not-allowed",
      glow: "",
      opacity: "opacity-70",
    };
  }

  if (status === "locked") {
    // If it's locked by me, allow click + show as "selected-like"
    if (lockedByMe) {
      return {
        fill: "fill-blue-500",
        ring: "stroke-blue-200/40",
        cursor: "cursor-pointer",
        glow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.35)]",
        opacity: "opacity-100",
      };
    }
    return {
      fill: "fill-amber-500/80",
      ring: "stroke-amber-200/30",
      cursor: "cursor-not-allowed",
      glow: "",
      opacity: "opacity-95",
    };
  }

  if (isSelected) {
    return {
      fill: "fill-blue-500",
      ring: "stroke-blue-200/40",
      cursor: "cursor-pointer",
      glow: "drop-shadow-[0_0_10px_rgba(59,130,246,0.35)]",
      opacity: "opacity-100",
    };
  }

  return {
    fill: "fill-emerald-500/80",
    ring: "stroke-emerald-200/20",
    cursor: "cursor-pointer",
    glow: "group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]",
    opacity: "opacity-95 group-hover:opacity-100",
  };
};

const Seat = ({ seat, isSelected, lockedByMe = false, onClick }) => {
  const disabled = seat.status === "booked" || (seat.status === "locked" && !lockedByMe);
  const s = getSeatStyle({ status: seat.status, isSelected, lockedByMe });

  return (
    <g
      className={`group transition-all ${s.opacity} ${s.cursor} ${s.glow}`}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
      aria-label={`Seat ${seat.id}`}
    >
      {/* soft halo */}
      <circle cx={seat.x} cy={seat.y} r={14} className="fill-white/0" />
      {/* actual seat */}
      <circle
        cx={seat.x}
        cy={seat.y}
        r={10}
        className={`${s.fill} transition-all`}
        strokeWidth="2"
        stroke="rgba(255,255,255,0.12)"
      />
      {/* subtle outline to make seats pop */}
      <circle
        cx={seat.x}
        cy={seat.y}
        r={10}
        className="fill-transparent"
        strokeWidth="2"
        stroke="rgba(255,255,255,0.08)"
      />
    </g>
  );
};

export default Seat;
