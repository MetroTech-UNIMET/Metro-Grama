import axios from '@/axiosConfig';

import type { Trimester } from '@/interfaces/Trimester';

export interface QueryTrimesterParams {
  noFuture?: boolean;
}

export async function getAllTrimesters({ noFuture }: QueryTrimesterParams = { noFuture: false }) {
  const response = await axios.get('/trimesters/', {
    params: {
      noFuture,
    },
  });

  return response.data as Trimester[];
}
