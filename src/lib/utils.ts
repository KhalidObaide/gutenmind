import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const displayDate = (date: Date | string): string => {
  if (typeof date === "string") date = new Date(date);

  const now = new Date();
  const month = date.toLocaleString("default", { month: "short" }); // Short month name
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  // Check if the year is the current year
  if (year === currentYear) {
    return `${month} ${day}`;
  } else {
    return `${month} ${day} ${year}`;
  }
};

export const customErr = (code: string, message: string) => {
  return { status: "failed", code, message };
};
