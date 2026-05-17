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
        className="w-full md:w-72 h-[44px] pl-[42px] pr-[17px] bg-white border border-light-ash rounded-default text-body-sm text-deep-slate placeholder:text-graphite focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />
      <span
        className="absolute left-[13px] top-1/2 -translate-y-1/2 text-graphite pointer-events-none"
        aria-hidden
      >
        <Search className="w-4 h-4" strokeWidth={1.75} />
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
        className="inline-flex items-center gap-2 h-[44px] px-[17px] rounded-default bg-white border border-light-ash text-body-sm font-medium text-deep-slate hover:bg-faint-fog transition-colors duration-150"
      >
        Kolom
        <ChevronDown className="w-4 h-4 text-graphite" strokeWidth={1.75} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-default border border-light-ash bg-white z-10">
          <div className="py-[8px]">
            {hideableColumns.map((col) => {
              const header = typeof col.columnDef.header === 'string'
                ? col.columnDef.header
                : col.id;
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-[17px] py-[8px] text-body-sm text-deep-slate hover:bg-faint-fog cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="rounded border-light-ash text-primary-500 focus:ring-primary-500"
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
    <div className="flex items-center justify-between gap-[17px] flex-wrap">
      <div className="flex items-center">{title}</div>
      <div className="flex items-center gap-[8px] flex-wrap">
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
