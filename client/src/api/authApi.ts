import axios from "@/axiosConfig";

export async function logOutGoogle() {
  return await axios.get("/auth/google/logout");
}
