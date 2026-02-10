import axios from '@/axiosConfig';

import type { SubjectOffer, SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SubjectEntity } from '@/interfaces/Subject';
import type { Id } from '@/interfaces/surrealDb';
import type { SuccessResponse } from './types';

export interface Query_AnnualOffers {
  careers?: string[];
  subjectsFilter?: 'enrollable' | 'none';
}
export async function getAnualOffers(query: Query_AnnualOffers = {}) {
  const queryParams = new URLSearchParams();

  if (query.careers && query.careers.length > 0) queryParams.append('careers', query.careers.join(','));

  if (query.subjectsFilter) queryParams.append('subjectsFilter', query.subjectsFilter);

  const response = await axios.get(`/subject_offer/?${queryParams.toString()}`);
  return response.data as SubjectOfferWithSections[];
}

export async function getAnualOffersByTrimester(trimesterId: string, query: Query_AnnualOffers = {}) {
  const queryParams = new URLSearchParams();

  if (query.careers && query.careers.length > 0) queryParams.append('careers', query.careers.join(','));

  if (query.subjectsFilter) queryParams.append('subjectsFilter', query.subjectsFilter);

  const response = await axios.get(`/subject_offer/${trimesterId}?${queryParams.toString()}`);
  return response.data as SubjectOfferWithSections[];
}

export interface AnnualOfferByYearItem {
  subject: SubjectEntity;
  period: number;
  trimesters: Id[];
}

export async function getAnnualOfferByYear(year: string, career: string | undefined) {
  const params = new URLSearchParams();
  if (career) params.append('career', career);

  const res = await axios.get(`/subject_offer/annual/${encodeURIComponent(year)}?${params.toString()}`);
  return res.data as AnnualOfferByYearItem[];
}

export async function createOfferForSubject(subjectId: string, trimesterId: Id) {
  const response = await axios.post<SuccessResponse<SubjectOffer>>(`/subject_offer/${subjectId}`, { trimesterId });
  return response.data;
}

export async function deleteSubjectOffer(subjectId: string, trimesterId: Id) {
  const response = await axios.delete<SuccessResponse<SubjectOffer>>(`/subject_offer/${subjectId}`, {
    data: { trimesterId },
  });
  return response.data;
}

export async function uploadAnnualOfferPDF(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post<
    SuccessResponse<{
      period: string;
      subject_offers: SubjectOfferWithSections[];
    }>
  >(`/subject_offer/upload`, formData);

  return res.data;
}
