// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080";
const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Configurar interceptor do axios
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    // 🔧 Buscar dados do usuário usando o endpoint /profile
    const loadUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Dados do usuário carregados do /profile:", response.data);

            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Erro ao carregar usuário:", error);
            // Se o token for inválido, faz logout
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            // Seu backend retorna apenas o token como string
            const newToken = response.data;

            console.log("Token recebido:", newToken);

            // Salvar token
            localStorage.setItem('token', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            setToken(newToken);

            // 🔧 Buscar dados do usuário após o login usando o endpoint /profile
            const userResponse = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${newToken}` }
            });

            const userData = userResponse.data;
            console.log("Dados do usuário após login:", userData);

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);

            return { success: true, data: userData };
        } catch (error) {
            console.error("Erro no login:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Erro ao fazer login"
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);

            const newToken = response.data;

            console.log("Registro realizado, token:", newToken);

            // Salvar token
            localStorage.setItem('token', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            setToken(newToken);

            // 🔧 Buscar dados do usuário após o registro
            const userResponse = await axios.get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${newToken}` }
            });

            const newUser = userResponse.data;
            console.log("Dados do usuário após registro:", newUser);

            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            setIsAuthenticated(true);

            return { success: true, data: newUser };
        } catch (error) {
            console.error("Erro no registro:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Erro ao fazer registro"
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];

        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // 🔧 Função para atualizar o perfil do usuário
    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put(`${API_URL}/profile`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Se o email mudou, o backend pode retornar um novo token
            if (response.data.token) {
                const newToken = response.data.token;
                localStorage.setItem('token', newToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                setToken(newToken);
            }

            // Atualizar dados do usuário
            const updatedUser = response.data.user || response.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, data: updatedUser };
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Erro ao atualizar perfil"
            };
        }
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateProfile, // Adicionando função de atualização de perfil
        hasRole: (role) => user?.role === role,
        isClient: () => user?.role === 'CLIENT',
        isFreelancer: () => user?.role === 'FREELANCER'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};