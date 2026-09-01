// src/hooks/useAuth.js
import { useAuth } from '../context/AuthContext';

export const useAuthRedirect = () => {
    const { isAuthenticated, user } = useAuth();

    const getRedirectPath = () => {
        if (!isAuthenticated) return '/login';

        switch (user?.role) {
            case 'CLIENT':
                return '/client/dashboard';
            case 'FREELANCER':
                return '/freelancer/dashboard';
            default:
                return '/';
        }
    };

    return { getRedirectPath };
};