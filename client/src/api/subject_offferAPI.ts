import axios from '@/axiosConfig';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

export interface Query_AnnualOffers {
  careers?: string[];
}
export async function getAnualOffers(query: Query_AnnualOffers = {}) {
  const queryParams = new URLSearchParams();

  if (query.careers && query.careers.length > 0) {
    queryParams.append('careers', query.careers.join(','));
  }

  const response = await axios.get(`/subject_offer/?${queryParams.toString()}`);
  return response.data as SubjectOfferWithSections[];
}

export async function getAnualOffersByTrimester(trimesterId: string, query: Query_AnnualOffers = {}) {
  const queryParams = new URLSearchParams();

  if (query.careers && query.careers.length > 0) {
    queryParams.append('careers', query.careers.join(','));
  }
  const response = await axios.get(`/subject_offer/${trimesterId}?${queryParams.toString()}`);
  return response.data as SubjectOfferWithSections[];
}
