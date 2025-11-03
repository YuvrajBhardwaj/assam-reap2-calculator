import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Centralized base URLs (override via Vite env vars)
export const CORE_API_BASE_URL = import.meta.env?.VITE_CORE_API_BASE_URL || 'http://192.168.1.2:8082/areap2';
export const MASTER_DATA_API_BASE_URL = import.meta.env?.VITE_MASTER_DATA_API_BASE_URL || 'http://192.168.1.2:8081/masterData';
export const JURISDICTION_API_BASE_URL = import.meta.env?.VITE_JURISDICTION_API_BASE_URL || 'http://192.168.1.2:8081';

const attachAuth = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  // Support both keys to avoid breaking existing storage
  const stored = localStorage.getItem('authToken') || localStorage.getItem('jwtToken');
  if (stored) {
    const bearerToken = stored.startsWith('Bearer ') ? stored : `Bearer ${stored}`;
    // Axios v1 uses AxiosHeaders which supports set()
    config.headers.set('Authorization', bearerToken);
  }
  config.headers.set('Content-Type', 'application/json');
  config.headers.set('Accept', 'application/json');
  return config;
};

export const coreApi: AxiosInstance = axios.create({
  baseURL: CORE_API_BASE_URL,
});

coreApi.interceptors.request.use(attachAuth);

export const masterDataApi: AxiosInstance = axios.create({
  baseURL: MASTER_DATA_API_BASE_URL,
});
masterDataApi.interceptors.request.use(attachAuth);

export const jurisdictionApi: AxiosInstance = axios.create({
  baseURL: JURISDICTION_API_BASE_URL,
});
jurisdictionApi.interceptors.request.use(attachAuth);