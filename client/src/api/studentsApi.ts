import axios from "@/axiosConfig";

import type { Student } from "@/interfaces/Student";

export async function getStudentProfile(): Promise<Student | null> {
  const response = await axios.get("/students/profile");

  return response.data;
}
