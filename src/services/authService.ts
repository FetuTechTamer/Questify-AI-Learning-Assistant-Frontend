import apiClient from './apiClient';

export const authService = {
  register: async (full_name: string, email: string, password: string) => {
    const response = await apiClient.post('/api/auth/register', { full_name, email, password });
    return response.data.data;
  },

  verify: async (email: string, otp: string) => {
    const response = await apiClient.post('/api/auth/verify', { email, otp });
    return response.data.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post('/api/auth/resend-otp', { email });
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const responseData = response.data.data;
    if (responseData && responseData.access_token) {
      localStorage.setItem('access_token', responseData.access_token);
    }
    return responseData;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/user/profile');
    return response.data.data;
  },

  updateProfile: async (data: { full_name?: string; email?: string }) => {
    const response = await apiClient.patch('/api/auth/user/profile', data);
    return response.data.data;
  },

  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    // Let Axios handle the Content-Type header and boundary automatically
    const response = await apiClient.post('/api/auth/user/profile/avatar', formData);
    return response.data.data;
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete('/api/auth/user/profile/avatar');
    return response.data.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete('/api/auth/user/profile');
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  }
};
