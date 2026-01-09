import React from "react";

const StateCard = ({ title, description, action }) => {
  return (
    <div className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-2">{title}</h2>
      <p className="text-slate-400 font-medium max-w-xl mx-auto">
        {description}
      </p>
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
};

export default StateCard;
