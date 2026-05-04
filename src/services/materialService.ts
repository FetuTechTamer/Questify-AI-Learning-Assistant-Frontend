import apiClient from './apiClient';

export interface UploadResponse {
  material_id: string;
}

export interface PreprocessResponse {
  collection_id: string;
}

export interface AnalyzedChapter {
  chapter_number: number;
  chapter_title: string;
  chapter_description: string;
  keywords: string[];
}

export interface AnalyzeResponse {
  document_title: string;
  main_description: string;
  total_chapters: number;
  chapters: AnalyzedChapter[];
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
      const result = response.data?.data ?? response.data;
      return result;
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
    console.log('--- Preprocess Request Start ---');
    console.log('Material IDs:', materialIds);
    console.log('Request body:', JSON.stringify({ material_ids: materialIds }));
    console.log('Request URL:', (apiClient.defaults.baseURL || '') + '/api/material/preprocess');
    console.log('Auth token present?', !!localStorage.getItem('access_token'));
    try {
      const response = await apiClient.post('/api/material/preprocess', {
        material_ids: materialIds,
      });
      console.log('Preprocess RAW response.data:', JSON.stringify(response.data));
      // Safely handle both { success, data: { collection_id } } and { collection_id }
      const result = response.data?.data ?? response.data;
      console.log('Preprocess unwrapped result:', JSON.stringify(result));
      console.log('--- Preprocess Request End (Success) ---');
      return result;
    } catch (error: any) {
      console.error('--- Preprocess Request End (Error) ---');
      console.error('Preprocess error details:', error);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        console.error('No response received (Network Error?):', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  analyze: async (collectionId: string, confidence: number = 50): Promise<AnalyzeResponse> => {
    const body = { collection_id: collectionId, confidence: confidence };
    console.log('--- Analyze Request Start ---');
    console.log('Collection ID:', collectionId);
    console.log('Collection ID type:', typeof collectionId);
    console.log('Confidence:', confidence);
    console.log('Confidence type:', typeof confidence);
    console.log('Full request body:', JSON.stringify(body));
    console.log('Request URL:', (apiClient.defaults.baseURL || '') + '/api/material/analyze');
    console.log('Auth token:', localStorage.getItem('access_token')?.substring(0, 20) + '...');

    try {
      const response = await apiClient.post('/api/material/analyze', body);
      console.log('Analyze RAW response.data:', JSON.stringify(response.data));
      // Safely handle both { success, data: { chapters: [...] } } and { chapters: [...] }
      const result: AnalyzeResponse = response.data?.data ?? response.data;
      console.log('Analyze unwrapped result:', JSON.stringify(result));
      console.log('Chapters count:', result.chapters?.length);
      console.log('--- Analyze Request End (Success) ---');
      return result;
    } catch (error: any) {
      console.error('--- Analyze Request End (Error) ---');
      console.error('Analyze error details:', error);
      if (error.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data));
        if (error.response.data?.detail) {
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
