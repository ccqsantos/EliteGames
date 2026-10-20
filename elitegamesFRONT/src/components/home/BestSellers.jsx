import React, { useEffect, useState } from 'react';
import { ShoppingCart, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Importando sua instância do Axios

export default function BestSellers() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);
                // Busca todos os produtos
                const response = await api.get('/products');

                // Ordena pelos mais vendidos (ordersCompleted) e pega os 3 primeiros
                const sorted = response.data
                    .sort((a, b) => (b.ordersCompleted || 0) - (a.ordersCompleted || 0))
                    .slice(0, 3);

                setProducts(sorted);
            } catch (err) {
                console.error("Erro ao buscar os mais vendidos:", err);
                setError("Não foi possível carregar os mais vendidos.");
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    const handleAddToCart = (e, productId) => {
        e.stopPropagation();
        alert(`Produto adicionado ao carrinho! (ID: ${productId})`);
        // Aqui você integraria com o contexto do carrinho
    };

    if (loading) {
        return (
            <div className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#0a0a0a] text-red-500 py-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
                {error}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="bg-[#0a0a0a] text-gray-500 py-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
                Nenhum produto cadastrado ainda.
            </div>
        );
    }

    return (
        <section className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Mais Vendidos da Semana</h2>
                <div className="flex gap-2">
                    <button className="p-2 border border-gray-700 rounded-full hover:bg-gray-800 transition">
                        <ArrowLeft size={18} />
                    </button>
                    <button className="p-2 border border-gray-700 rounded-full hover:bg-gray-800 transition">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-[#141414] border border-gray-800 rounded-xl p-4 group cursor-pointer hover:border-purple-500/50 transition"
                        onClick={() => navigate(`/product/${prod.id}`)}
                    >
                        <div className="bg-[#0a0a0a] rounded-lg mb-4 p-4 flex justify-center h-56 items-center">
                            <img
                                src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://via.placeholder.com/150?text=Sem+Imagem'}
                                alt={prod.title}
                                className="h-full object-contain group-hover:scale-105 transition rounded-xl"
                            />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-medium text-sm mb-1 line-clamp-1">{prod.title}</h3>
                                <p className="text-lg font-bold text-purple-400">{formatPrice(prod.price)}</p>
                            </div>
                            <button
                                onClick={(e) => handleAddToCart(e, prod.id)}
                                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition"
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}