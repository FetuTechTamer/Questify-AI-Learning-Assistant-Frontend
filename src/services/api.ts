const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://questiai-43b71abdd48b.herokuapp.com';

class API {
    static getHeaders(isFormData = false): HeadersInit {
        const token = localStorage.getItem('access_token');
        const headers: Record<string, string> = {};

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    static async handleResponse(response: Response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.detail || 'API Error');
        }

        return data;
    }

    // ============ AUTH ENDPOINTS ============

    static async login(email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        // Store token if login successful
        if (data.success && data.data?.access_token) {
            localStorage.setItem('access_token', data.data.access_token);
        }
        return data;
    }

    static async register(full_name: string, email: string, password: string) {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password }),
        });
        return this.handleResponse(response);
    }

    static async verifyOTP(email: string, otp: string) {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        return this.handleResponse(response);
    }

    static async resendOTP(email: string) {
        const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return this.handleResponse(response);
    }

    static async getUserProfile() {
        const response = await fetch(`${API_BASE_URL}/api/auth/user/profile`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    static async getFullProfile() {
        const response = await fetch(`${API_BASE_URL}/api/auth/user/profile/full`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    static async getExamHistory() {
        const response = await fetch(`${API_BASE_URL}/api/exam/history`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    static async logout() {
        localStorage.removeItem('access_token');
    }

    // ============ MATERIAL ENDPOINTS ============

    static async uploadMaterial(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/api/material/upload`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData,
        });
        return this.handleResponse(response);
    }

    static async getMaterials() {
        const response = await fetch(`${API_BASE_URL}/api/material/list`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }

    // ============ AI ENDPOINTS ============

    static async chat(message: string, materialId?: string) {
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ message, material_id: materialId }),
        });
        return this.handleResponse(response);
    }

    static async generateExam(materialId: string, numQuestions: number = 10) {
        const response = await fetch(`${API_BASE_URL}/api/ai/generate-exam`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ material_id: materialId, num_questions: numQuestions }),
        });
        return this.handleResponse(response);
    }

    static async getConceptMap(materialId: string) {
        const response = await fetch(`${API_BASE_URL}/api/ai/concept-map`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ material_id: materialId }),
        });
        return this.handleResponse(response);
    }
}

export default API;