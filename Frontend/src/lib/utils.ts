import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatApplyUrl(url: string | null | undefined): string {
  if (!url || url.trim() === "" || url === "#") {
    return "";
  }
  
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return `https://${trimmed}`;
}

export function getWebSearchUrl(title: string, company: string, location?: string): string {
  const query = `${title} ${company} ${location || ""}`.replace(/\s+/g, " ").trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query + " job apply")}`;
}

