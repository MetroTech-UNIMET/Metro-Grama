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

export async function onEdit(data: CreateCareerFormType) {
  if (!validateOnSubmit(data))  throw new Error("Invalid data");;

  const newData = transformData(data);

  // TODO update
  await updateCareer(newData);
  return `Career ${data.name} updated successfully`;
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
