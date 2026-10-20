import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ShoppingCart,
    ArrowLeft,
    Star,
    ShieldCheck,
    Truck,
    Loader2,
    Store,
    Tag,
    CalendarDays,
    CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${id}`);
                setProduct(response.data);

                if (response.data.images && response.data.images.length > 0) {
                    setActiveImage(response.data.images[0]);
                }
            } catch (err) {
                console.error(err);
                setError("Produto não encontrado ou indisponível.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleBuy = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        alert(`Você comprou ${quantity}x ${product.title} por ${formatPrice(product.price * quantity)}!`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center text-white gap-4">
                <h2 className="text-2xl font-bold">{error || "Produto não encontrado"}</h2>
                <Link to="/shop" className="text-purple-400 hover:underline flex items-center gap-2">
                    <ArrowLeft size={30} /> Voltar para a loja
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;
    // Como o JSON mostra que o seller é um objeto, extraímos o nome da loja de dentro dele
    const storeName = product.seller?.storeName || "Loja Desconhecida";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm"
                >
                    <ArrowLeft size={30} /> Voltar
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* COLUNA ESQUERDA: Imagens */}
                    <div className="space-y-4">
                        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-8 flex justify-center items-center h-[400px] md:h-[500px]">
                            <img
                                src={activeImage || 'https://placehold.co/600x600/141414/FFFFFF?text=Sem+Imagem'}
                                alt={product.title}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => { e.target.src = 'https://placehold.co/600x600/141414/FFFFFF?text=Erro+na+Imagem'; }}
                            />
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(img)}
                                        className={`bg-[#141414] border rounded-lg p-2 h-20 w-20 flex-shrink-0 transition ${activeImage === img ? 'border-purple-500' : 'border-gray-800 hover:border-gray-600'}`}
                                    >
                                        <img src={img} alt={`Thumb ${index}`} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA: Informações */}
                    <div className="flex flex-col">

                        {/* Header: Loja, Categoria, Título */}
                        <div className="mb-6">
                            <div className="flex items-center flex-wrap gap-3 text-sm mb-3">
                                <span className="flex items-center gap-1.5 text-purple-400 font-medium bg-purple-500/10 px-2.5 py-1 rounded-full">
                                    <Store size={30} />
                                    {storeName}
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-400 bg-gray-800/50 px-2.5 py-1 rounded-full capitalize">
                                    <Tag size={30} />
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{product.title}</h1>

                            {/* Avaliações */}
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={30}
                                            fill={i < Math.round(product.averageRating || 0) ? "currentColor" : "none"}
                                            className={i < Math.round(product.averageRating || 0) ? "text-yellow-500" : "text-gray-600"}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold text-white">{product.averageRating?.toFixed(1) || '0.0'}</span>
                                <span className="text-gray-500">|</span>
                                <span>{product.ordersCompleted || 0} vendidos</span>
                            </div>
                        </div>

                        {/* Preço */}
                        <div className="mb-8 bg-[#141414] p-6 rounded-xl border border-gray-800/50">
                            <p className="text-4xl font-bold text-purple-500">{formatPrice(product.price)}</p>
                            <p className="text-sm text-gray-400 mt-2">
                                em até 12x de <strong className="text-gray-300">{formatPrice(product.price / 12)}</strong> sem juros
                            </p>
                        </div>

                        {/* Descrição */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <CheckCircle2 size={30} className="text-purple-500" />
                                Sobre o produto
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                {product.description || "Nenhuma descrição fornecida para este produto."}
                            </p>

                            {/* Data de Cadastro */}
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                                <CalendarDays size={30} />
                                Anunciado em {formatDate(product.createdAt)}
                            </div>
                        </div>

                        {/* Área de Compra */}
                        <div className="bg-[#141414] border border-gray-800 rounded-xl p-6 mt-auto">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-400">
                                    Estoque: <strong className={isOutOfStock ? 'text-red-500' : 'text-green-500'}>
                                        {isOutOfStock ? 'Esgotado' : `Disponível`}
                                    </strong>
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Seletor de Quantidade */}
                                <div className="flex items-center bg-[#0a0a0a] border border-gray-700 rounded-md h-12">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-4 h-full text-gray-400 hover:text-white transition"
                                        disabled={isOutOfStock || quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        readOnly
                                        className="w-12 text-center bg-transparent text-white outline-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="px-4 h-full text-gray-400 hover:text-white transition"
                                        disabled={isOutOfStock || quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Botão de Comprar */}
                                <button
                                    onClick={handleBuy}
                                    disabled={isOutOfStock}
                                    className={`flex-1 h-12 rounded-md font-bold flex items-center justify-center gap-2 transition ${
                                        isOutOfStock
                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20'
                                    }`}
                                >
                                    <ShoppingCart size={30} />
                                    {isOutOfStock ? 'Produto Esgotado' : 'Adicionar e Comprar'}
                                </button>
                            </div>

                            {/* Benefícios */}
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-800">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Truck size={30} className="text-purple-500" />
                                    Frete Grátis
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <ShieldCheck size={30} className="text-purple-500" />
                                    Garantia de 1 ano
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}