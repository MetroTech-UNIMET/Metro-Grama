import type { Option, GroupOption } from '../types/option.types';

export function transToGroupOption<
  TValue extends string | number = string | number,
  TData = undefined,
>(options: Option<TValue, TData>[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      '': options,
    };
  }

  const groupOption: GroupOption<TValue, TData> = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || '';
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}
