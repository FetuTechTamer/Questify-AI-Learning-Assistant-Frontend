import apiClient from './apiClient';

export interface UploadResponse {
  material_id: string;
}

export interface PreprocessResponse {
  collection_id: string;
  title: string;
  confidence: number;
}

export const materialService = {
  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // axios handles multipart/form-data automatically when passed FormData
    const response = await apiClient.post('/api/material/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (materialId: string): Promise<void> => {
    await apiClient.delete(`/api/material/${materialId}`);
  },

  preprocess: async (materialIds: string[]): Promise<PreprocessResponse> => {
    const response = await apiClient.post('/api/material/preprocess', {
      material_ids: materialIds,
    });
    return response.data;
  },
};
