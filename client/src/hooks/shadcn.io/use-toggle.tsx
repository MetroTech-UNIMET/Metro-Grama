"use client";

import * as React from "react";

type UseToggleReturn = [
  boolean,
  () => void,
  React.Dispatch<React.SetStateAction<boolean>>
];

export function useToggle(defaultValue = false): UseToggleReturn {
  if (typeof defaultValue !== "boolean") {
    throw new Error("defaultValue must be `true` or `false`");
  }
  
  const [value, setValue] = React.useState(defaultValue);

  const toggle = React.useCallback(() => {
    setValue((x) => !x);
  }, []);

  return [value, toggle, setValue];
}

export type { UseToggleReturn };