import { createCareer, updateCareer } from "@/api/careersApi";
import { toast } from "@ui/use-toast";

import type { CreateCareerFormType } from "./schema";

// TODO - Ver como muevo esto para el toast de useFormSubmit
// TODO - Validar que prelations solo sea hacia atrás
function validateOnSubmit(data: CreateCareerFormType) {
  // TODO - Hacerlo más efiiciente con fors
  const allCodes = data.subjects
    .flat()
    .map((subject) => subject.code)
    .filter((code) => code !== undefined);
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
  if (!validateOnSubmit(data)) throw new Error("Invalid data");

  const newData = transformData(data);

  await createCareer(newData);
  return `Career ${data.name} created successfully`;
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
