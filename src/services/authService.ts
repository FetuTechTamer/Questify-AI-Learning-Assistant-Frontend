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
    console.log('--- Upload Avatar Request ---');
    console.log('File:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.put('/api/auth/user/profile/avatar', formData);
      console.log('Upload success:', response.data);
      if (response.data?.data?.avatar_url) {
        console.log('Backend avatar_url after upload:', response.data.data.avatar_url);
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
        if (error.response.data?.detail) {
          console.error('Validation details:', JSON.stringify(error.response.data.detail, null, 2));
        }
      }
      throw error;
    }
  },

  deleteAvatar: async () => {
    const response = await apiClient.delete('/api/auth/user/profile/avatar');
    return response.data.data;
  },

  deleteAccount: async () => {
    try {
      console.log('[authService] Requesting account deletion: DELETE /api/auth/user');
      const response = await apiClient.delete('/api/auth/user');
      console.log('[authService] Account deletion response:', response);
      return response.data;
    } catch (error: any) {
      console.error('[authService] Account deletion error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
  }
};
