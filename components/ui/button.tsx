import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] brutal-border transition-all disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-ink text-paper brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
        lime: 'bg-lime text-ink brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
        outline: 'bg-paper text-ink hover:bg-lime',
        ghost: 'border-transparent bg-transparent text-ink hover:bg-muted',
        destructive:
          'bg-ember text-paper brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
      },
      size: {
        default: 'px-6 py-3',
        sm: 'px-4 py-2 text-[10px]',
        lg: 'px-8 py-4',
        icon: 'w-9 h-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
