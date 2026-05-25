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
  async (config) => {
    if (typeof window !== 'undefined') {
      let token: string | null | undefined = null;

      // 1. Try retrieving the token from Clerk's global client session
      if ((window as any).Clerk?.session) {
        try {
          token = await (window as any).Clerk.session.getToken();
        } catch (err) {
          console.error('Failed to get Clerk session token:', err);
        }
      }

      // 2. Fallback to cookie check if Clerk is not fully loaded/available
      if (!token) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; __session=`);
        if (parts.length === 2) {
          token = parts.pop()?.split(';').shift();
        }
      }

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

    // Handle unauthorized errors (e.g. session expired or invalid token) without redirect loop
    if (error.response?.status === 401) {
      // For Clerk, session/token management is handled by ClerkProvider.
      // We don't want to redirect unconditionally here to avoid loops.
      console.warn('API returned 401 Unauthorized:', error.config?.url);
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
