import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getTranslatedValue(value, lang) {
  if (!value) return ''

  const parts = value.split('***')
  const langMap = {
    en: 0,
    ru: 1,
    uz: 2
  }

  const index = langMap[lang]
  return parts[index] || parts[0] || ''
}