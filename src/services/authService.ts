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
    const cacheKey = 'user_avatar_blob_url';
    // Return cached blob URL if it exists
    const cached = (window as any)._avatarBlobCache;
    if (cached) return cached;

    try {
      console.log('[authService] Fetching binary avatar: GET /api/auth/user/avatar');
      const response = await apiClient.get('/api/auth/user/avatar', {
        responseType: 'blob'
      });

      console.log('[authService] Response Status:', response.status);
      console.log('[authService] Content-Type:', response.headers['content-type']);

      // Directly create object URL from blob
      const imageUrl = URL.createObjectURL(response.data);
      console.log('[authService] Created Blob URL:', imageUrl);
      
      // Store in a simple global cache to persist during session
      (window as any)._avatarBlobCache = imageUrl;
      
      return imageUrl;
    } catch (error: any) {
      console.error('[authService] Failed to fetch binary avatar:', error);
      return null; // Return null to allow fallback to default avatar
    }
  },

  updateAvatar: async (file: File) => {
    console.log('--- Upload Avatar Request ---');
    console.log('File:', file.name, file.type, file.size);
    const formData = new FormData();
    formData.append('file', file);
    // Clear cache to force fresh fetch
    (window as any)._avatarBlobCache = null;
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
    // Clear cache to force fresh fetch
    (window as any)._avatarBlobCache = null;
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
