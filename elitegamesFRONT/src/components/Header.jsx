import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdExit } from 'react-icons/io';
import { BsCart3 } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../css/Header.css';
import logo from '../assets/elitegames_logo2_outline.png';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // ---------- carrinho: fetch inicial + eventos globais ----------
    useEffect(() => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        let cancelled = false;

        async function loadCartCount() {
            try {
                const { data } = await api.get('/cart');
                if (cancelled) return;
                const count =
                    data?.itemCount ??
                    (data?.items ?? []).reduce(
                        (acc, i) => acc + Number(i.quantity ?? 0),
                        0
                    );
                setCartCount(count);
            } catch {
                if (!cancelled) setCartCount(0);
            }
        }

        loadCartCount();

        // Reage a eventos disparados por Product.jsx / Cart.jsx / Payment.jsx
        const onCartUpdated = (e) => {
            const count = e?.detail?.itemCount;
            if (typeof count === 'number') setCartCount(count);
            else loadCartCount();
        };

        window.addEventListener('cart:updated', onCartUpdated);
        return () => {
            cancelled = true;
            window.removeEventListener('cart:updated', onCartUpdated);
        };
    }, [isAuthenticated]);

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="logo">
                    <Link to="/" className="logo-link" onClick={closeMenu}>
                        <span className="logo-icon">
                            <img
                                src={logo}
                                alt="Logo EliteGames"
                                style={{ height: 30, width: 30 }}
                            />
                        </span>
                        <span className="logo-text">
                            Elite<span className="logo-highlight">Games</span>
                        </span>
                    </Link>
                </div>

                {/* Botão menu mobile */}
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

                {/* Ações */}
                <div className="header-actions">
                    {/* Ícone do carrinho (só quando logado) */}
                    {isAuthenticated && (
                        <Link
                            to="/cart"
                            className="header-cart-link"
                            onClick={closeMenu}
                            aria-label={`Carrinho com ${cartCount} item(ns)`}
                            title="Meu carrinho"
                        >
                            <BsCart3 size={22} />
                            {cartCount > 0 && (
                                <span className="cart-badge">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {isAuthenticated && user ? (
                        <div className="user-info">
                            <Link
                                to="/profile"
                                className="user-info-link"
                                onClick={closeMenu}
                                aria-label="Ir para o perfil"
                            >
                                <div className="user-avatar">
                                    {getInitials(user.name)}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">
                                        {user.name || 'Usuário'}
                                    </span>
                                </div>
                            </Link>

                            <button
                                className="btn-logout"
                                onClick={handleLogout}
                                aria-label="Sair"
                                title="Sair"
                            >
                                <IoMdExit size={30} />
                            </button>
                        </div>
                    ) : (
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