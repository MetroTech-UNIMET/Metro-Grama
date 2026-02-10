import { useMediaQuery } from './use-media-query';

const MOBILE_BREAKPOINT = 768;

export function useBreakpoint(breakpoint: number) {
  const matches = useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
  return !!matches;
}

export function useIsMobile() {
  return useBreakpoint(MOBILE_BREAKPOINT);
}
