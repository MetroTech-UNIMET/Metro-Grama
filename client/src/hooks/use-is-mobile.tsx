import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useBreakpoint(breakpoin: number) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoin - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoin);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < breakpoin);
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoin]);

  return !!isMobile;
}

export function useIsMobile() {
  return useBreakpoint(MOBILE_BREAKPOINT);
}
