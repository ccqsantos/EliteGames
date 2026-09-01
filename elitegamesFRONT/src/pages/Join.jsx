import React, { useState } from 'react';
import { BsFillEyeFill, BsFillEyeSlashFill } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';
import logo from "../assets/elitegames_logo2_outline.png"

const Join = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'gamer',
        agreeTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Nome completo é obrigatório';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'E-mail é obrigatório';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'E-mail inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Você precisa aceitar os termos';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);

        const payload = {
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.userType.toUpperCase()
        };

        try {
            const result = await register(payload);
            if (result.success) {
                navigate("/");
            } else {
                setErrors({
                    api: result.error || 'Erro ao criar conta. Tente novamente.'
                });
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            setErrors({
                api: 'Erro ao conectar com o servidor. Tente novamente mais tarde.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card join-card">
                <div className="auth-header">
                    <div className="auth-icon"><img src={logo} style={{
                        height: 100,
                        width: 100,
                    }} alt="logo EliteGames"/></div>
                    <h2>Crie sua conta <span className="highlight">Elite</span></h2>
                    <p>Entre para o time dos melhores gamers do Brasil</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {errors.api && (
                        <div className="error-message api-error">
                            {errors.api}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="fullName">Nome completo</label>
                        <div className="input-icon">
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                                disabled={isLoading}
                                className={errors.fullName ? 'error' : ''}
                            />
                        </div>
                        {errors.fullName && (
                            <span className="error-message">{errors.fullName}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <div className="input-icon">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                disabled={isLoading}
                                className={errors.email ? 'error' : ''}
                            />
                        </div>
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <div className="input-icon password-input">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={isLoading}
                                    className={errors.password ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar senha</label>
                            <div className="input-icon password-input">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Digite novamente"
                                    disabled={isLoading}
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex="-1"
                                    disabled={isLoading}
                                >
                                    {showConfirmPassword ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tipo de perfil</label>
                        <div className="user-type-selector">
                            <label className={`type-option ${formData.userType === 'gamer' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="gamer"
                                    checked={formData.userType === 'gamer'}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span className="type-icon">🎯</span>
                                <span className="type-name">Gamer</span>
                                <span className="type-desc">Comprar produtos</span>
                            </label>
                            <label className={`type-option ${formData.userType === 'elite' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="elite"
                                    checked={formData.userType === 'elite'}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                />
                                <span className="type-icon">⭐</span>
                                <span className="type-name">Elite</span>
                                <span className="type-desc">Acesso premium</span>
                            </label>
                        </div>
                    </div>

                    <label className="checkbox-label terms-checkbox">
                        <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                        <span>
                            Eu concordo com os <Link to="/terms">Termos de Serviço</Link> e{' '}
                            <Link to="/privacy">Política de Privacidade</Link>
                        </span>
                    </label>
                    {errors.agreeTerms && (
                        <span className="error-message">{errors.agreeTerms}</span>
                    )}

                    <button
                        type="submit"
                        className="btn-auth-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Criando conta...
                            </>
                        ) : (
                            'Criar conta gratuita'
                        )}
                    </button>

                    <div className="auth-divider">
                        <span>ou cadastre-se com</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn-social" disabled={isLoading}>
                            <span className="social-icon">🎮</span> Discord
                        </button>
                        <button type="button" className="btn-social" disabled={isLoading}>
                            <span className="social-icon">▶️</span> YouTube
                        </button>
                        <button type="button" className="btn-social" disabled={isLoading}>
                            <span className="social-icon">💬</span> Twitch
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>
                        Já tem uma conta? <Link to="/login" className="auth-link">Faça login</Link>
                    </p>
                    <p className="footer-note">
                        🎮 Junte-se à Elite e domine o jogo!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Join;