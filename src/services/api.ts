// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://questiai-43b71abdd48b.herokuapp.com';

class QuestifyAPI {
    private token: string | null = null;

    constructor() {
        this.token = localStorage.getItem('access_token');
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'API request failed');
        return data;
    }

    // Authentication
    async login(email: string, password: string) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.data?.access_token) {
            this.token = data.data.access_token;
            localStorage.setItem('access_token', this.token);
        }
        return data;
    }

    async register(full_name: string, email: string, password: string) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ full_name, email, password }),
        });
    }

    // Materials
    async uploadMaterial(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/material/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}` },
            body: formData,
        });
        return response.json();
    }

    async getMaterials() {
        return this.request('/api/material/list');
    }

    // AI Features
    async generateExam(material_id: string, num_questions: number = 10) {
        return this.request('/api/ai/generate-exam', {
            method: 'POST',
            body: JSON.stringify({ material_id, num_questions }),
        });
    }

    async chat(message: string, material_id?: string) {
        return this.request('/api/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, material_id }),
        });
    }

    async getConceptMap(material_id: string) {
        return this.request('/api/ai/concept-map', {
            method: 'POST',
            body: JSON.stringify({ material_id }),
        });
    }
}

export const api = new QuestifyAPI();