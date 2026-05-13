import React from 'react';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap';

const VARIANTS = {
  primary:
    'bg-primary-500 hover:bg-primary-600 text-white rounded-full',
  dark:
    'bg-deep-slate hover:bg-primary-600 text-white rounded-full',
  default:
    'bg-white border border-light-ash text-deep-slate hover:bg-faint-fog rounded-button',
  ghost:
    'bg-transparent text-deep-slate hover:bg-polar-mist rounded-full',
  destructive:
    'bg-white border border-danger/30 text-danger hover:bg-danger hover:text-white rounded-button',
  link:
    'bg-transparent text-primary-600 hover:text-primary-700 hover:underline rounded-default px-0',
};

const SIZES = {
  sm: 'h-[40px] px-[17px] text-body-sm',
  md: 'h-[48px] px-[25px] text-base',
  lg: 'h-[56px] px-[29px] text-base',
  icon: 'h-[44px] w-[44px] p-0',
};

/**
 * Button — reusable button aligned with DESIGN.md (21n adapted).
 *
 * Variants: primary | dark | default | ghost | destructive | link
 * Sizes:    sm | md | lg | icon
 */
const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    children,
    leadingIcon,
    trailingIcon,
    ...rest
  },
  ref
) {
  const classes = [BASE, VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {leadingIcon ? <span className="inline-flex shrink-0">{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className="inline-flex shrink-0">{trailingIcon}</span> : null}
    </button>
  );
});

export default Button;
