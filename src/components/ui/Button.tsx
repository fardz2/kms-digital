import React from 'react';
import { Loader2 } from 'lucide-react';

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap';

const VARIANTS = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white rounded-full',
  dark: 'bg-deep-slate hover:bg-primary-600 text-white rounded-full',
  default: 'bg-white border border-light-ash text-deep-slate hover:bg-faint-fog rounded-button',
  secondary: 'bg-white border border-light-ash text-deep-slate hover:bg-faint-fog rounded-button',
  ghost: 'bg-transparent text-deep-slate hover:bg-polar-mist rounded-full',
  destructive: 'bg-white border border-danger/30 text-danger hover:bg-danger hover:text-white rounded-button',
  danger: 'bg-white border border-danger/30 text-danger hover:bg-danger hover:text-white rounded-button',
  link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline rounded-default px-0',
};

const SIZES = {
  sm: 'h-[40px] px-[17px] text-body-sm',
  md: 'h-[48px] px-[25px] text-base',
  lg: 'h-[56px] px-[29px] text-base',
  icon: 'h-[44px] w-[44px] p-0',
};

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

/**
 * Button — reusable button aligned with DESIGN.md (21n adapted).
 *
 * Variants: primary | dark | default | secondary (alias of default) | ghost | destructive | link
 * Sizes:    sm | md | lg | icon
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    children,
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled,
    ...rest
  },
  ref
) {
  const classes = [BASE, VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <Loader2 className="animate-spin" size={16} strokeWidth={1.75} />
      ) : leadingIcon ? (
        <span className="inline-flex shrink-0">{leadingIcon}</span>
      ) : null}
      {children}
      {trailingIcon && !loading ? <span className="inline-flex shrink-0">{trailingIcon}</span> : null}
    </button>
  );
});

export default Button;
