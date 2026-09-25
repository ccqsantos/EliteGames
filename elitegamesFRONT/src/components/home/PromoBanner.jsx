import React from 'react';

export default function PromoBanner() {
  return (
    <section className="bg-[#0a0a0a] py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* 2. Mudamos o container para relative e adicionamos border */}
      <div className="relative border border-purple-900/30 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 overflow-hidden">
        
        {/* 3. Imagem de Fundo com overlay escuro para não atrapalhar a leitura do texto */}
        <div className="absolute inset-0 z-0">
          <img 
            src="src/assets/deals-banner-section.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
          {/* Overlay escuro/roxo (ajuste a opacidade em bg-black/70 se precisar de mais ou menos brilho) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-purple-950/40 mix-blend-multiply"></div>
        </div>

        {/* Conteúdo de Texto (Garante z-10 para ficar acima do fundo) */}
        <div className="flex-1 z-10">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
            Oferta Limitada
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 leading-tight">
            Economize até 30% em setups de Elite
          </h2>
          <p className="text-gray-400 mb-6 max-w-md text-sm md:text-base">
            Monte sua máquina dos sonhos com nossos kits pré-configurados e leve o melhor desempenho para casa.
          </p>
          
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-purple-600/20">
            Aproveitar Oferta
          </button>
        </div>

        {/* Imagem do Produto (Garante z-10) */}
        <div className="flex-1 z-10 w-full md:flex md:justify-end">
          <img 
            src="src/assets/banner-render (1).png"
            alt="Setup Gamer de Elite" 
            className="rounded-xl w-90 h-full object-cover shadow-2xl shadow-purple-900/40 transform hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
        
      </div>
    </section>
  );
}