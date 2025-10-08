import type { Id } from './surrealDb';

export interface Trimester {
  id: Id<'trimester'>;
  starting_date: string;
  ending_date: string;
  intensive: boolean;

  is_current: boolean;
  is_next: boolean;
}
