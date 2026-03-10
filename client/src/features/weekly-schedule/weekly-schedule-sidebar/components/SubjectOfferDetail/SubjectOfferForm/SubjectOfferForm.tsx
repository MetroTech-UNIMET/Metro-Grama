import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon } from 'lucide-react';

import { transformSection, upsertSubjectSchedule } from './functions';
import { subjectScheduleDefaultValues, subjectScheduleSchema, type SubjectScheduleOutput } from './schema';
import { defaultSchedule } from './constants';
import { SectionField } from './components/SectionField';

import { isSomeFieldDirty, onInvalidToast } from '@utils/forms';
import { createSurrealId } from '@utils/queries';
import { queryKeys } from '@/lib/query-keys';

import SubmitButton from '@ui/derived/submit-button';
import { SidebarGroup } from '@ui/sidebar';
import { Button } from '@ui/button';
import { Form } from '@ui/form';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onBack: (filteredSections: SubjectScheduleOutput['sections']) => void;
}

export default function SubjectOfferForm({ subjectOffer, onBack }: Props) {
  const form = useForm({
    resolver: zodResolver(subjectScheduleSchema),
    mode: 'onChange',
    defaultValues: {
      ...subjectScheduleDefaultValues,
      subject_offer_id: createSurrealId('subject_offer' as const, subjectOffer.id.ID),
    },
  });

  const { resetField } = form;

  const queryClient = useQueryClient();

  useEffect(() => {
    if (subjectOffer.sections.length > 0) {
      resetField('subject_offer_id', {
        defaultValue: createSurrealId('subject_offer' as const, subjectOffer.id.ID),
      });
      resetField('sections', { defaultValue: transformSection(subjectOffer.sections) });
    }
  }, [subjectOffer, resetField]);

  const {
    fields: sections,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  async function onSubmit({ sections, ...rest }: SubjectScheduleOutput) {
    // Only persist sections that are dirty (changed or newly added)
    const dirtySections = form.formState.dirtyFields?.sections;

    const isDirty = (s: Exclude<typeof dirtySections, undefined>[number]): boolean => {
      if (s === undefined) return false;
      if (isSomeFieldDirty(s)) return true;

      return false;
    };

    const filteredSections = Array.isArray(dirtySections)
      ? sections.filter((_, index) => isDirty(dirtySections[index]))
      : sections;

    const payload: SubjectScheduleOutput = {
      ...rest,
      sections: filteredSections,
    };

    await upsertSubjectSchedule(payload);
    await queryClient.invalidateQueries({
      queryKey: queryKeys.subjectOffers._def,
    });

    form.reset();
    onBack(filteredSections);
  }

  return (
    <>
      <SidebarGroup className="pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalidToast)} className="space-y-4">
            {sections.map((field, index) => (
              <SectionField
                key={field.id}
                sectionIndex={index}
                removeSection={remove}
                last_student_editor={subjectOffer.sections[index]?.last_student_editor || null}
              />
            ))}
            <div className="flex space-x-2">
              <Button
                type="button"
                colors="success"
                variant="outline"
                onClick={() => append({ subject_section_id: undefined, schedules: [defaultSchedule, defaultSchedule] })}
                disabled={sections.length >= 10}
              >
                <PlusIcon />
                Horario
              </Button>
            </div>
            <SubmitButton
              colors="primary"
              className="w-full"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              Guardar
            </SubmitButton>
          </form>
        </Form>
      </SidebarGroup>
    </>
  );
}
