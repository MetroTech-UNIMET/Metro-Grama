import { mergeQueryKeys } from '@lukemorales/query-key-factory';

import { careers } from './queries/careers';
import { course } from './queries/course';
import { lazy } from './queries/lazy';
import { notifications } from './queries/notifications';
import { preferences } from './queries/preferences';
import { student } from './queries/student';
import { subjects } from './queries/subjects';
import { subjectOffers } from './queries/subjectOffers';
import { trimesters } from './queries/trimesters';
import { users } from './queries/users';

import { authMutationKeys } from './mutations/auth';
import { careersMutationKeys } from './mutations/careers';
import { enrollMutationKeys } from './mutations/enroll';
import { formStepMutationKeys } from './mutations/form-step';
import { friendsMutationKeys } from './mutations/friends';
import { offersMutationKeys } from './mutations/offers';
import { preferencesMutationKeys } from './mutations/preferences';
import { scheduleMutationKeys } from './mutations/schedule';
import { subjectsMutationKeys } from './mutations/subjects';

const mergedQueryKeys = mergeQueryKeys(
  careers,
  course,
  notifications,
  preferences,
  users,
  student,
  trimesters,
  subjects,
  subjectOffers,
  lazy,
);

export const queryKeys = {
  ...mergedQueryKeys,
  preferences: mergedQueryKeys.student_preferences,
};

export const mutationKeys = {
  auth: authMutationKeys,
  careers: careersMutationKeys,
  friends: friendsMutationKeys,
  schedule: scheduleMutationKeys,
  preferences: preferencesMutationKeys,
  enroll: enrollMutationKeys,
  subjects: subjectsMutationKeys,
  offers: offersMutationKeys,
  formStep: formStepMutationKeys,
};

export {
  careers,
  course,
  lazy,
  notifications,
  preferences,
  student,
  subjects,
  trimesters,
  users,
  authMutationKeys,
  careersMutationKeys,
  enrollMutationKeys,
  formStepMutationKeys,
  friendsMutationKeys,
  offersMutationKeys,
  preferencesMutationKeys,
  scheduleMutationKeys,
  subjectsMutationKeys,
};
