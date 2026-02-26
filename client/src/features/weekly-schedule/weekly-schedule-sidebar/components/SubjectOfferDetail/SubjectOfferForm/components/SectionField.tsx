import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { addMinutes } from 'date-fns';
import { Trash, CalendarPlus, Plus } from 'lucide-react';

import { defaultSchedule, correctIntervalBetweenHours } from '../constants';
import { EditorStudent } from './EditorStudent';

import { weekDayOptions } from '@/lib/constants/date';
import { cn } from '@utils/className';

import { FormTimePickerField } from '@ui/derived/form-fields/form-field-time-picker';
import { FormInputField } from '@ui/derived/form-fields/form-field-input';
import { FormSelectField } from '@ui/derived/form-fields/form-field-select';
import TooltipButton from '@ui/derived/tooltip-button';

import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@ui/popover';
import { Button } from '@ui/button';
import { ScrollArea } from '@ui/scroll-area';

import type { SubjectScheduleInput } from '../schema';
import type { StudentWithUser } from '@/interfaces/Student';

interface Props {
  sectionIndex: number;
  removeSection: (index: number) => void;
  last_student_editor: StudentWithUser | null;
}

export function SectionField({ sectionIndex, removeSection, last_student_editor }: Props) {
  const { setValue, control, formState } = useFormContext<SubjectScheduleInput>();
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
          <div className="flex flex-row items-center gap-2">
            {last_student_editor && <EditorStudent student={last_student_editor} />}
            <h3 className="font-bold">Sección {sectionIndex + 1}</h3>
          </div>

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

            <PopoverTrigger asChild>
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

        <PopoverContent className="flex w-92 overflow-x-visible px-0" ref={setPopoverContainer}>
          <ScrollArea className="flex-1 px-4 max-sm:max-h-80">
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

            <div className="mt-4 space-y-4">
              {schedules.map((field, schIndex) => (
                <div key={field.id} className="flex w-full flex-row items-center gap-4">
                  <div className="">
                    <FormSelectField
                      name={`${baseSectionName}.schedules.${schIndex}.day_of_week` as const}
                      label="Día"
                      options={weekDayOptions}
                      popoverContainer={popoverContainer ?? undefined}
                      className={cn(
                        formState.errors.sections?.[sectionIndex]?.schedules?.[schIndex] && 'bg-destructive/10',
                      )}
                    />

                    <div className="mt-2 flex flex-row gap-2">
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
                        className={cn(
                          formState.errors.sections?.[sectionIndex]?.schedules?.[schIndex] && 'bg-destructive/10',
                        )}
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
                        className={cn(
                          formState.errors.sections?.[sectionIndex]?.schedules?.[schIndex] && 'bg-destructive/10',
                        )}
                      />
                    </div>
                  </div>

                  <RemoveButton disabled={schedules.length <= 1} onClick={() => remove(schIndex)} />
                </div>
              ))}
            </div>

            <PopoverClose asChild>
              <Button variant="outline" className="mt-5 w-full">
                Cerrar
              </Button>
            </PopoverClose>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <TooltipButton
      type="button"
      colors="destructive"
      variant="outline"
      size="icon"
      className="rounded-full"
      tooltipText="Eliminar horario"
      contentClassName="text-destructive bg-destructive-foreground font-bold"
      onClick={onClick}
      disabled={disabled}
    >
      <Trash />
    </TooltipButton>
  );
}
