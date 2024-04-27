import React from "react";
import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "./button";
import { cn } from "@utils/className";
import { Link, LinkProps, NavLink } from "react-router-dom";

export interface LinkComponentProps
  extends LinkProps,
    VariantProps<typeof buttonVariants> {}

export const ButtonLink = React.forwardRef<
  HTMLAnchorElement,
  LinkComponentProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      {...props}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      {children}
    </Link>
  );
});