/**
 * GVTypography — GestaltView design-system typography primitives
 * Maps to CSS custom properties defined in index.css from design_tokens.json
 */
import React from 'react';
import { cn } from '@/lib/utils';

// ── Logo / Brand ─────────────────────────────────────────────────────────────
interface GVLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
  xl: 'text-7xl',
};

export function GVLogo({ size = 'md', glow = false, className, children, ...props }: GVLogoProps) {
  return (
    <span
      className={cn(
        'font-logo tracking-tight',
        sizeMap[size],
        glow && 'gv-glow-text',
        className
      )}
      {...props}
    >
      {children ?? 'GestaltView'}
    </span>
  );
}

// ── Display Heading ───────────────────────────────────────────────────────────
interface GVHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  gradient?: 'cyan' | 'gold' | 'mint' | 'none';
  eyebrow?: string;
}

export function GVHeading({
  as: Tag = 'h2',
  gradient = 'none',
  eyebrow,
  className,
  children,
  ...props
}: GVHeadingProps) {
  const gradientClass =
    gradient === 'cyan' ? 'gv-gradient-text' :
    gradient === 'gold' ? 'gv-gradient-text-gold' :
    gradient === 'mint' ? 'gv-gradient-text-mint' :
    'text-[var(--gv-soft-parchment)]';

  return (
    <div>
      {eyebrow && <p className="gv-eyebrow mb-2">{eyebrow}</p>}
      <Tag
        className={cn('font-display font-semibold leading-tight', gradientClass, className)}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}

// ── Body Text ─────────────────────────────────────────────────────────────────
interface GVBodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  muted?: boolean;
  size?: 'sm' | 'base' | 'lg';
}

export function GVBody({ muted = false, size = 'base', className, children, ...props }: GVBodyProps) {
  return (
    <p
      className={cn(
        'font-body leading-relaxed',
        size === 'sm' && 'text-sm',
        size === 'lg' && 'text-lg',
        muted ? 'text-[var(--muted-foreground)]' : 'text-[var(--gv-soft-parchment)]',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// ── Mono / Code ───────────────────────────────────────────────────────────────
interface GVMonoProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean;
}

export function GVMono({ block = false, className, children, ...props }: GVMonoProps) {
  if (block) {
    return (
      <pre
        className={cn(
          'font-mono-data text-[var(--gv-electric-cyan)] text-sm',
          'bg-[rgba(18,214,255,0.05)] border border-[rgba(18,214,255,0.15)]',
          'rounded-[var(--gv-radius-sm)] p-4 overflow-x-auto',
          className
        )}
        {...(props as React.HTMLAttributes<HTMLPreElement>)}
      >
        {children}
      </pre>
    );
  }
  return (
    <code
      className={cn(
        'font-mono-data text-[var(--gv-electric-cyan)] text-sm',
        'bg-[rgba(18,214,255,0.08)] px-1.5 py-0.5 rounded-[4px]',
        className
      )}
      {...(props as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </code>
  );
}

// ── Eyebrow ───────────────────────────────────────────────────────────────────
export function GVEyebrow({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('gv-eyebrow', className)} {...props}>
      {children}
    </p>
  );
}

// ── Parchment Panel wrapper ───────────────────────────────────────────────────
export function GVParchmentPanel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('gv-parchment-panel p-6', className)} {...props}>
      {children}
    </div>
  );
}
