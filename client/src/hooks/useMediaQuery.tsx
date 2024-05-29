import { useEffect, useState } from "react";

export default function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    const result = window.matchMedia(query);
    result.addEventListener("change", handleMediaQueryChange);
    setMatches(result.matches);

    return () => {
      result.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return matches;
}
