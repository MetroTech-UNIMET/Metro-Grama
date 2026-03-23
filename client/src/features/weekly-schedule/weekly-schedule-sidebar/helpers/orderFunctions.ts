import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import { type SortDirection } from '@/routes/_navLayout/horario/queryParams';
import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';

export function sortSubjectOffers(
  data: SubjectOfferWithSections[],
  orderBy: OrderBySubjectOffers | undefined,
  orderDir: SortDirection,
): SubjectOfferWithSections[] {
  if (!orderBy) return data;
  const comparator = getComparator(orderBy);
  return data.sort((a, b) => {
    const cmp = comparator(a, b);
    return orderDir === 'asc' ? cmp : -cmp;
  });
}

function getComparator(
  orderBy: OrderBySubjectOffers,
): (a: SubjectOfferWithSections, b: SubjectOfferWithSections) => number {
  switch (orderBy) {
    case OrderBySubjectOffers.Difficulty:
      return compareByDifficulty;
    case OrderBySubjectOffers.Grade:
      return compareByGrade;
    case OrderBySubjectOffers.Workload:
      return compareByWorkload;
    case OrderBySubjectOffers.Prelations:
      return compareByPrelations;
    case OrderBySubjectOffers.Friends:
      return compareByFriends;
    case OrderBySubjectOffers.Alphabetical:
    default:
      return compareByName;
  }
}

function compareByDifficulty(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.avg_difficulty ?? 0) - (b.avg_difficulty ?? 0);
}

function compareByGrade(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.avg_grade ?? 0) - (b.avg_grade ?? 0);
}

function compareByWorkload(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.avg_workload ?? 0) - (b.avg_workload ?? 0);
}

function compareByPrelations(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.prelations?.length ?? 0) - (b.prelations?.length ?? 0);
}

function compareByName(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.subject?.name ?? '').localeCompare(b.subject?.name ?? '');
}

function compareByFriends(a: SubjectOfferWithSections, b: SubjectOfferWithSections) {
  return (a.differentFriends ?? 0) - (b.differentFriends ?? 0);
}
