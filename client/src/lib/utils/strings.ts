export function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // modern engines
    .replace(/[\u0300-\u036f]/g, '') // fallback
    .toLowerCase();
}

export function getInitials(...names: string[]): string {
  return names.map((name) => name.trim().charAt(0).toUpperCase()).join('');
}
