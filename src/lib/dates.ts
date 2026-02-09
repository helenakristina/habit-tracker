import { format, subDays, startOfDay, differenceInDays, parseISO, isValid } from "date-fns";
import { DateString } from "@/types";

export function toDateString(date: Date): DateString {
  return format(date, "yyyy-MM-dd");
}

export function today(): DateString {
  return toDateString(new Date());
}

export function parseDateString(dateStr: DateString): Date {
  return startOfDay(parseISO(dateStr));
}

export function isValidDateString(dateStr: string): boolean {
  const parsed = parseISO(dateStr);
  return isValid(parsed) && toDateString(parsed) === dateStr;
}

export function getLastNDays(n: number, fromDate?: Date): DateString[] {
  const base = fromDate ?? new Date();
  const days: DateString[] = [];
  for (let i = n - 1; i >= 0; i--) {
    days.push(toDateString(subDays(base, i)));
  }
  return days;
}

export function daysBetween(dateA: DateString, dateB: DateString): number {
  return Math.abs(differenceInDays(parseDateString(dateA), parseDateString(dateB)));
}

export function getMonthLabel(date: Date): string {
  return format(date, "MMM");
}

export function getDayOfWeek(date: Date): number {
  return date.getDay(); // 0 = Sunday
}

export function formatDisplayDate(dateStr: DateString): string {
  return format(parseDateString(dateStr), "MMM d, yyyy");
}
