export interface User {
  id: string
  careerID: string
  email: string
  firstName: string
  lastName: string
  pictureUrl: string
  role: UserRole
  created: string
}

export enum UserRole {
  user = "role:user",
  admin = "role:admin"
}