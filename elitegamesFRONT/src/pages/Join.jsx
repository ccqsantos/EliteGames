import React, { useState } from "react";
import { Mail, ArrowRight, Eye, EyeOff, User, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Join() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "CUSTOMER", // ✅ role que o backend espera
    });

    const [aceitouTermos, setAceitouTermos] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        if (errors.api) setErrors((prev) => ({ ...prev, api: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
        else if (formData.name.trim().length < 3)
            newErrors.name = "Nome deve ter no mínimo 3 caracteres";

        if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "E-mail inválido";

        if (!formData.password) newErrors.password = "Senha é obrigatória";
        else if (formData.password.length < 6)
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";

        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "As senhas não coincidem";

        if (!aceitouTermos)
            newErrors.termos = "Você precisa aceitar os Termos de Serviço";

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
            // ✅ Envia apenas o que o RegisterRequest espera
            const token = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            // ✅ Salva o token e faz login automático
            login(token);

            navigate("/");
        } catch (error) {
            const message =
                error.response?.data ||
                error.response?.data?.message ||
                "Erro ao criar conta. Tente novamente.";
            setErrors({ api: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-[#0a0a0a] text-white py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Coluna Esquerda */}
                <div className="flex-1 space-y-6 lg:sticky lg:top-8">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Crie sua <span className="text-purple-500">Conta</span>
                        <br />e Comece Agora.
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Cadastre-se na EliteGames e tenha acesso a GPUs de alto desempenho
                        para IA, renderização e jogos com entrega rápida.
                    </p>

                    <div className="flex gap-8 py-4">
                        <div>
                            <p className="text-2xl font-bold text-purple-400">+240 FPS</p>
                            <p className="text-sm text-gray-500">Média em jogos</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">8K Ultra</p>
                            <p className="text-sm text-gray-500">Resolução máxima</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">3 Anos</p>
                            <p className="text-sm text-gray-500">De garantia</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800">
                        <p className="text-sm text-gray-400">
                            Já possui uma conta?{" "}
                            <Link
                                to="/login"
                                className="text-purple-400 hover:text-purple-300 font-medium hover:underline"
                            >
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Coluna Direita - Formulário */}
                <div className="flex-1 w-full max-w-lg bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {errors.api && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-md px-4 py-2.5">
                                {errors.api}
                            </div>
                        )}

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Nome completo
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                                />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Digite seu nome"
                                    required
                                    className={`w-full bg-[#0a0a0a] border rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                                        errors.name
                                            ? "border-red-500"
                                            : "border-[#262626] focus:border-purple-500"
                                    }`}
                                />
                            </div>
                            {errors.name && (
                                <span className="text-red-400 text-xs mt-1 block">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Ex: seuemail@elitegames.com"
                                    required
                                    className={`w-full bg-[#0a0a0a] border rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-[#262626] focus:border-purple-500"
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <span className="text-red-400 text-xs mt-1 block">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        {/* Tipo de conta (role) */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Tipo de conta
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((p) => ({ ...p, role: "CUSTOMER" }))
                                    }
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-sm font-medium transition ${
                                        formData.role === "CUSTOMER"
                                            ? "border-purple-500 bg-purple-500/10 text-white"
                                            : "border-[#262626] text-gray-400 hover:border-gray-500"
                                    }`}
                                >
                                    <ShoppingBag size={16} />
                                    Comprar
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((p) => ({ ...p, role: "SELLER" }))
                                    }
                                    className={`flex items-center justify-center gap-2 py-2.5 rounded-md border text-sm font-medium transition ${
                                        formData.role === "SELLER"
                                            ? "border-purple-500 bg-purple-500/10 text-white"
                                            : "border-[#262626] text-gray-400 hover:border-gray-500"
                                    }`}
                                >
                                    <User size={16} />
                                    Vender
                                </button>
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Crie uma senha forte"
                                    required
                                    className={`w-full bg-[#0a0a0a] border rounded-md px-4 py-2.5 pr-10 text-sm text-white focus:outline-none transition ${
                                        errors.password
                                            ? "border-red-500"
                                            : "border-[#262626] focus:border-purple-500"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-red-400 text-xs mt-1 block">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Confirmação de Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirme a senha"
                                    required
                                    className={`w-full bg-[#0a0a0a] border rounded-md px-4 py-2.5 pr-10 text-sm text-white focus:outline-none transition ${
                                        errors.confirmPassword
                                            ? "border-red-500"
                                            : "border-[#262626] focus:border-purple-500"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="text-red-400 text-xs mt-1 block">
                                    {errors.confirmPassword}
                                </span>
                            )}
                        </div>

                        {/* Termos */}
                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="termos"
                                checked={aceitouTermos}
                                onChange={(e) => setAceitouTermos(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-[#262626] bg-[#0a0a0a] text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer accent-purple-600"
                            />
                            <label
                                htmlFor="termos"
                                className="text-xs text-neutral-400 leading-relaxed cursor-pointer"
                            >
                                Estou de acordo com os{" "}
                                <a href="#" className="text-purple-400 hover:underline">
                                    Termos de Serviço
                                </a>{" "}
                                e a{" "}
                                <a href="#" className="text-purple-400 hover:underline">
                                    Política de Privacidade
                                </a>{" "}
                                da EliteGames.
                            </label>
                        </div>
                        {errors.termos && (
                            <span className="text-red-400 text-xs block">{errors.termos}</span>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-md transition flex items-center justify-center gap-2 group"
                        >
                            {loading ? "Criando conta..." : "Criar Minha Conta"}
                            {!loading && (
                                <ArrowRight
                                    size={16}
                                    className="group-hover:translate-x-1 transition"
                                />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}