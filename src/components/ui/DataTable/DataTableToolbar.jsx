import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari data tabel"
        className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        aria-hidden
      >
        <Search className="w-4 h-4" />
      </span>
    </div>
  );
}

function ColumnVisibilityMenu({ table }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide());

  if (hideableColumns.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        Kolom
        <ChevronDown className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-card border border-neutral-200 bg-white shadow-card z-10">
          <div className="py-2">
            {hideableColumns.map((col) => {
              const header = typeof col.columnDef.header === 'string'
                ? col.columnDef.header
                : col.id;
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="rounded border-neutral-300 text-primary focus:ring-primary-300"
                  />
                  {header}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataTableToolbar({
  table,
  title,
  searchPlaceholder = 'Cari data...',
  enableGlobalFilter = true,
  enableColumnVisibility = true,
}) {
  const globalFilter = table.getState().globalFilter ?? '';

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center">{title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        {enableGlobalFilter && (
          <SearchInput
            value={globalFilter}
            onChange={(v) => table.setGlobalFilter(v)}
            placeholder={searchPlaceholder}
          />
        )}
        {enableColumnVisibility && <ColumnVisibilityMenu table={table} />}
      </div>
    </div>
  );
}
