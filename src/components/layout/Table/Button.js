import React from "react";

export function Button({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center px-4 py-2 rounded-button bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PageButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center px-3 py-2 border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
