import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShoppingBag,
    Store,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react";

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

    // Estados para mostrar/ocultar as senhas
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Se já estiver logado, não precisa acessar a página de cadastro
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate("/");
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Remove o erro daquele campo ao começar a digitar
        setErrors((prev) => ({ ...prev, [name]: "", api: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

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
                    api: typeof result.error === "string" ? result.error : "Não foi possível criar a conta.",
                });
                return;
            }

            navigate("/", { replace: true });
        } catch (error) {
            console.error("Erro ao criar conta:", error);
            setErrors({ api: "Ocorreu um erro ao criar sua conta." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex text-white">

            {/* LADO ESQUERDO - Banner Visual (Esconde no mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f0f0f] flex-col justify-center px-16 overflow-hidden border-r border-gray-800">
                {/* Efeito de brilho no fundo */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Domine o jogo com a <span className="text-purple-500">EliteGames</span>.
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-md">
                        Crie sua conta e tenha acesso às melhores peças de hardware, GPUs de alta performance e periféricos de elite.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Frete grátis em compras acima de R$ 500",
                            "Garantia estendida de 1 ano",
                            "Acesso antecipado a lançamentos e ofertas",
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-300">
                                <CheckCircle2 size={20} className="text-purple-500 flex-shrink-0" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LADO DIREITO - Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Criar Conta</h2>
                        <p className="text-gray-400">Junte-se à elite e comece a comprar ou vender.</p>
                    </div>

                    {errors.api && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                            {errors.api}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nome completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Digite seu nome"
                                    disabled={loading}
                                    className={`w-full bg-[#141414] border rounded-lg pl-10 py-3 text-white outline-none transition focus:border-purple-500 ${errors.name ? 'border-red-500' : 'border-gray-800'}`}
                                />
                            </div>
                            {errors.name && <span className="text-red-400 text-xs mt-1">{errors.name}</span>}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
                            <div className="relative">
                                <Mail size={30} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-0" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                    className={`relative z-10 w-full bg-[#141414] border rounded-lg pl-10 pr-4 py-3 text-white outline-none transition focus:border-purple-500 ${errors.email ? 'border-red-500' : 'border-gray-800'}`}
                                />
                            </div>
                            {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email}</span>}
                        </div>

                        {/* Senhas lado a lado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Senha</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        disabled={loading}
                                        className={`w-full bg-[#141414] border rounded-lg pl-10 pr-10 py-3 text-white outline-none transition focus:border-purple-500 ${errors.password ? 'border-red-500' : 'border-gray-800'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={30} /> : <Eye size={30} />}
                                    </button>
                                </div>
                                {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        disabled={loading}
                                        className={`w-full bg-[#141414] border rounded-lg pl-10 py-3 text-white outline-none transition focus:border-purple-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-800'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={30} /> : <Eye size={30} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="text-red-400 text-xs mt-1">{errors.confirmPassword}</span>}
                            </div>
                        </div>

                        {/* Tipo de Conta (Cards) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de conta</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: "CUSTOMER" }))}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition ${
                                        formData.role === "CUSTOMER"
                                            ? "bg-purple-600/10 border-purple-500 text-white"
                                            : "bg-[#141414] border-gray-800 text-gray-400 hover:border-gray-600"
                                    }`}
                                >
                                    <ShoppingBag size={24} className={`mb-2 ${formData.role === "CUSTOMER" ? "text-purple-500" : "text-gray-500"}`} />
                                    <span className="font-semibold text-sm">Cliente</span>
                                    <span className="text-[10px] text-center mt-1 opacity-70">Quero comprar peças</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: "SELLER" }))}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition ${
                                        formData.role === "SELLER"
                                            ? "bg-purple-600/10 border-purple-500 text-white"
                                            : "bg-[#141414] border-gray-800 text-gray-400 hover:border-gray-600"
                                    }`}
                                >
                                    <Store size={24} className={`mb-2 ${formData.role === "SELLER" ? "text-purple-500" : "text-gray-500"}`} />
                                    <span className="font-semibold text-sm">Vendedor</span>
                                    <span className="text-[10px] text-center mt-1 opacity-70">Quero vender peças</span>
                                </button>
                            </div>
                            {errors.role && <span className="text-red-400 text-xs mt-1">{errors.role}</span>}
                        </div>

                        {/* Botão de Envio */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> Criando conta...
                                </>
                            ) : (
                                <>
                                    Criar Conta <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Já possui uma conta?{" "}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                            Faça login
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Join;