import { Student } from "@/interfaces/Student";
import axios from "@/axiosConfig";

export async function getStudentProfile(): Promise<Student | null> {
  try {
    const response = await axios.get("/students/profile");
    console.log({response})
    return response.data;
  } catch (error) {
    console.log('error student', error)
    return null;
  }
}
