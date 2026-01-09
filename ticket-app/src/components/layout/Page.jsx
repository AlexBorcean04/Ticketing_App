import React from "react";

const Page = ({
  title,
  subtitle,
  actions,
  children,
  className = "",
}) => {
  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div className="space-y-2">
            {title && (
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-400 font-medium max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex gap-3 items-center">{actions}</div>}
        </div>
      )}

      {children}
    </div>
  );
};

export default Page;
