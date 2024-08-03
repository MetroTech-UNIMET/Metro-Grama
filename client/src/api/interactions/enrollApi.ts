import axios from "@/axiosConfig";

export async function enrollStudent(subjects: string[]) {
  return await axios.post("/enroll/", {
    subjects,
  });
}

export async function unenrollStudent(subjects: string[]) {
  return await axios.delete("/enroll/", {
    data: {
      subjects,
    },
  });
}

export async function getEnrolledSubjects(): Promise<string[]> {
  const response = await axios.get("/enroll/");

  return response.data.subjects;
}
