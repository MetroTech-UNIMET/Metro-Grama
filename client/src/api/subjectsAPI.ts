import axios from "@/axiosConfig";

export const getSubjects = async () => {
  const response = await axios.get("/subjects/Ingeniería en Sistemas");
  return response.data;
};
