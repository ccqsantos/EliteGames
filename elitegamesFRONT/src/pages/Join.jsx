import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function Join() {
    const [formData, setFormData] = useState({
        nome: '',
        sobrenome: '',
        email: '',
        telefone: '',
        senha: '',
        confirmarSenha: '',
    });

    const [aceitouTermos, setAceitouTermos] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!aceitouTermos) {
            alert('Você precisa aceitar os Termos de Serviço.');
            return;
        }
        console.log('Dados do cadastro:', formData);
        // Aqui você faria a chamada para sua API
    };

    return (
        <section className="bg-[#0a0a0a] text-white py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Coluna Esquerda - Informações */}
                <div className="flex-1 space-y-6 lg:sticky lg:top-8">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                        Crie sua <span className="text-purple-500">Conta</span><br />
                        e Comece Agora.
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        Cadastre-se na Nova Labs e tenha acesso a GPUs de alto desempenho para IA, renderização e jogos com entrega rápida.
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

                    <div className="flex gap-4">
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-md font-semibold transition">
                            Alugar Agora
                        </button>
                        <button className="border border-gray-700 hover:border-gray-500 text-white px-8 py-3 rounded-md font-semibold transition">
                            Ver Planos
                        </button>
                    </div>

                    <div className="pt-6 border-t border-gray-800">
                        <p className="text-sm text-gray-400">
                            Já possui uma conta?{' '}
                            <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline">
                                Fazer login
                            </a>
                        </p>
                    </div>
                </div>

                {/* Coluna Direita - Formulário */}
                <div className="flex-1 w-full max-w-lg bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-8 md:p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nome e Sobrenome lado a lado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Digite seu nome"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Sobrenome
                                </label>
                                <input
                                    type="text"
                                    name="sobrenome"
                                    value={formData.sobrenome}
                                    onChange={handleChange}
                                    placeholder="Digite seu sobrenome"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>
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
                                    placeholder="Ex: seuemail@novalabs.com"
                                    required
                                    className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition"
                                />
                            </div>
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                required
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                placeholder="Crie uma senha forte"
                                required
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>

                        {/* Confirmação de Senha */}
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">
                                Confirmação de Senha
                            </label>
                            <input
                                type="password"
                                name="confirmarSenha"
                                value={formData.confirmarSenha}
                                onChange={handleChange}
                                placeholder="Confirme a senha"
                                required
                                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition"
                            />
                        </div>

                        {/* Checkbox de Termos */}
                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="termos"
                                checked={aceitouTermos}
                                onChange={(e) => setAceitouTermos(e.target.checked)}
                                required
                                className="mt-1 w-4 h-4 rounded border-[#262626] bg-[#0a0a0a] text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer accent-purple-600"
                            />
                            <label htmlFor="termos" className="text-xs text-neutral-400 leading-relaxed cursor-pointer">
                                Estou de acordo com os{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">
                                    Termos de Serviço
                                </a>{' '}
                                e a{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300 hover:underline">
                                    Política de Privacidade
                                </a>{' '}
                                da Nova Labs.
                            </label>
                        </div>

                        {/* Botão de Envio */}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-md transition flex items-center justify-center gap-2 group"
                        >
                            Criar Minha Conta
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition"
                            />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}