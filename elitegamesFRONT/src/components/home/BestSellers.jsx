import React from 'react';
import { ShoppingCart } from 'lucide-react';

const bestSellers = [
    { id: 1, name: 'RTX 4090 Suprim Liquid', price: 'R$ 12.499,00', img: '/api/placeholder/300/200' },
    { id: 2, name: 'Teclado Mecânico Pro', price: 'R$ 899,00', img: '/api/placeholder/300/200' },
    { id: 3, name: 'Cooler Fan RGB 120mm', price: 'R$ 149,00', img: '/api/placeholder/300/200' },
];

export default function BestSellers() {
    return (
        <section className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Mais Vendidos da Semana</h2>
                <div className="flex gap-2">
                    <button className="p-2 border border-gray-700 rounded-full hover:bg-gray-800"><span>←</span></button>
                    <button className="p-2 border border-gray-700 rounded-full hover:bg-gray-800"><span>→</span></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bestSellers.map((prod) => (
                    <div key={prod.id} className="bg-[#141414] border border-gray-800 rounded-xl p-4 group cursor-pointer hover:border-purple-500/50 transition">
                        <div className="bg-[#0a0a0a] rounded-lg mb-4 p-4 flex justify-center">
                            <img src={prod.img} alt={prod.name} className="h-40 object-contain group-hover:scale-105 transition" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-medium text-sm mb-1">{prod.name}</h3>
                                <p className="text-lg font-bold text-purple-400">{prod.price}</p>
                            </div>
                            <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition">
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}