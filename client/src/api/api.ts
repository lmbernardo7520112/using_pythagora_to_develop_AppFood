import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import JSONbig from 'json-bigint';

const localApi: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => {
    try {
      return JSONbig.parse(data);
    } catch (error) {
      return data; // Fallback para dados não-JSON
    }
  }],
});

let accessToken: string | null = null;

const getApiInstance = (url: string): AxiosInstance => {
  return localApi;
};

const isAuthEndpoint = (url: string): boolean => {
  return url.includes('/api/auth');
};

const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes('/api/auth/refresh');
};

const setupInterceptors = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError): Promise<any> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (
        error.response?.status &&
        [401, 403].includes(error.response.status) &&
        !originalRequest._retry &&
        originalRequest.url &&
        !isRefreshTokenEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await localApi.post('/api/auth/refresh', {
            refreshToken,
          });

          if (response.data.data) {
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            accessToken = newAccessToken;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          } else {
            throw new Error('Invalid response from refresh token endpoint');
          }

          return getApiInstance(originalRequest.url || '')(originalRequest);
        } catch (err) {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          accessToken = null;
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(localApi);

const api = {
  request: <T = any>(config: AxiosRequestConfig) => getApiInstance(config.url || '').request<T>(config),
  get: <T = any>(url: string, config?: AxiosRequestConfig) => getApiInstance(url).get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => getApiInstance(url).post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => getApiInstance(url).put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => getApiInstance(url).patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => getApiInstance(url).delete<T>(url, config),
};

export default api;