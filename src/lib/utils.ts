import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) {
    console.log('getAvatarUrl: path is already absolute:', path);
    return path;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://questiai-43b71abdd48b.herokuapp.com';
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  
  const finalUrl = `${cleanBase}/${cleanPath}`;
  console.log(`getAvatarUrl: resolving relative path [${path}] to [${finalUrl}]`);
  return finalUrl;
}
