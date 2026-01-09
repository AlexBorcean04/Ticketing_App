import React from "react";

export const CardSkeleton = () => (
  <div className="w-full max-w-sm bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-white/10 mb-6" />
    <div className="h-6 w-2/3 bg-white/10 rounded mb-3" />
    <div className="h-4 w-1/2 bg-white/10 rounded mb-10" />
    <div className="h-12 w-full bg-white/10 rounded-2xl" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-3 p-8">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
    ))}
  </div>
);
