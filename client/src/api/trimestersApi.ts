import axios from '@/axiosConfig';

import type { Trimester } from '@/interfaces/Trimester';

export async function getAllTrimesters() {
  const response = await axios.get('/trimesters/');

  return response.data as Trimester[];
}
