import axios from '@/axiosConfig';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';

export async function getAnualOffers() {
  const response = await axios.get('/subject_offer/');
  return response.data as SubjectOfferWithSchedules[];
}

export async function getAnualOffersByTrimester(trimesterId: string) {
  const response = await axios.get(`/subject_offer/${trimesterId}`);
  return response.data as SubjectOfferWithSchedules[];
}