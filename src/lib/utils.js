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

export function normalizeCurrencyValue(value) {
  if (value === null || value === undefined) return "";
  const stringValue = value.toString();
  if (!stringValue) return "";

  let cleaned = stringValue.replace(/[^\d.,-]/g, "").replace(/\s+/g, "");

  if (!cleaned) return "";

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, "").replace(/,/g, ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (hasComma) {
    cleaned = cleaned.replace(/,/g, ".");
  }

  cleaned = cleaned.replace(/[^0-9.]/g, "");

  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const integerPart = parts.shift() || "0";
  const fractionalPart = parts.join("");

  return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
}
