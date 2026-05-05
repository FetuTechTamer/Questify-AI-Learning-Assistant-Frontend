import apiClient from './apiClient';

export interface ChatSession {
    session_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface AskResponse {
    response: string;
    message_id: string;
    session_id: string;
}

export const chatService = {
    getSessions: async (): Promise<ChatSession[]> => {
        const response = await apiClient.get('/api/chat/sessions');
        return response.data.data || response.data || [];
    },

    getSessionMessages: async (sessionId: string): Promise<ChatMessage[]> => {
        const response = await apiClient.get(`/api/chat/sessions/${sessionId}/messages`);
        return response.data.data || response.data || [];
    },

    ask: async (params: { message: string; session_id?: string; collection_id?: string }): Promise<AskResponse> => {
        const response = await apiClient.post('/api/chat/ask', params);
        return response.data.data || response.data;
    },

    deleteSession: async (sessionId: string): Promise<void> => {
        await apiClient.delete(`/api/chat/sessions/${sessionId}`);
    }
};
