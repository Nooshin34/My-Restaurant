import axios from "axios";
import { Platform } from "react-native";

const fallback = Platform.OS === "android" ? "http://10.0.2.2:5080" : "http://localhost:5080";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || fallback,
  timeout: 15000,
});

let token: string | null = null;

export function setAuthToken(value: string | null) {
  token = value;
}

export function setBaseUrl(url: string) {
  api.defaults.baseURL = url.replace(/\/$/, "");
}

export function getBaseUrl() {
  return String(api.defaults.baseURL ?? fallback);
}

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) return fallbackMessage;
  const data = error.response?.data as { message?: string } | undefined;
  if (data?.message) return data.message;
  if (!error.response) return "اتصال به سرور برقرار نشد. آدرس API را در حساب کاربری چک کنید.";
  return fallbackMessage;
}
