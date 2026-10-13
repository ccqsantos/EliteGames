import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Join = () => {
    const navigate = useNavigate();

    const { register, isAuthenticated, loading: authLoading } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CUSTOMER",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Se já estiver logado, não precisa acessar a página de cadastro
    if (isAuthenticated && !authLoading) {
        navigate("/");
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Remove o erro daquele campo ao começar a digitar
        setErrors((prev) => ({
            ...prev,
            [name]: "",
            api: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Digite um e-mail válido.";
        }

        if (!formData.password) {
            newErrors.password = "Senha é obrigatória.";
        } else if (formData.password.length < 6) {
            newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirme sua senha.";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem.";
        }

        if (!formData.role) {
            newErrors.role = "Selecione um tipo de conta.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (!result.success) {
                setErrors({
                    api:
                        typeof result.error === "string"
                            ? result.error
                            : "Não foi possível criar a conta.",
                });

                return;
            }

            // Cadastro realizado e usuário já autenticado
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Erro ao criar conta:", error);

            setErrors({
                api: "Ocorreu um erro ao criar sua conta.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="join-page">
            <div className="join-container">

                <div className="join-header">
                    <h1>Criar Conta</h1>
                    <p>
                        Crie sua conta no EliteGames
                    </p>
                </div>

                {errors.api && (
                    <div className="error-message">
                        {errors.api}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="join-form">

                    {/* Nome */}
                    <div className="form-group">
                        <label htmlFor="name">
                            Nome
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Digite seu nome"
                            disabled={loading}
                        />

                        {errors.name && (
                            <span className="field-error">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    {/* E-mail */}
                    <div className="form-group">
                        <label htmlFor="email">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Digite seu e-mail"
                            disabled={loading}
                        />

                        {errors.email && (
                            <span className="field-error">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    {/* Senha */}
                    <div className="form-group">
                        <label htmlFor="password">
                            Senha
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Digite sua senha"
                            disabled={loading}
                        />

                        {errors.password && (
                            <span className="field-error">
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {/* Confirmar senha */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirmar senha
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirme sua senha"
                            disabled={loading}
                        />

                        {errors.confirmPassword && (
                            <span className="field-error">
                                {errors.confirmPassword}
                            </span>
                        )}
                    </div>

                    {/* Tipo de conta */}
                    <div className="form-group">
                        <label htmlFor="role">
                            Tipo de conta
                        </label>

                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="CUSTOMER">
                                Cliente
                            </option>

                            <option value="SELLER">
                                Vendedor
                            </option>
                        </select>

                        {errors.role && (
                            <span className="field-error">
                                {errors.role}
                            </span>
                        )}
                    </div>

                    {/* Botão */}
                    <button
                        type="submit"
                        className="join-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Criando conta..."
                            : "Criar Conta"}
                    </button>
                </form>

                <div className="join-footer">
                    <p>
                        Já possui uma conta?{" "}
                        <Link to="/login">
                            Entrar
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Join;