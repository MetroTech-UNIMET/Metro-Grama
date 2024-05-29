import axios from "@/axiosConfig";

export async function enrollStudent(subjects: string[]) {
  // throw new Error("Not implemented");
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
