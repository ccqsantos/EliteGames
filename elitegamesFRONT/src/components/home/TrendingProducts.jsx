import React, { useEffect, useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // Importando sua instância do Axios

export default function TrendingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Função para buscar os produtos da API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                // Puxa os produtos. Se o backend tiver paginação, ex: /products?page=0&size=4
                // Como você quer "Mais Procurados", talvez o backend ordene por orders_completed
                const response = await api.get('/products');

                // Pega apenas os 4 primeiros para manter o layout (ou você pode pedir isso direto no backend)
                setProducts(response.data.slice(0, 4));
            } catch (err) {
                console.error("Erro ao buscar produtos:", err);
                setError("Não foi possível carregar os produtos no momento.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Formatar preço para Real
    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    // Lógica do botão Adicionar (pode ser expandida para adicionar ao carrinho)
    const handleAddToCart = (e, productId) => {
        e.stopPropagation(); // Evita que o clique no botão abra a página do produto
        // Aqui você pode implementar a lógica do carrinho (Context, Redux, ou localStorage)
        // Exemplo: navigate(`/product/${productId}`) para ver detalhes
        alert(`Produto adicionado ao carrinho! (ID: ${productId})`);
    };

    // Se estiver carregando, mostra um spinner
    if (loading) {
        return (
            <div className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    // Se der erro, mostra uma mensagem
    if (error) {
        return (
            <div className="bg-[#0a0a0a] text-red-500 py-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
                {error}
            </div>
        );
    }

    // Se não houver produtos no banco
    if (products.length === 0) {
        return (
            <div className="bg-[#0a0a0a] text-gray-500 py-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
                Nenhum produto cadastrado ainda.
            </div>
        );
    }

    return (
        <section className="bg-[#0a0a0a] text-white py-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold">Mais Procurados da Elite</h2>
                <div className="flex gap-4 text-sm overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <button className="text-purple-500 font-semibold border-b-2 border-purple-500 pb-1 whitespace-nowrap">TODOS</button>
                    <button className="text-gray-500 hover:text-white pb-1 whitespace-nowrap">GPU</button>
                    <button className="text-gray-500 hover:text-white pb-1 whitespace-nowrap">MONITORES</button>
                    <button className="text-gray-500 hover:text-white pb-1 whitespace-nowrap">PERIFÉRICOS</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((prod) => (
                    <div
                        key={prod.id}
                        className="bg-[#141414] border border-gray-800 rounded-xl p-4 flex flex-col group cursor-pointer hover:border-purple-500/50 transition"
                        onClick={() => navigate(`/product/${prod.id}`)} // Opcional: ir para detalhes
                    >
                        <div className="bg-[#0a0a0a] rounded-lg mb-4 flex justify-center p-4 h-48 items-center">
                            {/* Pega a primeira imagem da lista, ou usa um placeholder */}
                            <img
                                src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://via.placeholder.com/150?text=Sem+Imagem'}
                                alt={prod.title}
                                className="h-full object-contain group-hover:scale-105 transition rounded-xl"
                            />
                        </div>

                        <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
                            {prod.title}
                        </h3>

                        <div className="mt-auto">
                            {/* Simulando um preço antigo (você pode calcular ou adicionar no backend depois) */}
                            <p className="text-xs text-gray-500 line-through">
                                {formatPrice(prod.price * 1.15)}
                            </p>
                            <p className="text-lg font-bold text-purple-400">
                                {formatPrice(prod.price)}
                            </p>

                            <button
                                onClick={(e) => handleAddToCart(e, prod.id)}
                                className="w-full mt-3 bg-gray-800 hover:bg-purple-600 text-white py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={30} /> Adicionar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}