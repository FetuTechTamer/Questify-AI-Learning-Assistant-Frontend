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

  logout: () => {
    localStorage.removeItem('access_token');
  }
};
