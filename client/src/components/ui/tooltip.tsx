'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils/className';
import { useMediaQuery } from '@/hooks/media-query/use-media-query';

const useHasHover = () => useMediaQuery('(hover: hover)');

type TooltipTriggerContextType = {
  supportMobileTap: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const TooltipTriggerContext = React.createContext<TooltipTriggerContextType>({
  supportMobileTap: false,
  open: false,
  setOpen: () => {},
});

const TooltipProvider = TooltipPrimitive.Provider;

// const Tooltip = TooltipPrimitive.Root;

function Tooltip({ children, ...props }: TooltipPrimitive.TooltipProps & { supportMobileTap?: boolean }) {
  const [open, setOpen] = React.useState<boolean>(props.defaultOpen ?? false);
  const hasHover = useHasHover();

  return (
    <TooltipPrimitive.Root
      delayDuration={!hasHover && props.supportMobileTap ? 0 : props.delayDuration}
      onOpenChange={setOpen}
      open={open}
    >
      <TooltipTriggerContext.Provider
        value={{
          open,
          setOpen,
          supportMobileTap: props.supportMobileTap ?? false,
        }}
      >
        {children}
      </TooltipTriggerContext.Provider>
    </TooltipPrimitive.Root>
  );
}
Tooltip.displayName = TooltipPrimitive.Root.displayName;

function TooltipTrigger({
  children,
  onClick: onClickProp,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const hasHover = useHasHover();
  const { setOpen, supportMobileTap } = React.useContext(TooltipTriggerContext);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hasHover && supportMobileTap) {
        e.preventDefault();
        setOpen(true);
      } else {
        onClickProp?.(e);
      }
    },
    [setOpen, hasHover, supportMobileTap, onClickProp],
  );

  return (
    <TooltipPrimitive.Trigger {...props} onClick={onClick}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipArrow = TooltipPrimitive.Arrow;

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipArrow, TooltipContent, TooltipProvider };
