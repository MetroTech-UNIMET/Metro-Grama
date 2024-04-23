import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@utils/className";

type Orientation = "horizontal" | "vertical";
type Direction = "left" | "right" | "top" | "bottom";

const DrawerContext = React.createContext<{
  orientation: Orientation;
  direction: Direction;
}>({
  orientation: "horizontal",
  direction: "left",
});

const Drawer = ({
  shouldScaleBackground = true,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
  orientation?: Orientation;
}) => (
  <DrawerContext.Provider
    value={{
      orientation,
      direction: props.direction ?? "left",
    }}
  >
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  </DrawerContext.Provider>
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { orientation, direction } = React.useContext(DrawerContext);

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex h-auto flex-col rounded-t-[10px] border bg-background",
          orientation === "horizontal"
            ? "inset-x-0 bottom-0 mt-24"
            : "top-0 w-screen max-w-md h-full",

          direction === "left" && orientation === "vertical" && "left-0",
          direction === "right" && orientation === "vertical" && "right-0",

          className
        )}
        {...props}
      >
        <div className="relative h-full">
          <div
            className={cn(
              "mx-auto mt-4  rounded-full bg-muted",
              orientation === "horizontal"
                ? "w-[100px] h-2"
                : "w-2 h-[100px] absolute top-1/2 -translate-y-1/2",

              direction === "left" && orientation === "vertical" && "right-2",
              direction === "right" && orientation === "vertical" && "left-2"
            )}
          />

          <main
            className={cn(
              "h-full",
              direction === "left" && orientation === "vertical" && "pr-6",
              direction === "right" && orientation === "vertical" && "pl-6"
            )}
          >
            {children}
          </main>
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
