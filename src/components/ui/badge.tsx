import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'genre' | 'rating';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center rounded-full text-xs font-medium';

    const variants = {
      default: 'bg-zinc-800 text-zinc-300 px-2.5 py-1',
      genre: 'bg-zinc-800 text-zinc-300 px-2.5 py-1',
      rating: 'bg-yellow-400/20 text-yellow-400 px-2.5 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';




