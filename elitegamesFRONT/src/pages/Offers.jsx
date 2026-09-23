import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export default function Offers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sort, setSort] = useState('recent');

    useEffect(() => {
        const controller = new AbortController();

        async function fetchOffers() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_URL}/api/public/offers?sort=${sort}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) {
                    throw new Error(`Request failed (${res.status})`);
                }
                const data = await res.json();
                setOffers(Array.isArray(data) ? data : data.content ?? []);
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchOffers();
        return () => controller.abort();
    }, [sort]);

    return (
        <section className="bg-[#0a0a0a] text-white py-16 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Ofertas <span className="text-purple-500">Ativas</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        GPUs de alto desempenho disponíveis para aluguel. Preços atualizados em tempo real.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <label htmlFor="sort" className="text-sm text-gray-500">
                        Ordenar
                    </label>
                    <select
                        id="sort"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-[#111] border border-gray-700 hover:border-gray-500 text-white px-4 py-2 rounded-md font-semibold transition focus:outline-none focus:border-purple-500"
                    >
                        <option value="recent">Mais recentes</option>
                        <option value="price_asc">Menor preço</option>
                        <option value="price_desc">Maior preço</option>
                        <option value="performance">Performance</option>
                    </select>
                </div>
            </div>

            {/* States */}
            {loading && <OffersSkeleton />}

            {error && !loading && (
                <div className="border border-red-900/40 bg-red-950/20 rounded-xl p-8 text-center">
                    <p className="text-red-400 font-semibold mb-2">Não foi possível carregar as ofertas</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && offers.length === 0 && (
                <div className="border border-gray-800 bg-[#111] rounded-xl p-12 text-center">
                    <p className="text-gray-400">Nenhuma oferta disponível no momento.</p>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && offers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} />
                    ))}
                </div>
            )}
        </section>
    );
}

function OfferCard({ offer }) {
    const {
        id,
        name,
        gpuModel,
        vramGb,
        pricePerHour,
        currency = 'BRL',
        imageUrl,
        available = true,
        tag,
    } = offer;

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(pricePerHour ?? 0);

    return (
        <article className="group bg-[#111] border border-gray-800 hover:border-purple-700/60 rounded-xl overflow-hidden transition flex flex-col">
            <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-sm">
                        Sem imagem
                    </div>
                )}

                {tag && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-md">
                        {tag}
                    </span>
                )}

                {!available && (
                    <span className="absolute top-3 right-3 bg-gray-900/90 border border-gray-700 text-gray-400 text-xs font-semibold px-3 py-1 rounded-md">
                        Indisponível
                    </span>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 space-y-4">
                <div>
                    <h2 className="text-xl font-bold leading-tight">{name}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {gpuModel}
                        {vramGb ? ` • ${vramGb} GB VRAM` : ''}
                    </p>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-gray-800">
                    <div>
                        <p className="text-2xl font-bold text-purple-400">{formattedPrice}</p>
                        <p className="text-xs text-gray-500">por hora</p>
                    </div>

                    <button
                        disabled={!available}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-5 py-2 rounded-md font-semibold transition"
                    >
                        Alugar
                    </button>
                </div>
            </div>
        </article>
    );
}

function OffersSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-900" />
                    <div className="p-6 space-y-4">
                        <div className="h-5 bg-gray-900 rounded w-3/4" />
                        <div className="h-4 bg-gray-900 rounded w-1/2" />
                        <div className="flex items-end justify-between pt-4 border-t border-gray-800">
                            <div className="h-7 bg-gray-900 rounded w-24" />
                            <div className="h-9 bg-gray-900 rounded w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}