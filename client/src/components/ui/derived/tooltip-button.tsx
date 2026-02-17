import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/className';

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  tooltipText: string;
  contentClassName?: string;
}

export default function TooltipButton({
  tooltipText,
  contentClassName,
  variant = 'ghost',
  size = 'icon',
  className,
  ...buttonProps
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...buttonProps} variant={variant} size={size} className={cn(className)} />
      </TooltipTrigger>

      <TooltipContent className={cn('bg-primary-800 font-bold text-white', contentClassName)}>
        {tooltipText} <TooltipArrow className="fill-primary-800" />
      </TooltipContent>
    </Tooltip>
  );
}
