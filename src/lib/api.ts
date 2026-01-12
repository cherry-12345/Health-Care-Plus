'use client';

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const storedTokens = localStorage.getItem('auth_tokens');
      if (storedTokens) {
        const { accessToken } = JSON.parse(storedTokens);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        if (storedTokens) {
          const { refreshToken } = JSON.parse(storedTokens);

          // Try to refresh token
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            // Update stored tokens
            localStorage.setItem(
              'auth_tokens',
              JSON.stringify({ accessToken, refreshToken: newRefreshToken })
            );

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API helper functions
export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () =>
    api.get('/auth/me'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// API helper functions
export const hospitalApi = {
  search: (params: Record<string, any>) =>
    api.get('/hospitals', { params }),
  
  getById: (id: string) =>
    api.get(`/hospitals/${id}`),
  
  emergency: (latitude: number, longitude: number, bedType?: string) =>
    api.get('/hospitals/emergency', {
      params: { latitude, longitude, bedType },
    }),
  
  updateBeds: (hospitalId: string, bedType: string, change: number) =>
    api.post('/hospitals/update-beds', { hospitalId, bedType, change }),
  
  updateAllBeds: (hospitalId: string, beds: {
    general: { available: number; total: number };
    icu: { available: number; total: number };
    oxygen: { available: number; total: number };
    ventilator: { available: number; total: number };
  }) => api.post('/hospitals/update-beds', { hospitalId, beds, batchUpdate: true }),
  
  updateBlood: (hospitalId: string, bloodGroup: string, change: number) =>
    api.post('/hospitals/update-blood', { hospitalId, bloodGroup, change }),
  
  updateAllBlood: (hospitalId: string, bloodBank: { bloodGroup: string; unitsAvailable: number }[]) =>
    api.post('/hospitals/update-blood', { hospitalId, bloodBank, batchUpdate: true }),
  
  intelligentEmergency: (data: {
    patientCondition: string;
    requiredBedType: string;
    bloodType?: string;
    latitude: number;
    longitude: number;
    urgencyLevel: number;
  }) => api.post('/emergency/intelligent-response', data),
  
  getEmergencyAlerts: () =>
    api.get('/emergency/alerts'),
  
  getPredictions: () =>
    api.get('/intelligent/predict-demand'),
};

export const doctorApi = {
  getAll: (params?: { hospitalId?: string; specialization?: string }) =>
    api.get('/doctors', { params }),
  
  getById: (id: string) =>
    api.get(`/doctors/${id}`),
};

export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  getHospitals: (params?: { status?: string }) =>
    api.get('/admin/hospitals', { params }),
  
  approveHospital: (id: string, action?: 'approve' | 'reject', reason?: string) =>
    api.put(`/admin/hospitals/${id}/approve`, { action: action || 'approve', reason }),
  
  updateResources: (data: {
    hospitalId: string;
    type: 'bed' | 'blood';
    bedType?: string;
    field?: string;
    value?: number;
    bloodGroup?: string;
    units?: number;
  }) => api.post('/admin/update-resources', data),
};

export const appointmentApi = {
  getUserAppointments: (params?: { status?: string }) =>
    api.get('/appointments', { params }),
  
  getById: (id: string) =>
    api.get(`/appointments/${id}`),
  
  create: (data: {
    hospitalId: string;
    doctorId?: string;
    appointmentDate: string;
    timeSlot: string;
    type?: string;
    reason: string;
    symptoms?: string[];
  }) => api.post('/appointments', data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
  
  cancel: (id: string, reason?: string) =>
    api.delete(`/appointments/${id}`, { data: { reason } }),
};

export const reviewApi = {
  getByHospital: (hospitalId: string) =>
    api.get(`/reviews/hospital/${hospitalId}`),
  
  create: (data: {
    hospitalId: string;
    doctorId?: string;
    rating: number;
    title?: string;
    comment: string;
    wouldRecommend?: boolean;
  }) => api.post('/reviews', data),
  
  update: (id: string, data: { rating?: number; title?: string; comment?: string }) =>
    api.put(`/reviews/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/reviews/${id}`),
  
  markHelpful: (id: string) =>
    api.post(`/reviews/${id}/helpful`),
};
