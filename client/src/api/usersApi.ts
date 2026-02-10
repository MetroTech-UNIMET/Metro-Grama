import axios from "@/axiosConfig";

import type { User } from "@/interfaces/User";

export async function getUserProfile() {
  const response = await axios.get<User | null>("/users/profile");

  return response.data;
}
