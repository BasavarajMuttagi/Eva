import { format, isValid, parse, parseISO, set } from "date-fns";

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

export function parseStoredDate(value: string | number | Date | undefined | null): Date {
  if (value instanceof Date) {
    return isValid(value) ? value : new Date();
  }

  if (typeof value === "string") {
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : new Date();
  }

  return new Date();
}

export function toDayKey(value: string | number | Date): string {
  return format(parseStoredDate(value), "yyyy-MM-dd");
}
