import apiClient from './apiClient';

/**
 * Helper to map frontend method IDs to backend endpoint slugs.
 * Ensures consistent URL structure across all note types.
 */
const mapMethodSlug = (method: string): string => {
  const mapping: Record<string, string> = {
    'cornell': 'cornell',
    'sentence': 'sentence',
    'boxing': 'boxing',
    'outline': 'outline',
    'mindmap': 'mind-map', // Backend spec uses mind-map
    'charting': 'charting'
  };
  return mapping[method.toLowerCase()] || method.toLowerCase();
};

export const noteService = {
  /**
   * POST /api/notes/{method}
   * Request body: { collection_id: string }
   */
  generateNote: async (method: string, collectionId: string): Promise<any> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}`;
    
    // Minimal payload based on user's spec. Extra fields often cause 422 on strict backends.
    const payload = {
      collection_id: collectionId
    };

    console.log(`[API POST] URL: ${url}`);
    console.log(`[API POST] Body:`, payload);

    try {
      const response = await apiClient.post(url, payload);
      console.log(`[API POST] Status: ${response.status}`);
      console.log(`[API POST] Response Data:`, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.group(`[API 422 ERROR] Validation Failed for ${url}`);
        console.error("Validation Details:", error.response.data.detail || error.response.data);
        console.log("Sent Payload:", payload);
        console.groupEnd();
      } else {
        console.error(`[API POST] FAILED: ${url}`, {
          status: error.response?.status,
          data: error.response?.data
        });
      }
      throw error;
    }
  },

  /**
   * GET /api/notes/{method}/{collection_id}
   */
  getNotes: async (method: string, collectionId: string): Promise<any[]> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${collectionId}`;

    console.log(`[API GET] URL: ${url}`);

    try {
      const response = await apiClient.get(url);
      console.log(`[API GET] Status: ${response.status}`);
      console.log(`[API GET] Response Data:`, response.data);
      
      const data = response.data.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(`[API GET] FAILED: ${url}`, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  /**
   * DELETE /api/notes/{method}/{note_id}
   */
  deleteNote: async (method: string, noteId: string): Promise<void> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${noteId}`;

    console.log(`[API DELETE] URL: ${url}`);

    try {
      const response = await apiClient.delete(url);
      console.log(`[API DELETE] Status: ${response.status}`);
      console.log(`[API DELETE] Response Data:`, response.data);
    } catch (error: any) {
      console.error(`[API DELETE] FAILED: ${url}`, {
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
};
