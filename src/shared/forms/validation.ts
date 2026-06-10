export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function required(value: string, message = "Bu xana mütləq doldurulmalıdır.") {
  return value.trim() ? undefined : message;
}

export function minLength(value: string, min: number, message: string) {
  return value.length >= min ? undefined : message;
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
