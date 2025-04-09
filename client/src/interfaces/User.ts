import type { Id } from "./surrealDb"

export interface User {
  id: Id
  careerID: string
  email: string
  firstName: string
  lastName: string
  pictureUrl: string
  role: Id<UserRole>
  created: string
}

export enum UserRole {
  user = "user",
  admin = "admin"
}