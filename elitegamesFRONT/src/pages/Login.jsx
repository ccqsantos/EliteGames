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

import {
    FaApple,
    FaGoogle
} from "react-icons/fa";

import logo from "../assets/elitegames_logo1_outline.png";


const Login = () => {

    const navigate = useNavigate();

    const {
        login,
        isAuthenticated,
        loading: authLoading
    } = useAuth();


    // =========================================================
    // FORM
    // =========================================================

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);


    // =========================================================
    // REDIRECIONAR SE JÁ ESTIVER LOGADO
    // =========================================================

    useEffect(() => {

        if (!authLoading && isAuthenticated) {
            navigate("/", { replace: true });
        }

    }, [
        isAuthenticated,
        authLoading,
        navigate
    ]);


    // =========================================================
    // INPUT
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }

        if (errors.api) {
            setErrors((prev) => ({
                ...prev,
                api: "",
            }));
        }
    };


    // =========================================================
    // VALIDAÇÃO
    // =========================================================

    const validateForm = () => {

        const newErrors = {};

        if (!formData.email.trim()) {

            newErrors.email =
                "E-mail é obrigatório";

        } else if (
            !/\S+@\S+\.\S+/.test(
                formData.email
            )
        ) {

            newErrors.email =
                "E-mail inválido";
        }


        if (!formData.password.trim()) {

            newErrors.password =
                "Senha é obrigatória";

        } else if (
            formData.password.length < 6
        ) {

            newErrors.password =
                "Senha deve ter no mínimo 6 caracteres";
        }

        return newErrors;
    };


    // =========================================================
    // LOGIN
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        const validationErrors =
            validateForm();

        if (
            Object.keys(validationErrors)
                .length > 0
        ) {

            setErrors(validationErrors);
            return;
        }


        setLoading(true);

        try {

            /*
             * IMPORTANTE:
             *
             * NÃO chamamos authService.login()
             * aqui.
             *
             * O AuthContext já faz:
             *
             * POST /auth/login
             * ↓
             * recebe JWT
             * ↓
             * salva JWT
             * ↓
             * GET /profile
             * ↓
             * salva usuário
             */

            const result = await login(
                formData.email,
                formData.password
            );


            if (!result.success) {

                setErrors({
                    api: result.error
                });

                return;
            }


            console.log(
                "Login realizado:",
                result.data
            );


            /*
             * result.data deve ser algo como:
             *
             * {
             *     id: 1,
             *     name: "Cauã",
             *     email: "...",
             *     role: "CUSTOMER"
             * }
             */


            navigate("/", {
                replace: true
            });

        } catch (error) {

            console.error(
                "Erro inesperado no login:",
                error
            );

            setErrors({
                api:
                    "Erro ao realizar login. Tente novamente."
            });

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="auth-container login-container">

            <div className="auth-card join-card">

                <div className="auth-header">

                    <div className="auth-icon flex justify-items-center">

                        <img
                            src={logo}
                            style={{
                                width: 100,
                                height: 100,
                                alignSelf: "center",
                            }}
                            alt="logo EliteGames"
                        />

                    </div>

                        <span className="highlight">
                            Bem-vindo de volta
                        </span>

                    <p>
                        Entre na{" "}
                        <span className="highlight-text">
                            Elite
                        </span>{" "}
                        e continue dominando
                    </p>
                </div>


                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    {errors.api && (
                        <div className="error-message api-error">
                            {errors.api}
                        </div>
                    )}


                    {/* EMAIL */}

                    <div className="form-group">

                        <label htmlFor="email">
                            E-mail
                        </label>

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
                                className={
                                    errors.email
                                        ? "error"
                                        : ""
                                }
                            />

                        </div>

                        {errors.email && (
                            <span className="error-message">
                                {errors.email}
                            </span>
                        )}

                    </div>


                    {/* SENHA */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Senha
                        </label>

                        <div className="input-icon password-input">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                disabled={loading}
                                autoComplete="current-password"
                                className={
                                    errors.password
                                        ? "error"
                                        : ""
                                }
                            />

                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) => !prev
                                    )
                                }
                                tabIndex="-1"
                                disabled={loading}
                            >
                                {showPassword
                                    ? <BsFillEyeSlashFill />
                                    : <BsFillEyeFill />
                                }
                            </button>

                        </div>

                        {errors.password && (
                            <span className="error-message">
                                {errors.password}
                            </span>
                        )}

                    </div>


                    {/* OPÇÕES */}

                    <div className="form-options">

                        <label className="checkbox-label">

                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={
                                    formData.rememberMe
                                }
                                onChange={handleChange}
                                disabled={loading}
                            />

                            <span>
                                Lembrar de mim
                            </span>

                        </label>

                        <Link
                            to="/forgot-password"
                            className="forgot-link"
                        >
                            Esqueceu a senha?
                        </Link>

                    </div>


                    {/* BOTÃO */}

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
                            "Entrar na Elite"
                        )}

                    </button>

                </form>


                {/* SOCIAL */}

                <div className="auth-divider">
                    <span>
                        ou entre com
                    </span>
                </div>


                <div className="social-login">

                    <button
                        type="button"
                        className="btn-social"
                        disabled={loading}
                    >
                        <FaGoogle size={20} />
                        Google
                    </button>

                    <button
                        type="button"
                        className="btn-social"
                        disabled={loading}
                    >
                        <FaApple size={24} />
                        Apple
                    </button>

                </div>


                {/* FOOTER */}

                <div className="auth-footer">

                    <p>
                        Não tem uma conta?{" "}

                        <Link
                            to="/join"
                            className="auth-link"
                        >
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
