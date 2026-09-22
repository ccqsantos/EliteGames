import React from 'react';
import { ShoppingCart } from 'lucide-react';

const products = [
    { id: 1, name: 'Monitor Gamer 27" 165Hz', price: 'R$ 1.499,00', oldPrice: 'R$ 1.899,00', img: '/api/placeholder/200/200' },
    { id: 2, name: 'GeForce RTX 4070 Super', price: 'R$ 3.899,00', oldPrice: 'R$ 4.500,00', img: '/api/placeholder/200/200' },
    { id: 3, name: 'Teclado Mecânico HyperX', price: 'R$ 349,00', oldPrice: 'R$ 499,00', img: '/api/placeholder/200/200' },
    { id: 4, name: 'Headset Astro A50', price: 'R$ 1.299,00', oldPrice: 'R$ 1.599,00', img: '/api/placeholder/200/200' },
];

export default function TrendingProducts() {
    return (
        <section className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Mais Procurados da Lab</h2>
                <div className="flex gap-4 text-sm">
                    <button className="text-purple-500 font-semibold border-b-2 border-purple-500 pb-1">TODOS</button>
                    <button className="text-gray-500 hover:text-white pb-1">GPU</button>
                    <button className="text-gray-500 hover:text-white pb-1">MONITORES</button>
                    <button className="text-gray-500 hover:text-white pb-1">PERIFÉRICOS</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((prod) => (
                    <div key={prod.id} className="bg-[#141414] border border-gray-800 rounded-xl p-4 flex flex-col group cursor-pointer hover:border-purple-500/50 transition">
                        <div className="bg-[#0a0a0a] rounded-lg mb-4 flex justify-center p-4">
                            <img src={prod.img} alt={prod.name} className="h-40 object-contain group-hover:scale-105 transition" />
                        </div>
                        <h3 className="font-medium text-sm mb-2">{prod.name}</h3>
                        <div className="mt-auto">
                            <p className="text-xs text-gray-500 line-through">{prod.oldPrice}</p>
                            <p className="text-lg font-bold text-purple-400">{prod.price}</p>
                            <button className="w-full mt-3 bg-gray-800 hover:bg-purple-600 text-white py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2">
                                <ShoppingCart size={16} /> Adicionar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}