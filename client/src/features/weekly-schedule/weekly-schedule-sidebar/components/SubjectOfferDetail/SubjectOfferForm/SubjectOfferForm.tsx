import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMinutes } from 'date-fns';
import { CalendarPlus, Plus, PlusIcon, Trash } from 'lucide-react';

import { transformSection, upsertSubjectSchedule } from './functions';
import {
  subjectScheduleDefaultValues,
  SubjectScheduleInput,
  subjectScheduleSchema,
  type SubjectScheduleOutput,
} from './schema';
import { correctIntervalBetweenHours, defaultSchedule, weekDayOptions } from './constants';

import { cn } from '@utils/className';
import { onInvalidToast } from '@utils/forms';

import { FormTimePickerField } from '@ui/derived/form-fields/form-field-time-picker';
import { FormInputField } from '@ui/derived/form-fields/form-field-input';
import { FormSelectField } from '@ui/derived/form-fields/form-field-select';
import TooltipButton from '@ui/derived/tooltip-button';
import { SidebarGroup, useSidebar } from '@ui/sidebar';
import { Button } from '@ui/button';
import { Form } from '@ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover';

import type { SubjectOfferWithSections } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSections;
  onBack: () => void;
}

export default function SubjectOfferForm({ subjectOffer, onBack }: Props) {
  const form = useForm({
    resolver: zodResolver(subjectScheduleSchema),
    mode: 'onChange',
    defaultValues: {
      ...subjectScheduleDefaultValues,
      subject_offer_id: {
        ID: subjectOffer.id.ID,
        Table: 'subject_offer' as const,
      },
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (subjectOffer.sections.length > 0) {
      form.resetField('sections', { defaultValue: transformSection(subjectOffer.sections) });
    }
  }, [subjectOffer, form]);

  const {
    fields: sections,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  async function onSubmit(data: SubjectScheduleOutput) {
    await upsertSubjectSchedule(data);
    await queryClient.invalidateQueries({
      queryKey: ['subjects', 'offer'],
    });

    form.reset();
    onBack();
  }

  return (
    <>
      <SidebarGroup className="pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalidToast)} className="space-y-4">
            {sections.map((field, index) => (
              <SectionField key={field.id} sectionIndex={index} removeSection={remove} />
            ))}
            <div className="flex space-x-2">
              <Button
                type="button"
                colors="success"
                variant="outline"
                onClick={() => append({ schedules: [defaultSchedule, defaultSchedule] })}
                disabled={sections.length >= 10}
              >
                <PlusIcon />
                Horario
              </Button>
            </div>
            {/* TODO - Loading submit button */}
            <Button
              type="submit"
              colors="primary"
              className="w-full"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              Guardar
            </Button>
          </form>
        </Form>
      </SidebarGroup>
    </>
  );
}

function SectionField({
  sectionIndex,
  removeSection,
}: {
  sectionIndex: number;
  removeSection: (index: number) => void;
}) {
  const { setValue, control } = useFormContext<SubjectScheduleInput>();
  const baseSectionName = `sections.${sectionIndex}` as const;

  const {
    fields: schedules,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `${baseSectionName}.schedules`,
  });
  // Use stateful callback ref so children re-render once the element is mounted.
  const [popoverContainer, setPopoverContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="relative rounded-md border p-4">
      <Popover>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-bold">Sección {sectionIndex + 1}</h3>

          <div>
            <TooltipButton
              type="button"
              colors="destructive"
              variant="outline"
              size="icon"
              className="rounded-r-none"
              tooltipText="Eliminar sección"
              onClick={() => removeSection(sectionIndex)}
            >
              <Trash />
            </TooltipButton>

            <PopoverTrigger>
              <TooltipButton
                type="button"
                variant="outline"
                size="icon"
                className="rounded-l-none border-blue-600 text-blue-600"
                tooltipText="Modificar horarios"
              >
                <CalendarPlus />
              </TooltipButton>
            </PopoverTrigger>
          </div>
        </div>
        <FormInputField name={`${baseSectionName}.classroom_code`} placeholder="Código del aula" />

        <PopoverContent className="w-80 px-5" ref={setPopoverContainer}>
          <Button
            type="button"
            colors="success"
            variant="outline"
            className="w-full"
            onClick={() => append(defaultSchedule)}
            disabled={schedules.length >= 3}
          >
            Agregar horario (Sección {sectionIndex + 1}) <Plus />
          </Button>
          <div className="mt-4">
            {schedules.map((field, schIndex) => (
              <div key={field.id} className="relative space-y-4">
                {/* TODO - No funciona en el mobile, supongo que tengo que pasar container del sidebar */}
                <FormSelectField
                  name={`${baseSectionName}.schedules.${schIndex}.day_of_week` as const}
                  label="Día"
                  options={weekDayOptions}
                  popoverContainer={popoverContainer ?? undefined}
                />

                <div className="flex flex-row gap-2">
                  <FormTimePickerField
                    name={`${baseSectionName}.schedules.${schIndex}.starting_time` as const}
                    label="Hora de Inicio"
                    containerClassName="basis-1/2"
                    use12HourFormat
                    hideSeconds
                    onChange={(date, onChange) => {
                      onChange(date);
                      setValue(
                        `${baseSectionName}.schedules.${schIndex}.ending_time`,
                        addMinutes(date, correctIntervalBetweenHours),
                      );
                    }}
                  />
                  <FormTimePickerField
                    name={`${baseSectionName}.schedules.${schIndex}.ending_time` as const}
                    label="Hora de Finalización"
                    containerClassName="basis-1/2"
                    use12HourFormat
                    hideSeconds
                    readOnly
                    disableHours={{
                      before: schedules[schIndex].starting_time,
                    }}
                  />
                </div>

                <RemoveButton disabled={schedules.length <= 1} onClick={() => remove(schIndex)} />
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const { open } = useSidebar();

  return (
    // <div className="fixed z-90 size-9">
    <TooltipButton
      type="button"
      colors="destructive"
      variant="outline"
      size="icon"
      className={cn(
        'absolute top-[45%] right-0 z-90 translate-x-full rounded-full transition-transform',
        !open && 'translate-x-0',
      )}
      tooltipText="Eliminar horario"
      contentClassName="text-destructive bg-destructive-foreground font-bold"
      onClick={onClick}
      disabled={disabled}
    >
      <Trash />
    </TooltipButton>
    // </div>
  );
}
