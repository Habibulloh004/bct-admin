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

export function formatPrice(value, lang = 'en') {
  if (value === null || value === undefined || value === '') return ''

  const localeMap = {
    en: 'en-US',
    ru: 'ru-RU',
    uz: 'uz-UZ'
  }
  const locale = localeMap[lang] || 'en-US'

  const number = Number(value)
  if (isNaN(number)) return value.toString()

  return number.toLocaleString(locale)
}