import { cn } from '@/lib/utils/className';
import { cva, VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border border-neutral-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 dark:border-neutral-800 dark:focus:ring-neutral-300',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-neutral-900 text-neutral-50 shadow-sm hover:bg-neutral-900/80 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/80',
          primary: 'border-transparent bg-primary-100 text-primary-700 hover:bg-primary-200/80 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-900/80',
        secondary: 'border-transparent bg-secondary-50 text-neutral-900 hover:bg-secondary-200/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80 dark:bg-destructive dark:text-neutral-50 dark:hover:bg-destructive/80',
        outline: 'text-neutral-950 dark:text-neutral-50',
        gray: 'border-transparent bg-neutral-200 hover:bg-neutral-300/80 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50',
      },
      overflow: {
        default: '',
        ellipsis: 'block max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap',
      },
    },
    defaultVariants: {
      variant: 'default',
      overflow: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, overflow, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, overflow }), className)} {...props} />;
}
