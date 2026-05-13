import React from "react";
import { BiChevronRight } from "react-icons/bi";
import { Link } from "react-router-dom";

export default function DropdownLink({
  pathname,
  basepath,
  icon,
  title,
  dropdown,
}) {
  const [isOpen, setIsOpen] = React.useState(
    basepath && pathname.includes(basepath)
  );
  const isSectionActive = basepath && pathname.includes(basepath);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-button font-medium transition-colors ${
          isSectionActive
            ? "bg-primary-50 text-primary-700"
            : "text-neutral-700 hover:bg-neutral-100"
        }`}
      >
        <span className="flex items-center gap-3">
          {icon}
          {title}
        </span>
        <BiChevronRight
          size={18}
          className={`transition-transform duration-150 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="ml-9 space-y-0.5">
          {dropdown.map((item) => {
            const isActive = pathname.includes(item.path);
            return (
              <li key={item.title}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-button text-sm transition-colors ${
                    isActive
                      ? "text-primary-700 font-semibold"
                      : "text-neutral-600 hover:text-primary-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-primary" : "bg-neutral-300"
                    }`}
                  />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
