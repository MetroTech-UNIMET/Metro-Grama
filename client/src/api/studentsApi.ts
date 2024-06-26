import { Student } from "@/interfaces/Student";
import axios from "@/axiosConfig";

export async function getStudentProfile(): Promise<Student | null> {
  const response = await axios.get("/students/profile");

  return response.data;
}
