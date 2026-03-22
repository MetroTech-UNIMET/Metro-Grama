import { addMinutes, format } from 'date-fns';
import { useFieldArray, useWatch, type UseFieldArrayRemove, useFormContext } from 'react-hook-form';
import { CircleQuestionMarkIcon, Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';

import { defaultScheduleBlock, type StudentSettingsFormOutput, type StudentSettingsFormInput } from '../schema';

import { orderSelectOptions } from '@/features/weekly-schedule/weekly-schedule-sidebar/components/PlannerSidebar/constants';
import { WeeklyPlanner } from '@/features/weekly-schedule/weekly-planner/WeeklyPlanner';

import { weekDayOptions } from '@/lib/constants/date';
import { cn } from '@utils/className';

import { Button } from '@ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@ui/form';
import { Tooltip, TooltipTrigger, TooltipContent } from '@ui/tooltip';

import { FormSelectField } from '@ui/derived/form-fields/form-field-select';
import { FormTimePickerField } from '@ui/derived/form-fields/form-field-time-picker';

import { OrderBySubjectOffers } from '@/interfaces/preferences/StudentPreferences';
import type { Event } from '@/features/weekly-schedule/weekly-planner/types';

type ScheduleType = 'preferred' | 'prohibited';
type SchedulePath = `schedulePreferences.${ScheduleType}_schedules`;

export function ScheduleSection() {
  return (
    <>
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Preferencias de horario</h2>
        <p className="text-muted-foreground text-sm">Define bloques preferidos y bloques prohibidos para tus clases.</p>
      </section>

      <FormSelectField<StudentSettingsFormInput, OrderBySubjectOffers>
        name="schedulePreferences.default_order"
        label="Orden por defecto"
        descriptionLabel={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" size="icon" variant="ghost" className="ml-2">
                <CircleQuestionMarkIcon />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Selecciona en base a qué orden quieres cargar las materias al cargarlas en el horario
            </TooltipContent>
          </Tooltip>
        }
        options={orderSelectOptions}
        className="min-w-56"
      />

      <div className="flex flex-col gap-8 md:flex-row">
        <ScheduleListSection type="preferred" />
        <ScheduleListSection type="prohibited" />
      </div>

      <SchedulePreview />
    </>
  );
}

function ScheduleListSection({ type }: { type: ScheduleType }) {
  const form = useFormContext<StudentSettingsFormInput, unknown, StudentSettingsFormOutput>();
  const fieldName: SchedulePath = `schedulePreferences.${type}_schedules`;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldName,
  });

  const isPreferred = type === 'preferred';

  return (
    <div className="space-y-4 rounded border border-dashed p-2 md:w-1/2">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">{isPreferred ? 'Horarios preferidos' : 'Horarios prohibidos'}</h3>
        <Button
          type="button"
          variant="outline"
          colors={isPreferred ? 'success' : 'destructive'}
          onClick={() => append(defaultScheduleBlock)}
        >
          <Plus className="size-4" />
          Agregar bloque
        </Button>
      </div>

      <div className="flex flex-row flex-wrap justify-between gap-4">
        {fields.length === 0 && (
          <p className="text-muted-foreground text-sm">
            {isPreferred ? 'No hay bloques preferidos registrados.' : 'No hay bloques prohibidos registrados.'}
          </p>
        )}

        {fields.map((field, index) => (
          <ScheduleBlockInput key={field.id} index={index} type={type} remove={remove} />
        ))}
      </div>
    </div>
  );
}

function SchedulePreview() {
  const form = useFormContext<StudentSettingsFormInput, unknown, StudentSettingsFormOutput>();
  const preferredSchedules = useWatch({
    control: form.control,
    name: 'schedulePreferences.preferred_schedules',
  });
  const prohibitedSchedules = useWatch({
    control: form.control,
    name: 'schedulePreferences.prohibited_schedules',
  });

  const plannerEvents = useMemo(() => {
    const preferredEvents: Event<{ preferenceType: 'preferred' | 'prohibited' }>[] = (preferredSchedules ?? []).map(
      (schedule, index) => ({
        id: `preferred-${index}`,
        title: 'Preferido',
        dayIndex: schedule.day_of_week as Event['dayIndex'],
        start_hour: format(schedule.starting_time, 'HH:mm') as `${string}:${string}`,
        end_hour: format(schedule.ending_time, 'HH:mm') as `${string}:${string}`,
        data: { preferenceType: 'preferred' },
      }),
    );

    const prohibitedEvents: Event<{ preferenceType: 'preferred' | 'prohibited' }>[] = (prohibitedSchedules ?? []).map(
      (schedule, index) => ({
        id: `prohibited-${index}`,
        title: 'Prohibido',
        dayIndex: schedule.day_of_week as Event['dayIndex'],
        start_hour: format(schedule.starting_time, 'HH:mm') as `${string}:${string}`,
        end_hour: format(schedule.ending_time, 'HH:mm') as `${string}:${string}`,
        data: { preferenceType: 'prohibited' },
      }),
    );

    return [...preferredEvents, ...prohibitedEvents];
  }, [preferredSchedules, prohibitedSchedules]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Vista previa semanal</h2>
        <p className="text-muted-foreground text-sm">Verde: horarios preferidos. Rojo: horarios prohibidos.</p>
      </div>

      <div className="max-h-120 overflow-auto rounded-md border p-3">
        <WeeklyPlanner
          events={plannerEvents}
          type="uniform-interval"
          start_hour="00:00"
          end_hour="24:00"
          interval={30}
          getEventColorId={(event) => event.data.preferenceType}
          overlapping
        />
      </div>
    </section>
  );
}

function ScheduleBlockInput({
  type,
  index,
  remove,
}: {
  type: 'preferred' | 'prohibited';
  index: number;
  remove: UseFieldArrayRemove;
}) {
  const form = useFormContext<StudentSettingsFormInput, unknown, StudentSettingsFormOutput>();

  const fieldName: SchedulePath = `schedulePreferences.${type}_schedules`;
  const blockName = `${fieldName}.${index}` as const;

  const errorMessage = form.getFieldState(blockName, form.formState).error?.message;

  const startingTime = useWatch({
    control: form.control,
    name: `${blockName}.starting_time`,
  });

  return (
    <FormField
      name={blockName}
      render={() => (
        <FormItem
          className={cn(
            'flex w-full flex-col gap-3 space-y-0 rounded-md border p-3 md:max-w-55 md:min-w-50',
            errorMessage && 'border-destructive',
          )}
        >
          <FormControl>
            <div>
              <FormSelectField<StudentSettingsFormInput, number>
                name={`schedulePreferences.${type}_schedules.${index}.day_of_week` as const}
                label="Día"
                options={weekDayOptions}
              />

              <FormTimePickerField<StudentSettingsFormInput>
                name={`schedulePreferences.${type}_schedules.${index}.starting_time` as const}
                label="Hora inicio"
                use12HourFormat
                hideSeconds
                onChange={(date, onChange) => {
                  onChange(date);
                  form.setValue(`schedulePreferences.${type}_schedules.${index}.ending_time`, addMinutes(date, 60));
                }}
              />

              <FormTimePickerField<StudentSettingsFormInput>
                name={`schedulePreferences.${type}_schedules.${index}.ending_time` as const}
                label="Hora fin"
                use12HourFormat
                hideSeconds
                disableHours={{
                  before: startingTime,
                }}
              />
            </div>
          </FormControl>

          <FormMessage />

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              colors="destructive"
              className="w-full"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        </FormItem>
      )}
    />
  );
}
