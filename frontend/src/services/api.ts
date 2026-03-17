import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          // Update tokens
          accessToken = newAccessToken;
          refreshToken = newRefreshToken;
          
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    details?: any;
  };
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/register', { name, email, password }),

  logout: () => api.post<ApiResponse>('/auth/logout'),

  logoutAll: () => api.post<ApiResponse>('/auth/logout-all'),

  getProfile: () => api.get<ApiResponse<{ user: any }>>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),

  getSessions: () => api.get<ApiResponse<{ sessions: any[] }>>('/auth/sessions'),

  revokeSession: (sessionId: string) =>
    api.delete<ApiResponse>(`/auth/sessions/${sessionId}`),
};

// User API
export const userApi = {
  getProfile: () => api.get<ApiResponse<{ user: any; recentCaseHistory: any[] }>>('/users/profile'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put<ApiResponse<{ user: any }>>('/users/profile', data),

  getCaseHistory: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<any>>>(`/users/case-history?page=${page}&limit=${limit}`),

  // Admin only
  getUsers: (params?: any) => api.get<ApiResponse<PaginatedResponse<any>>>('/users', { params }),

  getUser: (userId: string) => api.get<ApiResponse<{ user: any; recentActivity: any[] }>>(`/users/${userId}`),

  updateUser: (userId: string, data: any) =>
    api.put<ApiResponse<{ user: any }>>(`/users/${userId}`, data),

  deleteUser: (userId: string) => api.delete<ApiResponse>(`/users/${userId}`),

  getUserStats: () => api.get<ApiResponse<any>>('/users/admin/stats'),
};

// Content API
export const contentApi = {
  getContent: (params?: any) => api.get<ApiResponse<PaginatedResponse<any>>>('/content', { params }),

  getContentByType: (type: string, language = 'EN') =>
    api.get<ApiResponse<{ content: any[] }>>(`/content/by-type/${type}?language=${language}`),

  getContentById: (id: string) => api.get<ApiResponse<{ content: any }>>(`/content/${id}`),

  // Admin only
  createContent: (data: any) => api.post<ApiResponse<{ content: any }>>('/content', data),

  updateContent: (id: string, data: any) =>
    api.put<ApiResponse<{ content: any }>>(`/content/${id}`, data),

  deleteContent: (id: string) => api.delete<ApiResponse>(`/content/${id}`),

  bulkCreateContent: (items: any[]) =>
    api.post<ApiResponse<{ content: any[] }>>('/content/bulk', { items }),

  getContentStats: () => api.get<ApiResponse<any>>('/content/admin/stats'),
};

// Cases API
export const casesApi = {
  getCases: (params?: any) => api.get<ApiResponse<PaginatedResponse<any>>>('/cases', { params }),

  getCase: (id: string) => api.get<ApiResponse<{ case: any }>>(`/cases/${id}`),

  openCase: (caseId: string, promoCode?: string) =>
    api.post<ApiResponse<{ caseHistory: any; bonusPointsAwarded: number; message: string }>>(
      `/cases/${caseId}/open`,
      { promoCode }
    ),

  // Admin only
  createCase: (data: any) => api.post<ApiResponse<{ case: any }>>('/cases', data),

  updateCase: (id: string, data: any) => api.put<ApiResponse<{ case: any }>>(`/cases/${id}`, data),

  addReward: (caseId: string, data: any) =>
    api.post<ApiResponse<{ reward: any }>>(`/cases/${caseId}/rewards`, data),

  updateReward: (caseId: string, rewardId: string, data: any) =>
    api.put<ApiResponse<{ reward: any }>>(`/cases/${caseId}/rewards/${rewardId}`, data),

  deleteReward: (caseId: string, rewardId: string) =>
    api.delete<ApiResponse>(`/cases/${caseId}/rewards/${rewardId}`),

  getCaseStats: () => api.get<ApiResponse<any>>('/cases/admin/stats'),
};

// Promo Codes API
export const promoApi = {
  getMyCodes: () => api.get<ApiResponse<{ promoCodes: any[] }>>('/promo/my-codes'),

  validateCode: (code: string, caseId?: string) =>
    api.post<ApiResponse<{ isValid: boolean; promoCode: any; errors: string[] }>>(
      '/promo/validate',
      { code, caseId }
    ),

  // Admin only
  getPromoCodes: (params?: any) => api.get<ApiResponse<PaginatedResponse<any>>>('/promo', { params }),

  createPromoCode: (data: any) => api.post<ApiResponse<{ promoCode: any }>>('/promo', data),

  updatePromoCode: (id: string, data: any) =>
    api.put<ApiResponse<{ promoCode: any }>>(`/promo/${id}`, data),

  deletePromoCode: (id: string) => api.delete<ApiResponse>(`/promo/${id}`),

  generateCodes: (data: any) => api.post<ApiResponse<{ promoCodes: any[] }>>('/promo/generate', data),

  getPromoStats: () => api.get<ApiResponse<any>>('/promo/stats'),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get<ApiResponse<any>>('/admin/dashboard'),

  getAuditLogs: (params?: any) => api.get<ApiResponse<PaginatedResponse<any>>>('/admin/audit-logs', { params }),

  getSystemConfig: () => api.get<ApiResponse<{ configs: any[] }>>('/admin/system-config'),

  updateSystemConfig: (key: string, value: any, description?: string) =>
    api.put<ApiResponse<{ config: any }>>(`/admin/system-config/${key}`, { value, description }),

  getAnalytics: (days = 30) => api.get<ApiResponse<any>>(`/admin/analytics?days=${days}`),

  seedData: () => api.post<ApiResponse<any>>('/admin/seed-data'),

  cleanup: () => api.delete<ApiResponse<any>>('/admin/cleanup'),

  getSystemStatus: () => api.get<ApiResponse<any>>('/admin/system-status'),

  broadcast: (message: string, type = 'info') =>
    api.post<ApiResponse<any>>('/admin/broadcast', { message, type }),
};

// Utility functions
export const setAuthTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

export const clearAuthTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const logout = () => {
  clearAuthTokens();
  // Clear any other stored user data
  localStorage.removeItem('userData');
};

export const isAuthenticated = (): boolean => {
  return !!accessToken;
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Export the configured axios instance
export default api;
