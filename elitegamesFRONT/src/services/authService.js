import axios from "axios";

const API_URL = "http://localhost:8080"; // ajuste conforme seu backend

export const authService = {
    async register({ name, email, password, role }) {
        const response = await axios.post(`${API_URL}/auth/register`, {
            name,
            email,
            password,
            role,
        });
        // O controller retorna o token como String pura
        return response.data;
    },

    async login({ email, password }) {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
        });
        return response.data;
    },
};