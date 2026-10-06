// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Restaura o usuário do localStorage (evita flash de "não logado")
        const cached = localStorage.getItem('user');
        return cached ? JSON.parse(cached) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!localStorage.getItem('token')
    );

    // ---------- Carrega o usuário do backend ----------
    const loadUser = useCallback(async () => {
        try {
            const { data } = await api.get('/profile');
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            // Token inválido/expirado — o interceptor do api já cuida do 401
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    // ---------- Ao montar / quando o token muda ----------
    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // ---------- LOGIN ----------
    const login = async (email, password) => {
        try {
            // ✅ Controller retorna String (token puro)
            const { data: newToken } = await api.post('/auth/login', {
                email,
                password,
            });

            localStorage.setItem('token', newToken);
            setToken(newToken);

            // Busca os dados do usuário com o novo token
            const { data: userData } = await api.get('/profile', {
                headers: { Authorization: `Bearer ${newToken}` },
            });

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);

            return { success: true, data: userData };
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                // O controller retorna "E-mail ou senha inválidos." como String
                error:
                    error.response?.data ||
                    error.response?.data?.message ||
                    'Erro ao fazer login',
            };
        }
    };

    // ---------- REGISTER ----------
    const register = async ({ name, email, password, role }) => {
        try {
            // ✅ RegisterRequest espera { name, email, password, role }
            const { data: newToken } = await api.post('/auth/register', {
                name,
                email,
                password,
                role,
            });

            localStorage.setItem('token', newToken);
            setToken(newToken);

            const { data: userData } = await api.get('/profile', {
                headers: { Authorization: `Bearer ${newToken}` },
            });

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);

            return { success: true, data: userData };
        } catch (error) {
            console.error('Erro no registro:', error);
            return {
                success: false,
                error:
                    error.response?.data ||
                    error.response?.data?.message ||
                    'Erro ao fazer registro',
            };
        }
    };

    // ---------- LOGOUT ----------
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // ---------- ATUALIZA O USUÁRIO LOCAL ----------
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // ---------- UPDATE PROFILE ----------
    const updateProfile = async (profileData) => {
        try {
            const { data } = await api.put('/profile', profileData);

            // Se o e-mail mudou, o backend retorna { message, token, user }
            let updatedUser = data;
            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                updatedUser = data.user;
            }

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, data: updatedUser };
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return {
                success: false,
                error:
                    error.response?.data ||
                    error.response?.data?.message ||
                    'Erro ao atualizar perfil',
            };
        }
    };

    // ---------- DELETE PROFILE ----------
    const deleteProfile = async () => {
        try {
            await api.delete('/profile');
            logout();
            return { success: true };
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            return {
                success: false,
                error:
                    error.response?.data ||
                    error.response?.data?.message ||
                    'Erro ao excluir conta',
            };
        }
    };

    // ---------- UPLOAD FOTO ----------
    const uploadProfilePhoto = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            await api.post('/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Recarrega o usuário para refletir a foto
            await loadUser();
            return { success: true };
        } catch (error) {
            console.error('Erro ao enviar foto:', error);
            return {
                success: false,
                error:
                    error.response?.data ||
                    'Erro ao enviar foto',
            };
        }
    };

    // ---------- Helpers de role ----------
    const hasRole = (role) => user?.role === role;
    const isCustomer = () => user?.role === 'CUSTOMER';
    const isSeller = () => user?.role === 'SELLER';

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        deleteProfile,
        uploadProfilePhoto,
        loadUser,
        hasRole,
        isCustomer,
        isSeller,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};