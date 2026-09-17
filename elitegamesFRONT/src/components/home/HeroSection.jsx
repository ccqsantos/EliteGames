import React from 'react';

export default function HeroSection() {
    return (
        <section className="bg-[#0a0a0a] text-white py-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                    Soberania <span className="text-purple-500">Gráfica</span><br />
                    Sem Limites.
                </h1>
                <p className="text-gray-400 text-lg max-w-md">
                    Experimente o poder sem compromisso. Alugue GPUs de alto desempenho para IA, renderização e jogos com entrega rápida.
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
            </div>

            <div className="flex-1 flex justify-center">
                <img
                    src="../../assets/pc-placeholder.png"
                    alt="PC Gamer"
                    className="rounded-xl object-cover w-full max-w-lg shadow-2xl shadow-purple-900/20"
                />
            </div>
        </section>
    );
}