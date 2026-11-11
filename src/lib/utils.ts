import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert numbers to Arabic-Indic digits if needed
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

// Generate WhatsApp link with prefilled Arabic message
export function getWhatsAppLink(customMessage?: string): string {
  const phone = "9647806086016";
  const defaultMsg = "مرحباً إدارة العقل الخارق (SUPER MIND)، أود الاستفسار عن برامج الحساب الذهني وتفاصيل الاشتراكات.";
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${phone}?text=${text}`;
}
