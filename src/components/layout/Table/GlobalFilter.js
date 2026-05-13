import React from "react";

export default function GlobalFilter(props) {
  const { globalFilter, setGlobalFilter } = props;

  return (
    <div className="relative">
      <input
        type="search"
        value={globalFilter || ""}
        onChange={(e) => setGlobalFilter(e.target.value || undefined)}
        placeholder="Cari data..."
        aria-label="Cari data tabel"
        className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-hidden
      >
        🔍
      </span>
    </div>
  );
}
