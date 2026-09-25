import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function GuaranteeSection() {
    return (
        <section className="w-full bg-[#0a0a0a] py-16 px-4 md:px-8 flexmax-w-7xl mx-auto flex justify-center">
            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 md:p-16 text-center max-w-3xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center justify-center ">
                    <ShieldCheck size={48} className="text-purple-500 mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Garanta acesso antecipado ao estoque de hardware
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-lg">
                        Assine nossa newsletter e receba alertas de reposição de estoque, descontos exclusivos e lançamentos antes de todo mundo.
                    </p>

                    <div className="flex flex-col sm:flex-row w-full max-w-md gap-3">
                        <input
                            type="email"
                            placeholder="Seu melhor e-mail"
                            className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                        />
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-semibold transition whitespace-nowrap">
                            Inscrever-se
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}