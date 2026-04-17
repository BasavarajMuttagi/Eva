import { isValid, parse, parseISO, set } from "date-fns";

export function parseDateParamToLocalDay(dateStr?: string): Date {
  if (!dateStr) return new Date();

  const fromYmd = parse(dateStr, "yyyy-MM-dd", new Date());
  if (isValid(fromYmd)) return set(fromYmd, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

  const fallback = parseISO(dateStr);
  if (isValid(fallback)) return fallback;
  return new Date();
}

export function buildCreatedAtIsoForDay(day: Date): string {
  return day.toISOString();
}
