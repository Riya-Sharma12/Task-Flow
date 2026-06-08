import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'w-full bg-paper brutal-border px-3 py-2.5 font-mono text-sm',
        'focus:outline-none focus:brutal-shadow-sm focus:-translate-x-px focus:-translate-y-px',
        'transition-all placeholder:text-muted-foreground/60',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
