import apiClient from './apiClient';

export interface UploadResponse {
  material_id: string;
}

export interface PreprocessResponse {
  collection_id: string;
  title: string;
  confidence: number;
}

export interface AnalyzeResponse {
  success: boolean;
  message: string;
}

export const materialService = {
  upload: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('--- Upload Diagnostic Start ---');
    console.log('Uploading file:', file.name, file.type, file.size);
    console.log('Request URL:', (apiClient.defaults.baseURL || '') + '/api/material/upload');
    console.log('Auth token present?', !!localStorage.getItem('access_token'));
    
    try {
      const response = await apiClient.post('/api/material/upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      console.log('Upload success:', response.data);
      console.log('--- Upload Diagnostic End (Success) ---');
      return response.data.data;
    } catch (error: any) {
      console.error('--- Upload Diagnostic End (Error) ---');
      console.error('Upload error details:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
        if (error.response.data && error.response.data.detail) {
          console.error('Validation errors:', JSON.stringify(error.response.data.detail, null, 2));
        }
      } else if (error.request) {
        console.error('No response received (Network Error?):', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  delete: async (materialId: string): Promise<void> => {
    await apiClient.delete(`/api/material/${materialId}`);
  },

  preprocess: async (materialIds: string[]): Promise<PreprocessResponse> => {
    const response = await apiClient.post('/api/material/preprocess', {
      material_ids: materialIds,
    });
    return response.data.data;
  },

  analyze: async (collectionId: string, confidence: number = 50): Promise<AnalyzeResponse> => {
    console.log('--- Analyze Request Start ---');
    console.log('Collection ID:', collectionId);
    console.log('Confidence:', confidence);
    console.log('Request URL:', (apiClient.defaults.baseURL || '') + '/api/material/analyze');
    console.log('Auth token present?', !!localStorage.getItem('access_token'));

    try {
      const response = await apiClient.post('/api/material/analyze', { 
        collection_id: collectionId,
        confidence: confidence
      });
      console.log('Analyze success:', response.data);
      console.log('--- Analyze Request End (Success) ---');
      return response.data;
    } catch (error: any) {
      console.error('--- Analyze Request End (Error) ---');
      console.error('Analyze error details:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
        if (error.response.data && error.response.data.detail) {
          console.error('Validation details:', JSON.stringify(error.response.data.detail, null, 2));
        }
      } else if (error.request) {
        console.error('No response received (Network Error?):', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },
};
