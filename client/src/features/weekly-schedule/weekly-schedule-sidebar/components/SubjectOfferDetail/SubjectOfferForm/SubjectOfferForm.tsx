import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addMinutes } from 'date-fns';
import { PlusIcon, Trash } from 'lucide-react';

import { transformSchedules, upsertSubjectSchedule } from './functions';
import { subjectScheduleDefaultValues, subjectScheduleSchema, type SubjectScheduleOutput } from './schema';
import { correctIntervalBetweenHours, default10Hour, default8Hour, weekDayOptions } from './constants';

import { cn } from '@utils/className';
import { onInvalidToast } from '@utils/forms';

import TooltipButton from '@ui/derived/tooltip-button';
import { FormTimePickerField } from '@ui/derived/form-fields/form-field-time-picker';
import { FormSelectField } from '@ui/derived/form-fields/form-field-select';
import { SidebarGroup, useSidebar } from '@ui/sidebar';
import { Button } from '@ui/button';
import { Form } from '@ui/form';

import type { SubjectOfferWithSchedules } from '@/interfaces/SubjectOffer';

interface Props {
  subjectOffer: SubjectOfferWithSchedules;
  onBack: () => void;
}

// FIXME - Overflow del boton absoluto
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
    if (subjectOffer.schedules.length > 0) {
      form.resetField('schedules', { defaultValue: transformSchedules(subjectOffer.schedules) });
    }
  }, [subjectOffer, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'schedules',
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
            {fields.map((field, index) => (
              <div key={field.id} className="relative space-y-4">
                {/* TODO - No funciona en el mobile, supongo que tengo que pasar container del sidebar */}
                <FormSelectField
                  name={`schedules.${index}.day_of_week` as const}
                  label="Día"
                  options={weekDayOptions}
                />

                <div className="flex flex-row gap-2">
                  <FormTimePickerField
                    name={`schedules.${index}.starting_time` as const}
                    label="Hora de Inicio"
                    containerClassName="basis-1/2"
                    use12HourFormat
                    hideSeconds
                    onChange={(date, onChange) => {
                      onChange(date);
                      form.setValue(`schedules.${index}.ending_time`, addMinutes(date, correctIntervalBetweenHours));
                    }}
                  />
                  <FormTimePickerField
                    name={`schedules.${index}.ending_time` as const}
                    label="Hora de Finalización"
                    containerClassName="basis-1/2"
                    use12HourFormat
                    hideSeconds
                    readOnly
                    disableHours={{
                      before: fields[index].starting_time,
                    }}
                  />
                </div>

                <RemoveButton disabled={fields.length <= 1} onClick={() => remove(index)} />
              </div>
            ))}
            <div className="flex space-x-2">
              <Button
                type="button"
                colors="success"
                variant="outline"
                onClick={() =>
                  append({
                    starting_time: default8Hour,
                    ending_time: default10Hour,
                    day_of_week: null as any,
                  })
                }
                disabled={fields.length >= 3}
              >
                <PlusIcon />
                Horario
              </Button>
            </div>
            {/* TODO - Loading submit button */}
            <Button type="submit" colors="primary" className="w-full">
              Guardar
            </Button>
          </form>
        </Form>
      </SidebarGroup>
    </>
  );
}

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  const { open } = useSidebar();

  return (
    <div className="fixed z-90 size-9">
      <TooltipButton
        type="button"
        colors="destructive"
        variant="outline"
        size="icon"
        className={cn(
          'absolute -top-23 -right-65 z-90 translate-x-full rounded-full transition-transform',
          !open && 'translate-x-0',
        )}
        tooltipText="Eliminar horario"
        contentClassName="text-destructive bg-destructive-foreground font-bold"
        onClick={onClick}
        disabled={disabled}
      >
        <Trash />
      </TooltipButton>
    </div>
  );
}
