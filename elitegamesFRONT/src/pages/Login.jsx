import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { FaGoogle, FaApple } from "react-icons/fa";
import logo from "../assets/elitegames_logo1_outline.png";

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();

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
    }, [isAuthenticated, authLoading, navigate]);

    // =========================================================
    // INPUT
    // =========================================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        if (errors.api) {
            setErrors((prev) => ({ ...prev, api: "" }));
        }
    };

    // =========================================================
    // VALIDAÇÃO
    // =========================================================
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

    // =========================================================
    // LOGIN
    // =========================================================
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
                setErrors({ api: result.error });
                return;
            }

            navigate("/", { replace: true });
        } catch (error) {
            console.error("Erro inesperado no login:", error);
            setErrors({
                api: "Erro ao realizar login. Tente novamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex text-white">

            {/* LADO ESQUERDO - Banner Visual (Esconde no mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f0f0f] flex-col justify-center px-16 overflow-hidden border-r border-gray-800">
                {/* Efeito de brilho no fundo */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>

                <div className="relative z-10">
                    <img
                        src={logo}
                        className="w-24 h-24 mb-8 flex justify-self-center"
                        alt="EliteGames Logo"
                    />
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Bem-vindo de volta à <span className="text-purple-500">Elite</span>.
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-md">
                        Entre na sua conta e continue dominando com as melhores peças de hardware do mercado.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Acompanhe seus pedidos em tempo real",
                            "Acesse ofertas exclusivas para membros",
                            "Gerencie sua loja e produtos (Vendedores)",
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
                        <h2 className="text-3xl font-bold text-white mb-2">Entrar na Elite</h2>
                        <p className="text-gray-400">Digite suas credenciais para acessar.</p>
                    </div>

                    {errors.api && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                            {errors.api}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* E-mail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                disabled={loading}
                                autoComplete="email"
                                className={`w-full bg-[#141414] border rounded-lg px-4 py-3 text-white outline-none transition focus:border-purple-500 ${
                                    errors.email ? 'border-red-500' : 'border-gray-800'
                                }`}
                            />
                            {errors.email && <span className="text-red-400 text-xs mt-1">{errors.email}</span>}
                        </div>

                        {/* Senha */}
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
                                    autoComplete="current-password"
                                    className={`w-full bg-[#141414] border rounded-lg px-4 py-3 pr-12 text-white outline-none transition focus:border-purple-500 ${
                                        errors.password ? 'border-red-500' : 'border-gray-800'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                    tabIndex="-1"
                                    disabled={loading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-400 text-xs mt-1">{errors.password}</span>}
                        </div>

                        {/* Opções */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-4 h-4 rounded border-gray-800 bg-[#141414] text-purple-600 focus:ring-purple-500 focus:ring-offset-0 accent-purple-600 cursor-pointer"
                                />
                                <span>Lembrar de mim</span>
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-purple-400 hover:text-purple-300 transition"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>

                        {/* Botão de Envio */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" /> Entrando...
                                </>
                            ) : (
                                <>
                                    Entrar na Elite <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Social */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#0a0a0a] text-gray-500">ou entre com</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-[#141414] border border-gray-800 hover:border-gray-600 text-white py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                <FaGoogle size={18} /> Google
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-[#141414] border border-gray-800 hover:border-gray-600 text-white py-2.5 rounded-lg transition disabled:opacity-50"
                            >
                                <FaApple size={20} /> Apple
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Não tem uma conta?{" "}
                        <Link to="/join" className="text-purple-400 hover:text-purple-300 font-semibold transition">
                            Cadastre-se grátis
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;