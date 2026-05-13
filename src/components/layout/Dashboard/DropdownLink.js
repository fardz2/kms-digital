import React from "react";
import { ChevronRight } from "lucide-react";
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
        className={`flex items-center justify-between w-full h-[50px] px-[21px] rounded-default text-body-sm transition-colors duration-150 ease-out-quart ${
          isSectionActive
            ? "bg-polar-mist text-deep-slate font-semibold"
            : "text-deep-slate hover:bg-faint-fog"
        }`}
      >
        <span className="flex items-center gap-3">
          <span className={isSectionActive ? "text-primary-600" : "text-graphite"}>
            {icon}
          </span>
          {title}
        </span>
        <ChevronRight
          size={18}
          className={`transition-transform duration-150 text-graphite ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="ml-[44px] space-y-0.5 border-l border-light-ash pl-[13px]">
          {dropdown.map((item) => {
            const isActive = pathname.includes(item.path);
            return (
              <li key={item.title}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-[13px] py-2 rounded-default text-body-sm transition-colors ${
                    isActive
                      ? "text-primary-600 font-semibold"
                      : "text-graphite hover:text-deep-slate"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-primary-500" : "bg-light-ash"
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
