import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXaf(amount: number, locale: string) {
  return `${new Intl.NumberFormat(locale === "fr" ? "fr-CM" : "en-CM").format(amount)} FCFA`;
}
