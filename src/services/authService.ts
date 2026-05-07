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

  getAvatar: async () => {
    try {
      console.log('[authService] Attempting to fetch avatar: GET /api/auth/user/avatar');
      const response = await apiClient.get('/api/auth/user/avatar', {
        // We use 'text' transform to safely inspect the response before JSON parsing
        transformResponse: [(data) => data] 
      });

      const contentType = response.headers['content-type'] || '';
      console.log('[authService] Response Status:', response.status);
      console.log('[authService] Content-Type:', contentType);

      if (!contentType.includes('application/json')) {
        console.warn('[authService] Response is NOT JSON. Raw data preview:', typeof response.data === 'string' ? response.data.substring(0, 100) : 'Binary data');
        throw new Error(`Invalid response type: ${contentType} (Status: ${response.status})`);
      }

      // If it is JSON, parse it
      try {
        const jsonData = JSON.parse(response.data);
        console.log('[authService] Parsed JSON data:', jsonData);
        return jsonData.data;
      } catch (e) {
        console.error('[authService] Failed to parse JSON:', response.data);
        throw new Error(`Failed to parse JSON response (Status: ${response.status})`);
      }
    } catch (error: any) {
      console.error('[authService] GET /api/auth/user/avatar failed:', error);
      throw error;
    }
  },

  updateAvatar: async (file: File) => {
    console.log('--- Upload Avatar Request ---');
    console.log('File:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await apiClient.put('/api/auth/user/profile/avatar', formData);
      console.log('Upload success:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  deleteAvatar: async () => {
    try {
      const response = await apiClient.delete('/api/auth/user/profile/avatar');
      return response.data.data;
    } catch (error: any) {
      console.error('Avatar deletion error:', error);
      throw error;
    }
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

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data.data || response.data;
  },

  resetPassword: async (data: any) => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data.data || response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.patch('/api/auth/user/password', data);
    return response.data.data || response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
  }
};
