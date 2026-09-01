import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Header.css';
import logo from "../assets/elitegames_logo2_outline.png"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getAvatarColor = () => {
        if (!user?.role) return '#7c3aed';
        return user.role === 'ELITE' ? '#7c3aed' : '#6d28d9';
    };

    const getRoleLabel = (role) => {
        if (!role) return 'Usuário';
        return role === 'ELITE' ? 'Elite' : 'Gamer';
    };

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="logo">
                    <Link to="/" className="logo-link">
                        <span className="logo-icon"><img src={logo} alt="logo EliteGames"
                         style={{height: 38, width: 38}}/></span>
                        <span className="logo-text">
                            Elite<span className="logo-highlight">Games</span>
                        </span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu"
                >
                    <span className={`menu-icon ${isMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                {/* Navigation */}
                <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link
                        className="nav-link"
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Início
                    </Link>
                    <Link
                        className="nav-link"
                        to="/shop"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Loja
                    </Link>
                    <Link
                        className="nav-link"
                        to="/offers"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Ofertas
                    </Link>
                    <Link
                        className="nav-link"
                        to="/about"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Sobre
                    </Link>
                </nav>

                {/* Header Actions */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        // Usuário logado
                        <div className="user-info">
                            <Link to="/profile" className="user-info-link">
                                <div
                                    className="user-avatar"
                                    style={{ backgroundColor: getAvatarColor() }}
                                >
                                    {getInitials(user?.name)}
                                    {user?.role === 'ELITE' && (
                                        <span className="avatar-badge">⭐</span>
                                    )}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user?.name}</span>
                                    <span className="user-role">
                                        {getRoleLabel(user?.role)}
                                    </span>
                                </div>
                            </Link>
                            <button
                                className="btn-logout"
                                onClick={handleLogout}
                                aria-label="Sair"
                            >
                                <span className="logout-icon">🚪</span>
                            </button>
                        </div>
                    ) : (
                        // Usuário não logado
                        <div className="auth-buttons">
                            <Link to="/login">
                                <button className="btn-outline">Entrar</button>
                            </Link>
                            <Link to="/join">
                                <button className="btn-primary">Tornar-se Elite</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;