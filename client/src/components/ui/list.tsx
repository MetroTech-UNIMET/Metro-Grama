import React from "react";
import { cn } from "@/lib/utils/className";

function ListContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        `z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md`,
        className
      )}
      {...props}
    />
  );
}

function ListItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        `flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors 
        focus:bg-accent focus:text-accent-foreground
        hover:bg-accent hover:text-accent-foreground`,
        className
      )}
      {...props}
    />
  );
}

export { ListContent, ListItem };
