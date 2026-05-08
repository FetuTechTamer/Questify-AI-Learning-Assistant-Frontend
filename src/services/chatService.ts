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
    /**
     * Fetches all chat sessions for the user.
     */
    getSessions: async (): Promise<ChatSession[]> => {
        const url = '/api/chat/sessions';
        console.log(`[Chat API GET] ${url}`);
        
        try {
            const response = await apiClient.get(url);
            console.log(`[Chat API SUCCESS] GET ${url}`, response.data);
            // Support both {data: [...]} and direct array responses
            return response.data.data || (Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            console.error(`[Chat API ERROR] GET ${url}`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Fetches messages for a specific session.
     */
    getSessionMessages: async (sessionId: string): Promise<ChatMessage[]> => {
        const url = `/api/chat/sessions/${sessionId}/messages`;
        console.log(`[Chat API GET] ${url}`);
        
        try {
            const response = await apiClient.get(url);
            console.log(`[Chat API SUCCESS] GET ${url}`, response.data);
            return response.data.data || (Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            console.error(`[Chat API ERROR] GET ${url}`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Sends a message to Questy AI.
     */
    ask: async (params: { question: string; session_id: string; collection_id: string }): Promise<AskResponse> => {
        const url = '/api/chat/ask';
        
        // Construct the exact payload required by the backend
        const payload = {
            collection_id: params.collection_id,
            question: params.question,
            session_id: params.session_id
        };

        console.group(`[Chat API POST] ${url}`);
        console.log("Payload:", payload);
        console.groupEnd();
        
        try {
            const response = await apiClient.post(url, payload);
            console.log(`[Chat API SUCCESS] POST ${url}`, response.data);
            return response.data.data || response.data;
        } catch (error: any) {
            console.error(`[Chat API ERROR] POST ${url}`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Creates a new chat session for a collection.
     */
    createSession: async (collection_id: string): Promise<ChatSession> => {
        const url = '/api/chat/sessions';
        console.log(`[Chat API POST] ${url}`, { collection_id });
        
        try {
            const response = await apiClient.post(url, { collection_id });
            console.log(`[Chat API SUCCESS] POST ${url}`, response.data);
            return response.data.data || response.data;
        } catch (error: any) {
            console.error(`[Chat API ERROR] POST ${url}`, error.response?.data);
            throw error;
        }
    },

    /**
     * Deletes a chat session.
     */
    deleteSession: async (sessionId: string): Promise<void> => {
        const url = `/api/chat/sessions/${sessionId}`;
        console.log(`[Chat API DELETE] ${url}`);
        
        try {
            await apiClient.delete(url);
            console.log(`[Chat API SUCCESS] DELETE ${url}`);
        } catch (error: any) {
            console.error(`[Chat API ERROR] DELETE ${url}`, {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    }
};
