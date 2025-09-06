export function normalize(s:string){
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // modern engines
    .replace(/[\u0300-\u036f]/g, '') // fallback
    .toLowerCase();
}