import axios from "@/axiosConfig";

import type { User } from "@/interfaces/User";

export async function getUserProfile(): Promise<User | null> {
  const response = await axios.get("/users/profile");

  return response.data;
}
