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
    'mind-map': 'mind-map',
    'charting': 'charting'
  };
  return mapping[method.toLowerCase()] || method.toLowerCase();
};

export const noteService = {
  /**
   * Triggers AI note generation for a specific method and collection.
   * Sends the requested payload structure to minimize 422 validation errors.
   */
  generateNote: async (method: string, collectionId: string): Promise<any> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}`; // Reverted to plural
    const payload = {
      collection_id: collectionId,
      title: `${method.charAt(0).toUpperCase() + method.slice(1)} Note`,
      content: "AI-generated content stub"
    };

    console.group(`[API POST] ${url}`);
    console.log("Headers:", apiClient.defaults.headers);
    console.log("Payload:", payload);
    console.groupEnd();

    try {
      const response = await apiClient.post(url, payload);
      console.log(`[API SUCCESS] POST ${url}`, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.group(`[API ERROR 422] Validation Failed: ${url}`);
        console.error("Detail Error Array:", error.response.data.detail);
        console.log("Full Response Body:", error.response.data);
        console.groupEnd();
      } else {
        console.error(`[API ERROR] POST ${url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  /**
   * Fetches all notes for a specific method and collection.
   */
  getNotes: async (method: string, collectionId: string): Promise<any[]> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${collectionId}`;

    console.log(`[API GET] ${url}`);

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

  /**
   * Deletes a specific note by ID.
   */
  deleteNote: async (method: string, noteId: string): Promise<void> => {
    const slug = mapMethodSlug(method);
    const url = `/api/notes/${slug}/${noteId}`;

    console.log(`[API DELETE] ${url}`);

    try {
      await apiClient.delete(url);
      console.log(`[API SUCCESS] DELETE ${url}`);
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
