import { cn } from "@utils/className";
import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const loaderVariants = cva("animate-spin text-primary", {
  variants: {
    size: {
      small: "size-6",
      medium: "size-8",
      large: "size-12",
      giant: "size-24",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

interface SpinnerContentProps extends VariantProps<typeof loaderVariants> {
  className?: string;
  show?: boolean;
}

export function Spinner({ size, show = true, className }: SpinnerContentProps) {
  return (
    <Loader2
      className={cn(
        loaderVariants({ size }),
        className,
        show === false && "hidden"
      )}
    />
  );
}
