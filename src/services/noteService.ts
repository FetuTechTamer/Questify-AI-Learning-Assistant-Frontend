import apiClient from './apiClient';

const mapMethodSlug = (method: string): string => {
  if (method === 'mindmap') return 'mind-map';
  return method;
};

export const noteService = {
  generateNote: async (method: string, collectionId: string): Promise<any> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}`;
    const payload = { 
      collection_id: collectionId,
      title: "Generated Note",
      content: "AI-generated content"
    };

    console.log(`[API POST] ${url}`, {
      headers: apiClient.defaults.headers,
      payload
    });

    try {
      const response = await apiClient.post(url, payload);
      console.log(`[API SUCCESS] POST ${url}`, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`[API ERROR] POST ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        detail: error.response?.data?.detail, // Detailed 422 error info
        message: error.message
      });
      throw error;
    }
  },

  getNotes: async (method: string, collectionId: string): Promise<any[]> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${collectionId}`;

    console.log(`[API GET] ${url}`, {
      headers: apiClient.defaults.headers
    });

    try {
      const response = await apiClient.get(url);
      console.log(`[API SUCCESS] GET ${url}`, response.data);
      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error(`[API ERROR] GET ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  deleteNote: async (method: string, noteId: string): Promise<void> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${noteId}`;

    console.log(`[API DELETE] ${url}`, {
      headers: apiClient.defaults.headers
    });

    try {
      const response = await apiClient.delete(url);
      console.log(`[API SUCCESS] DELETE ${url}`, response.data);
    } catch (error: any) {
      console.error(`[API ERROR] DELETE ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};
