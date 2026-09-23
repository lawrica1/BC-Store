import { en } from "./en";
import { fr } from "./fr";

export type Locale = "fr" | "en";

export const dictionaries = { fr, en } as const;

export type Dictionary = (typeof dictionaries)[Locale];
