import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);


// =========================================================
// HOOK
// =========================================================

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider'
        );
    }

    return context;
};


// =========================================================
// PROVIDER
// =========================================================

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        () => localStorage.getItem('token')
    );

    const [loading, setLoading] = useState(true);


    // =========================================================
    // SALVAR USUÁRIO
    // =========================================================

    const saveUser = (userData) => {

        setUser(userData);

        if (userData) {
            localStorage.setItem(
                'user',
                JSON.stringify(userData)
            );
        } else {
            localStorage.removeItem('user');
        }
    };


    // =========================================================
    // BUSCAR USUÁRIO LOGADO
    // =========================================================

    const fetchUser = async () => {

        try {

            const response = await api.get('/profile');

            console.log(
                'Usuário recebido do backend:',
                response.data
            );

            saveUser(response.data);

            return response.data;

        } catch (error) {

            console.error(
                'Erro ao buscar /profile:',
                error.response?.data || error
            );

            throw error;
        }
    };


    // =========================================================
    // RESTAURAR LOGIN AO ABRIR A APLICAÇÃO
    // =========================================================

    useEffect(() => {

        const restoreSession = async () => {

            const storedToken =
                localStorage.getItem('token');

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {

                setToken(storedToken);

                await fetchUser();

            } catch (error) {

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                setToken(null);
                setUser(null);

            } finally {

                setLoading(false);

            }
        };

        restoreSession();

    }, []);


    // =========================================================
    // LOGIN
    // =========================================================

    const login = async (email, password) => {

        try {

            console.log('Tentando fazer login...');

            const response = await api.post(
                '/auth/login',
                {
                    email,
                    password,
                }
            );

            /*
             * Seu AuthController retorna:
             *
             * ResponseEntity<String>
             *
             * portanto response.data é diretamente o JWT.
             */

            const newToken = response.data;

            console.log(
                'Token recebido:',
                newToken
            );

            if (!newToken) {

                return {
                    success: false,
                    error: 'Servidor não retornou um token.',
                };
            }


            // Salva token
            localStorage.setItem(
                'token',
                newToken
            );

            setToken(newToken);


            /*
             * Agora o api.js já consegue pegar
             * o token do localStorage e colocar:
             *
             * Authorization: Bearer TOKEN
             */
            const userResponse = await api.get(
                '/profile'
            );

            console.log(
                'Usuário recebido após login:',
                userResponse.data
            );

            const userData = userResponse.data;

            saveUser(userData);


            return {
                success: true,
                data: userData,
            };

        } catch (error) {

            console.error(
                'ERRO NO LOGIN:',
                error.response?.data || error
            );

            return {
                success: false,
                error:
                    typeof error.response?.data === 'string'
                        ? error.response.data
                        : error.response?.data?.message ||
                          'E-mail ou senha inválidos.',
            };
        }
    };


    // =========================================================
    // REGISTER
    // =========================================================

    const register = async ({
        name,
        email,
        password,
        role,
    }) => {

        try {

            const response = await api.post(
                '/auth/register',
                {
                    name,
                    email,
                    password,
                    role,
                }
            );

            /*
             * Register também retorna String = JWT
             */
            const newToken = response.data;

            if (!newToken) {

                return {
                    success: false,
                    error: 'Servidor não retornou um token.',
                };
            }


            localStorage.setItem(
                'token',
                newToken
            );

            setToken(newToken);


            /*
             * O interceptor do api.js
             * envia o token automaticamente.
             */
            const userResponse = await api.get(
                '/profile'
            );

            const userData = userResponse.data;

            saveUser(userData);


            return {
                success: true,
                data: userData,
            };

        } catch (error) {

            console.error(
                'ERRO NO REGISTRO:',
                error.response?.data || error
            );

            return {
                success: false,
                error:
                    typeof error.response?.data === 'string'
                        ? error.response.data
                        : error.response?.data?.message ||
                          'Erro ao criar conta.',
            };
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setToken(null);
        setUser(null);
    };


    // =========================================================
    // ATUALIZAR USUÁRIO LOCAL
    // =========================================================

    const updateUser = (updatedUser) => {

        saveUser(updatedUser);
    };


    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    const updateProfile = async (profileData) => {

        try {

            const response = await api.put(
                '/profile',
                profileData
            );

            const data = response.data;


            /*
             * Caso o e-mail tenha sido alterado,
             * o backend retorna:
             *
             * {
             *   message,
             *   token,
             *   user
             * }
             */

            if (data.token) {

                localStorage.setItem(
                    'token',
                    data.token
                );

                setToken(data.token);

                saveUser(data.user);

                return {
                    success: true,
                    data: data.user,
                };
            }


            /*
             * Caso normal:
             *
             * retorna diretamente User
             */

            saveUser(data);

            return {
                success: true,
                data,
            };

        } catch (error) {

            console.error(
                'Erro ao atualizar perfil:',
                error.response?.data || error
            );

            return {
                success: false,
                error:
                    typeof error.response?.data === 'string'
                        ? error.response.data
                        : error.response?.data?.message ||
                          'Erro ao atualizar perfil.',
            };
        }
    };


    // =========================================================
    // DELETE PROFILE
    // =========================================================

    const deleteProfile = async () => {

        try {

            await api.delete('/profile');

            logout();

            return {
                success: true,
            };

        } catch (error) {

            console.error(
                'Erro ao excluir conta:',
                error.response?.data || error
            );

            return {
                success: false,
                error:
                    typeof error.response?.data === 'string'
                        ? error.response.data
                        : error.response?.data?.message ||
                          'Erro ao excluir conta.',
            };
        }
    };


    // =========================================================
    // UPLOAD FOTO
    // =========================================================

    const uploadProfilePhoto = async (file) => {

        try {

            const formData = new FormData();

            formData.append(
                'file',
                file
            );

            await api.post(
                '/profile/upload-photo',
                formData
            );

            /*
             * Busca novamente os dados
             * do usuário depois do upload.
             */
            await fetchUser();

            return {
                success: true,
            };

        } catch (error) {

            console.error(
                'Erro ao enviar foto:',
                error.response?.data || error
            );

            return {
                success: false,
                error:
                    typeof error.response?.data === 'string'
                        ? error.response.data
                        : error.response?.data?.message ||
                          'Erro ao enviar foto.',
            };
        }
    };


    // =========================================================
    // ROLES
    // =========================================================

    const hasRole = (role) => {
        return user?.role === role;
    };

    const isCustomer = () => {
        return user?.role === 'CUSTOMER';
    };

    const isSeller = () => {
        return user?.role === 'SELLER';
    };


    // =========================================================
    // CONTEXT
    // =========================================================

    const value = {

        user,

        token,

        loading,

        /*
         * Só considera logado quando temos
         * token E usuário.
         */
        isAuthenticated:
            Boolean(token && user),

        login,

        register,

        logout,

        updateUser,

        updateProfile,

        deleteProfile,

        uploadProfilePhoto,

        loadUser: fetchUser,

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

export default AuthContext;
