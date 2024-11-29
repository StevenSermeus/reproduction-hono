import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Temporal } from '@js-temporal/polyfill';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMinor(birthday: string | Date) {
  const age = getAge(birthday);
  return age < 18;
}

export function getAge(birthday: string | Date) {
  if (birthday instanceof Date) {
    birthday = birthday.toISOString();
  }
  const instant = Temporal.Instant.from(birthday);
  const s0 = Temporal.Instant.from(instant).toString({ timeZone: instant.toString() });
  const date = Temporal.PlainDate.from(s0);
  const now = Temporal.Now.plainDateISO();
  const age = date.until(now).days / 365;
  return age;
}
