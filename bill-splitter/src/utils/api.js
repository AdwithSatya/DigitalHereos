/**
 * Central API base URL.
 * In development this falls back to localhost.
 * In production Vercel sets VITE_API_URL via the project's environment variables.
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
