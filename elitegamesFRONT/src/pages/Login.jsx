import React, { useState, useEffect } from "react";
import {
    BsFillEyeFill,
    BsFillEyeSlashFill
} from "react-icons/bs";
import {
    Link,
    useNavigate
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/Auth.css";
import {FaDiscord, FaTwitch, FaYoutube} from "react-icons/fa";
import logo from "../assets/elitegames_logo1_outline.png"

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Redirecionar se já estiver autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        // Limpar erro do campo específico ao digitar
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }

        // Limpar erro da API ao digitar qualquer campo
        if (errors.api) {
            setErrors((prev) => ({
                ...prev,
                api: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "E-mail inválido";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 6) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (!result.success) {
                setErrors({
                    api: result.error || "E-mail ou senha inválidos"
                });
                return;
            }

            navigate("/");

        } catch (error) {
            console.error("Erro no login:", error);
            setErrors({
                api: error.response?.data?.message || "Erro ao realizar login. Tente novamente."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container login-container">
            <div className="auth-card login-card">
                <div className="auth-header">
                    <div className="auth-icon">
                        <img src={logo} style={{width: 100, height: 100}} alt="logo EliteGames"/>
                    </div>
                    <h2>Bem-vindo de <span className="highlight">volta</span></h2>
                    <p>Entre na <span className="highlight-text">Elite</span> e continue dominando</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Mensagem de erro da API */}
                    {errors.api && (
                        <div className="error-message api-error">
                            {errors.api}
                        </div>
                    )}

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
                                disabled={loading}
                                autoComplete="email"
                                className={errors.email ? 'error' : ''}
                            />
                        </div>
                        {errors.email && (
                            <span className="error-message">{errors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <div className="input-icon password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={loading}
                                autoComplete="current-password"
                                className={errors.password ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex="-1"
                                disabled={loading}
                            >
                                {showPassword ? <BsFillEyeSlashFill /> : <BsFillEyeFill />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <span>Lembrar de mim</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-link">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn-auth-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Entrando...
                            </>
                        ) : (
                            'Entrar na Elite'
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ou entre com</span>
                </div>

                <div className="social-login">
                    <button type="button" className="btn-social" disabled={loading}>
                        <FaDiscord size={20}/> Discord
                    </button>
                    <button type="button" className="btn-social" disabled={loading}>
                        <FaYoutube size={20}/> YouTube
                    </button>
                    <button type="button" className="btn-social" disabled={loading}>
                        <FaTwitch size={18}/> Twitch
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Não tem uma conta?{" "}
                        <Link to="/join" className="auth-link">
                            Cadastre-se grátis
                        </Link>
                    </p>
                    <p className="footer-note">
                        ⚡ Domine o jogo com a EliteGames
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;