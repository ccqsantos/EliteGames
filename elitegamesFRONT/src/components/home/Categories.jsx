import React from 'react';
import { Monitor, Cpu, Keyboard, Headphones, Mouse, Gamepad2 } from 'lucide-react';

const categories = [
    { icon: <Monitor size={24} />, name: 'Placas de Vídeo' },
    { icon: <Cpu size={24} />, name: 'Processadores' },
    { icon: <Keyboard size={24} />, name: 'Periféricos' },
    { icon: <Headphones size={24} />, name: 'Notebooks' },
    { icon: <Mouse size={24} />, name: 'Hardware/PC' },
    { icon: <Gamepad2 size={24} />, name: 'Audio Gear' },
];

export default function Categories() {
    return (
        <section className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Categorias em Destaque</h2>
                <a href="#" className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center gap-1">
                    VER TUDO <span>→</span>
                </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat, index) => (
                    <div key={index} className="bg-[#141414] border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition group">
                        <div className="text-purple-500 group-hover:scale-110 transition">{cat.icon}</div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">{cat.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}