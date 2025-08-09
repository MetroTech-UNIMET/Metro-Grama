import { useCallback, useState } from 'react';

type Direction = 'left' | 'right';

interface Props<NextArgs = undefined, PreviousArgs = undefined, JumpToArgs extends any[] = []> {
  initialDirection?: Direction;

  currentStep: number;
  next: (args?: NextArgs) => Promise<boolean>;
  previous: (args?: PreviousArgs) => Promise<boolean>;
  jumpTo: (step: number, ...args: JumpToArgs) => Promise<boolean>;
}

export function useDirections<NextArgs = undefined, PreviousArgs = undefined, JumpToArgs extends any[] = []>({
  initialDirection,
  currentStep,
  next,
  previous,
  jumpTo,
}: Props<NextArgs, PreviousArgs, JumpToArgs>) {
  const [direction, setDirection] = useState<Direction>(initialDirection ?? 'right');

  const goNext = useCallback(
    async (args?: NextArgs) => {
      const result = await next(args);

      if (result) setDirection('right');

      return result;
    },
    [next],
  );

  const goPrevious = useCallback(
    async (args?: PreviousArgs) => {
      const result = await previous(args);

      if (result) setDirection('left');

      return result;
    },
    [previous],
  );

  const goTo = useCallback(
    async (step: number, ...args: JumpToArgs) => {
      setDirection(step > currentStep ? 'right' : 'left');
      return await jumpTo(step, ...args);
    },
    [currentStep, jumpTo],
  );

  return {
    direction,
    goNext,
    goPrevious,
    goTo,
  };
}
