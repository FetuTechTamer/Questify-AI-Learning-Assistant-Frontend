import apiClient from './apiClient';

/**
 * Mapping for study method internal IDs to API slugs.
 */
const mapMethodSlug = (method: string): string => {
  const mapping: Record<string, string> = {
    'pomodoro': 'pomodoro',
    'feynman': 'feynman',
    'leitner': 'leitner',
    'sq3r': 'sq3r',
    'active_recall': 'active-recall'
  };
  return mapping[method.toLowerCase()] || method.toLowerCase().replace('_', '-');
};

export const studyService = {
  /**
   * Generates a study session/content for a specific method and collection.
   */
  generateSession: async (method: string, collectionId: string): Promise<any> => {
    const slug = mapMethodSlug(method);
    const url = `/api/study/${slug}`;
    const payload = { collection_id: collectionId };

    console.group(`[Study API POST] ${url}`);
    console.log("Payload:", payload);
    console.groupEnd();

    try {
      const response = await apiClient.post(url, payload);
      console.log(`[Study API SUCCESS] POST ${url}`, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        console.group(`[Study API ERROR 422] Validation Failed: ${url}`);
        console.error("Detail Error Array:", error.response.data.detail);
        console.log("Full Response Body:", error.response.data);
        console.groupEnd();
      } else {
        console.error(`[Study API ERROR] POST ${url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      throw error;
    }
  },

  /**
   * Fetches the study session/content for a specific method and collection.
   */
  getSession: async (method: string, collectionId: string): Promise<any> => {
    const slug = mapMethodSlug(method);
    const url = `/api/study/${slug}/${collectionId}`;

    console.log(`[Study API GET] ${url}`);

    try {
      const response = await apiClient.get(url);
      console.log(`[Study API SUCCESS] GET ${url}`, response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`[Study API ERROR] GET ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};
