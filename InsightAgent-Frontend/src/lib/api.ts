import axios from 'axios';
import type { Project, UploadResult, QueryResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to set cookie from client-side
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error logging and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle subscription limit errors
    if (error.response?.status === 402) {
      // Payment Required - subscription limit reached
      if (typeof window !== 'undefined') {
        const message = error.response.data?.message || 'Subscription limit reached. Please upgrade your plan.';
        // You can show a modal here or redirect to pricing
        console.error('Subscription limit:', message);
        // Optionally redirect to pricing page
        // window.location.href = '/pricing';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 413) {
      // Payload Too Large - file size limit exceeded
      if (typeof window !== 'undefined') {
        const message = error.response.data?.message || 'File size exceeds your plan limit. Please upgrade or use a smaller file.';
        console.error('File size limit:', message);
      }
      return Promise.reject(error);
    }

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            });
            
            // Store in both localStorage and cookies
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            setCookie('accessToken', data.accessToken, 7);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            deleteCookie('accessToken');
            // Only redirect if not already on login page to avoid loops
            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else {
          // No refresh token, clear everything and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          deleteCookie('accessToken');
          // Only redirect if not already on login page to avoid loops
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }

    console.error('Full API Error Object:', error);
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  create: async (name: string): Promise<Project> => {
    const { data } = await api.post('/projects', { name });
    return data;
  },

  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects');
    return data;
  },

  getOne: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  update: async (id: string, name: string): Promise<Project> => {
    const { data } = await api.patch(`/projects/${id}`, { name });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Upload API
export const uploadApi = {
  uploadFile: async (projectId: string, file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);

    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data;
  },

  deleteTable: async (projectId: string, tableName: string): Promise<void> => {
    await api.delete(`/upload/${projectId}/${tableName}`);
  },
};

// Agent API
export const agentApi = {
  query: async (projectId: string, question: string): Promise<QueryResult> => {
    const { data } = await api.post('/agent/query', { projectId, question });
    return data.data;
  },

  previewTable: async (
    projectId: string,
    tableName: string,
    limit = 10
  ): Promise<Record<string, unknown>[]> => {
    const { data } = await api.get(
      `/agent/preview/${projectId}/${tableName}?limit=${limit}`
    );
    return data.data;
  },
};

export default api;
