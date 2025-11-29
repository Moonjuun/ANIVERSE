import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-zinc-900 rounded-xl transition-all duration-300 hover:bg-zinc-800 hover:scale-[1.02]',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-4 md:p-6', className)} {...props} />
    );
  }
);

CardContent.displayName = 'CardContent';





