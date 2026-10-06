import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Header.css';
import logo from "../assets/elitegames_logo2_outline.png";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/login');
    };

    // Pega as iniciais do nome (ex: "Cauã Ceccaroni" -> "CC")
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .trim()
            .split(' ')
            .filter(Boolean)
            .map((word) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // Cor do avatar por role
    const getAvatarColor = () => {
        if (!user?.role) return '#7c3aed';
        return user.role === 'SELLER' ? '#6d28d9' : '#7c3aed';
    };

    // Label amigável da role
    const getRoleLabel = (role) => {
        if (!role) return 'Usuário';
        return role === 'SELLER' ? 'Vendedor' : 'Cliente';
    };

    // Fecha o menu mobile ao navegar
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="logo">
                    <Link to="/" className="logo-link" onClick={closeMenu}>
                        <span className="logo-icon">
                            <img
                                src={logo}
                                alt="logo EliteGames"
                                style={{ height: 38, width: 38 }}
                            />
                        </span>
                        <span className="logo-text">
                            Elite<span className="logo-highlight">Games</span>
                        </span>
                    </Link>
                </div>

                {/* Botão do menu mobile */}
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

                {/* Navegação */}
                <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    <Link className="nav-link" to="/" onClick={closeMenu}>
                        Início
                    </Link>
                    <Link className="nav-link" to="/shop" onClick={closeMenu}>
                        Loja
                    </Link>
                    <Link className="nav-link" to="/offers" onClick={closeMenu}>
                        Ofertas
                    </Link>
                    <Link className="nav-link" to="/about" onClick={closeMenu}>
                        Sobre
                    </Link>
                </nav>

                {/* Ações do header */}
                <div className="header-actions">
                    {isAuthenticated ? (
                        // ---------- USUÁRIO LOGADO ----------
                        <div className="user-info">
                            <Link
                                to="/profile"
                                className="user-info-link"
                                onClick={closeMenu}
                                aria-label="Ir para o perfil"
                            >
                                <div
                                    className="user-avatar"
                                    style={{ backgroundColor: getAvatarColor() }}
                                >
                                    {getInitials(user?.name)}
                                    {user?.role === 'SELLER' && (
                                        <span className="avatar-badge">⭐</span>
                                    )}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">
                                        {user?.name || 'Usuário'}
                                    </span>
                                    <span className="user-role">
                                        {getRoleLabel(user?.role)}
                                    </span>
                                </div>
                            </Link>

                            <button
                                className="btn-logout"
                                onClick={handleLogout}
                                aria-label="Sair"
                                title="Sair"
                            >
                                <span className="logout-icon">🚪</span>
                            </button>
                        </div>
                    ) : (
                        // ---------- USUÁRIO NÃO LOGADO ----------
                        <div className="auth-buttons">
                            <Link to="/login" onClick={closeMenu}>
                                <button className="btn-outline">Entrar</button>
                            </Link>
                            <Link to="/join" onClick={closeMenu}>
                                <button className="btn-primary">Criar Conta</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;