import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';
import type { SortField, SortDirection } from '@/routes/_navLayout/horario/queryParams';

export function sortSubjectOffers(
  data: SubjectOfferWithSections[],
  orderBy: SortField,
  orderDir: SortDirection,
): SubjectOfferWithSections[] {
  const comparator = getComparator(orderBy);
  return data.sort((a, b) => {
    const cmp = comparator(a, b);
    return orderDir === 'asc' ? cmp : -cmp;
  });
}

function getComparator(orderBy: SortField): (a: SubjectOfferWithSections, b: SubjectOfferWithSections) => number {
  switch (orderBy) {
    case 'avg_difficulty':
      return compareByDifficulty;
    case 'avg_grade':
      return compareByGrade;
    case 'avg_workload':
      return compareByWorkload;
    case 'prelations':
      return compareByPrelations;
    case 'alphabetical':
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
