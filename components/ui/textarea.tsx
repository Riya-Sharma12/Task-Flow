import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-paper brutal-border px-3 py-2.5 font-mono text-sm resize-none',
        'focus:outline-none focus:brutal-shadow-sm focus:-translate-x-px focus:-translate-y-px',
        'transition-all placeholder:text-muted-foreground/60',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
