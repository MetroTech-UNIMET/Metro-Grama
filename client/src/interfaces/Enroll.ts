import { Id } from "./surrealDb";

export interface EnrollEntity {
  id: Id
  in: Id<'student'>
  out: Id<'subject'>

  trimester: Id<'trimester'>

  grade: number
  difficulty: number | null
  workload: number | null
}