import type { TrimesterOption } from '@/hooks/queries/trimester/use-FetchTrimesters';

export function getInitialTrimester(trimestersOptions: TrimesterOption[]) {
  let found: TrimesterOption | undefined = undefined;
  for (const option of trimestersOptions) {
    if (option.data?.is_current) {
      found = option;
      break;
    }
    if (!found && option.data?.is_next) {
      found = option;
    }
  }
  return found;
}
