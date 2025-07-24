import { Id } from "./surrealDb";

export interface Subject {
  code: Id;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
}