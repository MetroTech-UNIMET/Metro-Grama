import { createCareer, updateCareer } from "@/api/careersApi";
import { toast } from "@ui/use-toast";

import type { CreateCareerFormType } from "./schema";

// TODO - Ver como muevo esto para el toast de useFormSubmit
// TODO - Validar que prelations solo sea hacia atrás
function validateOnSubmit(data: CreateCareerFormType) {
  const allCodes: string[] = [];
  for (let trimester of data.subjects) {
    for (let subject of trimester) {
      if (subject.subjectType === "elective" || !subject.code) {
        continue;
      }

      for (let prelation of subject.prelations) {
        if (prelation.value === subject.code) {
          toast({
            title: "Relaciones inválidas",
            description: `La materia : ${subject.name}" no puede tener una relación consigo misma`,
            variant: "destructive",
          });
          return false;
        }

        if (!allCodes.includes(prelation.value)) {
          toast({
            title: "Relaciones inválidas",
            description: `En la materia "${subject.name}", la prelación "${prelation.label}" no está presente en trimestres anteriores`,
            variant: "destructive",
            duration: 7 * 1000,
          });

          return false;
        }
      }

      allCodes.push(subject.code);
    }
  }

  const repeatedCodes = allCodes.filter(
    (code, index) => allCodes.indexOf(code) !== index
  );

  if (repeatedCodes.length > 0) {
    const message =
      repeatedCodes.length > 1
        ? `Los códigos ${repeatedCodes.join(", ")} están repetidos`
        : `El código ${repeatedCodes[0]} está repetido`;

    toast({
      title: "Códigos repetidos",
      description: message,
      variant: "destructive",
    });

    return false;
  }

  return true;
}

// REVIEW - Considerar no enviar id unico y crearlo en go
export async function onCreate(data: CreateCareerFormType) {
  if (!validateOnSubmit(data)) throw new Error("Datos inválidos");

  const newData = transformCreateData(data);

  await createCareer(newData);
  return {
    title: "Carrera creada",
    description: `La carrera "${data.name}" ha sido creada exitosamente`,
  };
}

export async function onEdit(
  orinalData: CareerWithSubjects,
data: CreateCareerFormType,
  dirtyFields: DirtyFields<CreateCareerFormType>
) {
  if (Object.keys(dirtyFields).length === 0)
    throw new Error(
      "Para poder modificar, tiene que realizar un cambio en el formulario"
    );

  if (!validateOnSubmit(data)) return false;

  dirtyFields?.subjects?.forEach((subjectTrimester, trimester) => {
    subjectTrimester?.forEach((subjectDirty, index) => {
      if (dirtyFields.subjects?.[trimester][index]) {
        dirtyFields.subjects[trimester][index] = {
          code: true,
          ...subjectDirty,
        };
      }
    });
  });

  const filtered = getDirtyNestedFields(data, dirtyFields) as Partial<
    ArrayToObject<CreateCareerFormType, "prelations">
  >;

  const transformed = transformEditData(filtered);

  await updateCareer(orinalData, transformed);

  return {
    title: "Carrera actualizada",
    description: `La carrera "${data.name}" ha sido actualizada exitosamente`,
  };
}


function transformData(data: CreateCareerFormType) {
  return {
    ...data,
    subjects: data.subjects.map((trimester) =>
      trimester.map((subject) => {
        if (subject.subjectType === "elective") {
          return undefined;
        }
        return {
          ...subject,
          prelations: subject.prelations.map((prelation) => prelation.value),
        };
      })
    ),
  };
}
