import type { FieldValues, Path } from 'react-hook-form';

export function generateRHFPaths<T extends FieldValues>(
  pathFields: string[],
  arrayPaths: string[],
  currentFormValues: T,
): Path<T>[] {
  const allPaths: Path<T>[] = [];

  function resolveArrayPaths(basePath: string, remainingPath: string[], currentValue: any) {
    if (!remainingPath.length) {
      allPaths.push(basePath as Path<T>);
      return;
    }

    const [currentSegment, ...restSegments] = remainingPath;

    if (!currentSegment) throw new Error('Invalid path segment');

    if (currentSegment === '[index]') {
      if (Array.isArray(currentValue)) {
        currentValue.forEach((_, index) => {
          resolveArrayPaths(`${basePath}.${index}`, restSegments, currentValue[index]);
        });
      }
    } else {
      resolveArrayPaths(
        `${basePath}.${currentSegment}`,
        restSegments,
        currentValue?.[currentSegment],
      );
    }
  }

  pathFields.forEach((path) => {
    allPaths.push(path as Path<T>);
  });

  arrayPaths.forEach((arrayPath) => {
    const segments = arrayPath.split('.');
    const firstSegment = segments[0];
    if (!firstSegment) throw new Error('Invalid path segment in arrayPaths');

    resolveArrayPaths(firstSegment, segments.slice(1), currentFormValues[firstSegment]);
  });

  return allPaths;
}
