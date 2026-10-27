import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BsCart3,
    BsTrash,
    BsDash,
    BsPlus,
    BsArrowLeft,
    BsShieldCheck,
    BsTruck,
    BsReceipt,
} from 'react-icons/bs';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Isolamento do contrato REST do carrinho — ajuste aqui se o backend mudar
// ---------------------------------------------------------------------------
const cartApi = {
    get: () => api.get('/cart'),
    addItem: (productId, quantity = 1) =>
        api.post('/cart/items', null, { params: { productId, quantity } }),
    updateItem: (productId, quantity) =>
        api.put(`/cart/items/${productId}`, null, { params: { quantity } }),
    removeItem: (productId) => api.delete(`/cart/items/${productId}`),
    clear: () => api.delete('/cart'),
    // Um pedido por produto — o OrderController só aceita ?productId={id}
    createOrder: (productId) => api.post('/orders', null, { params: { productId } }),
};

const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        Number(value ?? 0)
    );

export default function Cart() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // productId -> boolean (item em mutação)
    const [mutating, setMutating] = useState({});
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    // ---------- fetch ----------
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        loadCart(controller.signal);
        return () => controller.abort();
    }, [isAuthenticated]);

    async function loadCart(signal) {
        setLoading(true);
        setError(null);
        try {
            const { data } = await cartApi.get({ signal });
            setCart(normalizeCart(data));
        } catch (err) {
            if (axios.isCancel(err)) return;
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao carregar o carrinho.'
            );
        } finally {
            setLoading(false);
        }
    }

    // Garante o shape mesmo se o backend mandar algo parcial
    function normalizeCart(data) {
        return {
            customerId: data?.customerId ?? user?.id ?? null,
            updatedAt: data?.updatedAt ?? null,
            items: Array.isArray(data?.items) ? data.items : [],
        };
    }

    // ---------- helpers de mutação ----------
    const setItemMutating = (productId, value) =>
        setMutating((prev) => ({ ...prev, [productId]: value }));

    async function handleIncrement(item) {
        setItemMutating(item.productId, true);
        try {
            const { data } = await cartApi.updateItem(
                item.productId,
                item.quantity + 1
            );
            setCart(normalizeCart(data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Não foi possível atualizar a quantidade.'
            );
        } finally {
            setItemMutating(item.productId, false);
        }
    }

    async function handleDecrement(item) {
        if (item.quantity <= 1) return;
        setItemMutating(item.productId, true);
        try {
            const { data } = await cartApi.updateItem(
                item.productId,
                item.quantity - 1
            );
            setCart(normalizeCart(data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Não foi possível atualizar a quantidade.'
            );
        } finally {
            setItemMutating(item.productId, false);
        }
    }

    async function handleRemove(item) {
        setItemMutating(item.productId, true);
        try {
            const { data } = await cartApi.removeItem(item.productId);
            // Se o backend devolve o Cart atualizado, usa; senão remove localmente
            if (data && Array.isArray(data.items)) {
                setCart(normalizeCart(data));
            } else {
                setCart((prev) =>
                    prev
                        ? {
                            ...prev,
                            items: prev.items.filter(
                                (i) => i.productId !== item.productId
                            ),
                        }
                        : prev
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Não foi possível remover o item.'
            );
        } finally {
            setItemMutating(item.productId, false);
        }
    }

    async function handleClear() {
        if (!window.confirm('Deseja esvaziar o carrinho?')) return;
        setLoading(true);
        try {
            const { data } = await cartApi.clear();
            setCart(normalizeCart(data ?? { items: [] }));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Não foi possível limpar o carrinho.'
            );
        } finally {
            setLoading(false);
        }
    }

    // ---------- checkout ----------
    async function handleCheckout() {
        if (!cart?.items?.length) return;
        setCheckoutLoading(true);
        setCheckoutError(null);

        const created = [];
        const failed = [];

        // Um pedido por produto (contrato do OrderController)
        for (const item of cart.items) {
            try {
                await cartApi.createOrder(item.productId);
                created.push(item.productId);
            } catch (err) {
                failed.push({
                    productId: item.productId,
                    message:
                        err.response?.data?.message ||
                        err.response?.data ||
                        'Falha ao criar pedido.',
                });
            }
        }

        // Remove do carrinho somente os pedidos criados com sucesso
        for (const productId of created) {
            try {
                await cartApi.removeItem(productId);
            } catch {
                /* silencioso: o pedido já foi criado, o item pode ficar */
            }
        }

        try {
            const { data } = await cartApi.get();
            setCart(normalizeCart(data));
        } catch {
            /* mantém estado atual */
        }

        setCheckoutLoading(false);

        if (failed.length === 0) {
            navigate('/orders/my');
        } else {
            setCheckoutError(
                `${failed.length} item(ns) não puderam ser processados. ` +
                failed.map((f) => `#${f.productId}: ${f.message}`).join(' | ')
            );
        }
    }

    // ---------- derivados ----------
    const subtotal = useMemo(
        () =>
            (cart?.items ?? []).reduce(
                (acc, i) =>
                    acc +
                    Number(i.unitPriceSnapshot ?? 0) * Number(i.quantity ?? 0),
                0
            ),
        [cart]
    );

    const itemCount = useMemo(
        () =>
            (cart?.items ?? []).reduce(
                (acc, i) => acc + Number(i.quantity ?? 0),
                0
            ),
        [cart]
    );

    // ---------- estados de tela ----------
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center gap-4 px-4">
                <BsCart3 size={56} className="text-gray-600" />
                <h2 className="text-2xl font-bold">Faça login para ver seu carrinho</h2>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    Fazer Login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center gap-4 px-4">
                <h2 className="text-2xl font-bold text-red-400">
                    Não foi possível carregar o carrinho
                </h2>
                <p className="text-gray-400 text-sm">{String(error)}</p>
                <Link
                    to="/shop"
                    className="text-purple-400 hover:underline flex items-center gap-2"
                >
                    <BsArrowLeft /> Voltar para a loja
                </Link>
            </div>
        );
    }

    const isEmpty = !cart?.items?.length;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm"
                >
                    <BsArrowLeft /> Voltar
                </button>

                <div className="flex items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Meu <span className="text-purple-500">Carrinho</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {itemCount === 0
                                ? 'Nenhum item'
                                : `${itemCount} item(ns) no carrinho`}
                        </p>
                    </div>

                    {!isEmpty && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition"
                        >
                            <BsTrash /> Esvaziar
                        </button>
                    )}
                </div>

                {isEmpty ? (
                    <div className="bg-[#141414] border border-gray-800 rounded-2xl p-12 text-center">
                        <BsCart3 size={56} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-400 mb-6">
                            Seu carrinho está vazio.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
                        >
                            <BsArrowLeft /> Explorar produtos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => {
                                const isMutating = !!mutating[item.productId];
                                const lineTotal =
                                    Number(item.unitPriceSnapshot ?? 0) *
                                    Number(item.quantity ?? 0);

                                return (
                                    <div
                                        key={item.productId}
                                        className={`bg-[#141414] border border-gray-800 rounded-xl p-4 flex gap-4 ${
                                            isMutating ? 'opacity-60' : ''
                                        }`}
                                    >
                                        <Link
                                            to={`/product/${item.productId}`}
                                            className="w-24 h-24 flex-shrink-0 bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center"
                                        >
                                            {item.imageUrlSnapshot ? (
                                                <img
                                                    src={item.imageUrlSnapshot}
                                                    alt={item.productNameSnapshot}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-600">
                                                    Sem imagem
                                                </span>
                                            )}
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/product/${item.productId}`}
                                                className="font-semibold line-clamp-2 hover:text-purple-400 transition"
                                            >
                                                {item.productNameSnapshot}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Preço unitário:{' '}
                                                {formatPrice(item.unitPriceSnapshot)}
                                            </p>

                                            <div className="flex items-center justify-between mt-3 gap-3">
                                                {/* Quantidade */}
                                                <div className="flex items-center bg-[#0a0a0a] border border-gray-700 rounded-md h-9">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDecrement(item)
                                                        }
                                                        disabled={
                                                            isMutating ||
                                                            item.quantity <= 1
                                                        }
                                                        className="px-3 h-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                        aria-label="Diminuir"
                                                    >
                                                        <BsDash />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-semibold">
                                                        {isMutating ? (
                                                            <Loader2
                                                                size={14}
                                                                className="animate-spin mx-auto text-purple-400"
                                                            />
                                                        ) : (
                                                            item.quantity
                                                        )}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleIncrement(item)
                                                        }
                                                        disabled={isMutating}
                                                        className="px-3 h-full text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                                                        aria-label="Aumentar"
                                                    >
                                                        <BsPlus />
                                                    </button>
                                                </div>

                                                {/* Total da linha */}
                                                <p className="text-lg font-bold text-purple-400">
                                                    {formatPrice(lineTotal)}
                                                </p>

                                                {/* Remover */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemove(item)
                                                    }
                                                    disabled={isMutating}
                                                    className="text-gray-500 hover:text-red-400 disabled:opacity-40 transition"
                                                    aria-label="Remover item"
                                                >
                                                    <BsTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Resumo */}
                        <aside className="lg:col-span-1">
                            <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 sticky top-6 space-y-4">
                                <h2 className="text-lg font-bold">Resumo</h2>

                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal ({itemCount} item(ns))</span>
                                    <span className="text-white font-semibold">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm text-gray-400">
                                    <span className="flex items-center gap-1.5">
                                        <BsTruck className="text-purple-500" />
                                        Frete
                                    </span>
                                    <span className="text-green-400 font-semibold">
                                        Grátis
                                    </span>
                                </div>

                                <div className="flex justify-between text-base pt-4 border-t border-gray-800">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold text-purple-400">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>

                                {checkoutError && (
                                    <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-md p-2">
                                        {checkoutError}
                                    </p>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || itemCount === 0}
                                    className="w-full h-12 rounded-md font-bold flex items-center justify-center gap-2 transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white"
                                >
                                    {checkoutLoading ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Processando…
                                        </>
                                    ) : (
                                        <>
                                            <BsReceipt /> Finalizar compra
                                        </>
                                    )}
                                </button>

                                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <BsShieldCheck className="text-purple-500" />
                                    Compra protegida. Pagamento seguro.
                                </p>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}