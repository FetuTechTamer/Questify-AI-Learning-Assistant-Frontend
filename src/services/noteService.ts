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
    const payload = { collection_id: collectionId };

    try {
      const response = await apiClient.post(url, payload);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`[API POST] Failed: ${url}`, error);
      throw error;
    }
  },

  /**
   * GET /api/notes/{method}/{collection_id}
   */
  getNotes: async (method: string, collectionId: string): Promise<any[]> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${collectionId}`;

    try {
      const response = await apiClient.get(url);
      const data = response.data.data || response.data || [];
      
      // Return as array. If backend returns single object, wrap it.
      if (data && !Array.isArray(data)) {
        return [data];
      }
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error(`[API GET] Failed: ${url}`, error);
      throw error;
    }
  },

  /**
   * DELETE /api/notes/{method}/{note_id}
   */
  deleteNote: async (method: string, noteId: string): Promise<void> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${noteId}`;

    try {
      await apiClient.delete(url);
    } catch (error: any) {
      console.error(`[API DELETE] Failed: ${url}`, error);
      throw error;
    }
  }
};
