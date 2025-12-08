import { toast } from 'sonner';

import { createCareer, updateCareer } from '@/api/careersApi';
import { getDirtyNestedFields } from '@utils/forms';
import { createSurrealId, idToSurrealId } from '@utils/queries';

import type { CreateCareerInput, CreateCareerOutput } from './schema';
import type { ArrayToObject, DirtyFields } from '@utils/forms';
import type { CareerWithSubjects } from '@/interfaces/Career';

function validateOnSubmit(data: CreateCareerInput) {
  const allCodes: string[] = [];
  for (let trimester of data.subjects) {
    for (let subject of trimester) {
      if (subject.subjectType === 'elective' || !subject.code) {
        continue;
      }

      for (let prelation of subject.prelations) {
        if (prelation.value === subject.code) {
          toast.error('Relaciones inválidas', {
            description: `La materia : ${subject.name}" no puede tener una relación consigo misma`,
          });
          return false;
        }

        if (!allCodes.includes(prelation.value)) {
          toast.error('Relaciones inválidas', {
            description: `En la materia "${subject.name}", la prelación "${prelation.label}" no está presente en trimestres anteriores`,
            duration: 7 * 1000,
          });

          return false;
        }
      }

      allCodes.push(subject.code);
    }
  }

  const repeatedCodes = allCodes.filter((code, index) => allCodes.indexOf(code) !== index);

  if (repeatedCodes.length > 0) {
    const message =
      repeatedCodes.length > 1
        ? `Los códigos ${repeatedCodes.join(', ')} están repetidos`
        : `El código ${repeatedCodes[0]} está repetido`;

    toast.error('Códigos repetidos', {
      description: message,
    });

    return false;
  }

  return true;
}

export async function onCreate(data: CreateCareerOutput) {
  if (!validateOnSubmit(data)) throw new Error('Datos inválidos');

  const newData = transformCreateData(data);

  await createCareer(newData);
  return {
    title: 'Carrera creada',
    description: `La carrera "${data.name}" ha sido creada exitosamente`,
  };
}

export async function onEdit(
  orinalData: CareerWithSubjects,
  data: CreateCareerOutput,
  dirtyFields: DirtyFields<CreateCareerInput>,
) {
  if (Object.keys(dirtyFields).length === 0)
    throw new Error('Para poder modificar, tiene que realizar un cambio en el formulario');

  if (!validateOnSubmit(data)) return false;

  dirtyFields?.subjects?.forEach((subjectTrimester, trimester) => {
    subjectTrimester?.forEach((subjectDirty, index) => {
      if (dirtyFields.subjects?.[trimester][index]) {
        dirtyFields.subjects[trimester][index] = {
          code: true,
          ...subjectDirty,
          prelations:
            data.subjects[trimester]?.[index]?.prelations?.map(() => ({
              label: true,
              value: true,
            })) || [],
        };
      }
    });
  });

  const filtered = getDirtyNestedFields(data, dirtyFields);

  const transformed = transformEditData(filtered);

  await updateCareer(orinalData, transformed);

  return {
    title: 'Carrera actualizada',
    description: `La carrera "${data.name}" ha sido actualizada exitosamente`,
  };
}

function transformCreateData(data: CreateCareerOutput) {
  return {
    ...data,
    subjects: data.subjects.map((trimester) =>
      trimester.map((subject) => {
        if (subject.subjectType === 'elective') {
          return undefined;
        }
        return {
          ...subject,
          prelations: subject.prelations.map((prelation) => prelation.value),
        };
      }),
    ),
  };
}

function transformEditData(data: Partial<ArrayToObject<CreateCareerOutput>>) {
  if (!data.subjects) return data;

  const transformedData: {
    emoji?: string;
    name?: string;
    subjects: Record<string, Record<string, any>>;
  } = { ...data, subjects: {} };

  Object.entries(data.subjects).forEach(([trimesterIndex, trimester]) => {
    transformedData.subjects[trimesterIndex] = {};

    Object.entries(trimester).forEach(([subjectIndex, subject]) => {
      if (subject.subjectType === 'elective') {
        transformedData.subjects[trimesterIndex][subjectIndex] = null;
      } else {
        const prelations = Object.values(subject.prelations || {}).map((prelation) => createSurrealId('subject', prelation.value));

        transformedData.subjects[trimesterIndex][subjectIndex] = {
          ...subject,
          code: subject.code ? idToSurrealId(subject.code, 'subject') : undefined,
          prelations: prelations,
        };
      }
    });
  });

  return transformedData;
}
