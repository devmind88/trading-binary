const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const apiUrl = (path: string): string => {
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path}`;
};
