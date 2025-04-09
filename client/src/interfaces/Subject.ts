import { Id } from "./surrealDb";

export interface Subject {
  code: string;
  name: string;
  careers: Id[];
  credits: number;
  BPCredits: number;
}