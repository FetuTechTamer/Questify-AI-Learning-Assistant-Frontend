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
    const token = localStorage.getItem('access_token');
    console.log('--- Account Deletion Request Diagnostic ---');
    console.log('Method: DELETE');
    console.log('Endpoint: /api/auth/user');
    console.log('Token Present:', !!token);
    if (token) {
      console.log('Authorization Header: Bearer ' + token.substring(0, 10) + '...');
    }
    
    try {
      const response = await apiClient.delete('/api/auth/user');
      console.log('Response Status:', response.status);
      console.log('Response Body:', JSON.stringify(response.data));
      console.log('--- Account Deletion Success ---');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('--- Account Deletion Error ---');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data));
        console.error('Headers:', JSON.stringify(error.response.headers));
      } else if (error.request) {
        console.error('Request sent but no response received (CORS or Server Down)');
        console.error('Request details:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      console.error('Full Error Object:', error);
      console.error('------------------------------');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
  }
};
