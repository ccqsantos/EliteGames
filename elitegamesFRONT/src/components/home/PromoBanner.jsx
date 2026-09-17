import React from 'react';

export default function PromoBanner() {
    return (
        <section className="bg-[#0a0a0a] py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#1a0b2e] to-[#0a0a0a] border border-purple-900/50 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Elementos decorativos de fundo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>

                <div className="flex-1 z-10">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Oferta Limitada</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                        Economize até 30% em setups de Elite
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-md">
                        Monte sua máquina dos sonhos com nossos kits pré-configurados e leve o melhor desempenho para casa.
                    </p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold transition">
                        Aproveitar Oferta
                    </button>
                </div>

                <div className="flex-1 z-10">
                    {/* Substitua pela imagem do teclado/setup */}
                    <img src="/api/placeholder/500/300" alt="Setup Gamer" className="rounded-xl w-full object-cover shadow-2xl shadow-purple-900/30" />
                </div>
            </div>
        </section>
    );
}