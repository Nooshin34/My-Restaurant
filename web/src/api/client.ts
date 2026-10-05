import axios from "axios";

const TOKEN_KEY = "myrestaurant.token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function errorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: string; title?: string } | undefined;
  if (typeof data?.message === "string" && data.message.length > 0) return data.message;
  if (typeof data?.title === "string" && data.title.length > 0) return data.title;
  return fallback;
}

export { TOKEN_KEY };
