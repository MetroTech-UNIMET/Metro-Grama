import type { Id } from './surrealDb';

export interface Course {
  id: Id;
  in: Id;
  out: Id;
  principal_sections: Id[];
  secondary_sections: Id[];
}
