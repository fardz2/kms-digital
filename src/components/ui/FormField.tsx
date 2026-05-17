// @ts-nocheck
import React from 'react';

/**
 * FormField — label + control wrapper aligned with DESIGN.md (21n adapted).
 *
 * Props:
 *   label        — string, required
 *   required     — boolean, shows asterisk
 *   error        — string, inline error message
 *   hint         — string, helper text below input
 *   htmlFor      — links label to input id
 *   children     — the input element
 */
export function FormField({ label, required, error, hint, htmlFor, children, className = '' }) {
  return (
    <div className={`space-y-[6px] ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-body-sm font-medium text-deep-slate">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-caption text-danger">{error}</p>
      ) : hint ? (
        <p className="text-caption text-graphite">{hint}</p>
      ) : null}
    </div>
  );
}

const INPUT_BASE =
  'block w-full h-[52px] bg-white border border-light-ash rounded-default px-[17px] text-base text-deep-slate placeholder:text-graphite focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-faint-fog disabled:text-graphite disabled:cursor-not-allowed transition-colors duration-150';

/**
 * TextInput — styled input for use inside FormField.
 */
export const TextInput = React.forwardRef(function TextInput(
  { className = '', invalid = false, ...rest },
  ref
) {
  const classes = [
    INPUT_BASE,
    invalid ? 'border-danger focus:ring-danger focus:border-danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <input ref={ref} className={classes} {...rest} />;
});

/**
 * TextArea — styled multi-line input.
 */
export const TextArea = React.forwardRef(function TextArea(
  { className = '', invalid = false, rows = 4, ...rest },
  ref
) {
  const classes = [
    'block w-full bg-white border border-light-ash rounded-default px-[17px] py-[13px] text-base text-deep-slate placeholder:text-graphite focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-faint-fog disabled:text-graphite disabled:cursor-not-allowed transition-colors duration-150',
    invalid ? 'border-danger focus:ring-danger focus:border-danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <textarea ref={ref} rows={rows} className={classes} {...rest} />;
});

/**
 * NativeSelect — styled native <select>.
 */
export const NativeSelect = React.forwardRef(function NativeSelect(
  { className = '', invalid = false, children, ...rest },
  ref
) {
  const classes = [
    INPUT_BASE,
    'pr-[42px] appearance-none bg-no-repeat bg-[right_13px_center]',
    'bg-[url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"%23545454\\" stroke-width=\\"1.75\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><polyline points=\\"6 9 12 15 18 9\\"/></svg>")]',
    invalid ? 'border-danger focus:ring-danger focus:border-danger' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <select ref={ref} className={classes} {...rest}>
      {children}
    </select>
  );
});

export default FormField;
