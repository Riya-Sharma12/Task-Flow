import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center font-mono text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 brutal-border',
  {
    variants: {
      variant: {
        default: 'bg-paper text-muted-foreground',
        pending: 'bg-paper text-muted-foreground',
        completed: 'bg-ink text-paper',
        lime: 'bg-lime text-ink',
        destructive: 'bg-ember text-paper',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
