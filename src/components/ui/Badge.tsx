'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'new';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-foreground-muted border-border',
  success: 'bg-success/10 text-success border-success/25',
  error: 'bg-error/10 text-error border-error/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  info: 'bg-info/10 text-info border-info/25',
  primary: 'bg-primary/10 text-primary border-primary/25',
  new: 'bg-gradient-to-r from-primary to-accent text-white border-transparent',
};

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'text-xs font-semibold border',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
