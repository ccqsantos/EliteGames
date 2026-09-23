import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

const SORT_OPTIONS = [
    { value: 'recent', label: 'Mais recentes' },
    { value: 'price_asc', label: 'Menor preço' },
    { value: 'price_desc', label: 'Maior preço' },
    { value: 'name_asc', label: 'Nome (A–Z)' },
];

const PAGE_SIZE = 12;

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, category, sort]);

    // Fetch categories once
    useEffect(() => {
        const controller = new AbortController();
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/categories`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) throw new Error(`Categories failed (${res.status})`);
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : data.content ?? []);
            } catch (err) {
                if (err.name !== 'AbortError') setCategories([]);
            }
        })();
        return () => controller.abort();
    }, []);

    // Fetch products
    useEffect(() => {
        const controller = new AbortController();

        async function fetchProducts() {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    page: String(page),
                    size: String(PAGE_SIZE),
                    sort,
                });
                if (debouncedSearch) params.set('q', debouncedSearch);
                if (category !== 'all') params.set('category', category);

                const res = await fetch(`${API_URL}/api/public/products?${params}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) throw new Error(`Request failed (${res.status})`);

                const data = await res.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                    setTotalPages(1);
                } else {
                    setProducts(data.content ?? []);
                    setTotalPages(data.totalPages ?? 1);
                }
            } catch (err) {
                if (err.name !== 'AbortError') setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
        return () => controller.abort();
    }, [debouncedSearch, category, sort, page]);

    const hasFilters = useMemo(
        () => debouncedSearch !== '' || category !== 'all' || sort !== 'recent',
        [debouncedSearch, category, sort]
    );

    function clearFilters() {
        setSearch('');
        setCategory('all');
        setSort('recent');
    }

    return (
        <section className="bg-[#0a0a0a] text-white py-16 px-4 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Nossa <span className="text-purple-500">Loja</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                        GPUs, periféricos e máquinas prontas para aluguel. Encontre a configuração ideal para o seu fluxo de trabalho.
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
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filters bar */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 md:items-center">
                <div className="flex-1 relative">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome, marca ou modelo..."
                        className="w-full bg-[#0a0a0a] border border-gray-700 hover:border-gray-500 focus:border-purple-500 text-white placeholder-gray-600 px-4 py-3 rounded-md transition focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label htmlFor="category" className="text-sm text-gray-500 whitespace-nowrap">
                        Categoria
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-[#0a0a0a] border border-gray-700 hover:border-gray-500 text-white px-4 py-3 rounded-md font-semibold transition focus:outline-none focus:border-purple-500"
                    >
                        <option value="all">Todas</option>
                        {categories.map((c) => (
                            <option key={c.id ?? c.slug} value={c.slug ?? c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="border border-gray-700 hover:border-gray-500 text-white px-4 py-3 rounded-md font-semibold transition whitespace-nowrap"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* States */}
            {loading && <ShopSkeleton />}

            {error && !loading && (
                <div className="border border-red-900/40 bg-red-950/20 rounded-xl p-8 text-center">
                    <p className="text-red-400 font-semibold mb-2">Não foi possível carregar os produtos</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="border border-gray-800 bg-[#111] rounded-xl p-12 text-center">
                    <p className="text-gray-400">Nenhum produto encontrado.</p>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-purple-400 hover:text-purple-300 font-semibold transition"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
            {!loading && !error && products.length > 0 && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}
                        />
                    )}
                </>
            )}
        </section>
    );
}

function ProductCard({ product }) {
    const {
        id,
        name,
        brand,
        category,
        price,
        currency = 'BRL',
        imageUrl,
        stock = 0,
        rating,
    } = product;

    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(price ?? 0);

    const inStock = stock > 0;

    return (
        <article className="group bg-[#111] border border-gray-800 hover:border-purple-700/60 rounded-xl overflow-hidden transition flex flex-col">
            <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
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

                {!inStock && (
                    <span className="absolute top-3 right-3 bg-gray-900/90 border border-gray-700 text-gray-400 text-xs font-semibold px-3 py-1 rounded-md">
                        Esgotado
                    </span>
                )}

                {category && (
                    <span className="absolute top-3 left-3 bg-purple-600/90 text-white text-xs font-semibold px-3 py-1 rounded-md">
                        {category}
                    </span>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1 space-y-3">
                <div className="flex-1">
                    {brand && <p className="text-xs text-gray-500 uppercase tracking-wide">{brand}</p>}
                    <h2 className="text-base font-bold leading-tight mt-1 line-clamp-2">{name}</h2>
                </div>

                {typeof rating === 'number' && (
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-purple-400">★</span>
                        <span className="text-gray-400">{rating.toFixed(1)}</span>
                    </div>
                )}

                <div className="flex items-end justify-between pt-3 border-t border-gray-800">
                    <div>
                        <p className="text-xl font-bold text-purple-400">{formattedPrice}</p>
                        <p className="text-xs text-gray-500">
                            {inStock ? `${stock} disponíveis` : 'Indisponível'}
                        </p>
                    </div>

                    <button
                        disabled={!inStock}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition text-sm"
                    >
                        Adicionar
                    </button>
                </div>
            </div>
        </article>
    );
}

function Pagination({ page, totalPages, onChange }) {
    const pages = useMemo(() => {
        const windowSize = 5;
        const start = Math.max(0, Math.min(page - 2, totalPages - windowSize));
        const end = Math.min(totalPages, start + windowSize);
        return Array.from({ length: end - start }, (_, i) => start + i);
    }, [page, totalPages]);

    return (
        <nav
            aria-label="Paginação"
            className="flex items-center justify-center gap-2 mt-12"
        >
            <button
                onClick={() => onChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition"
            >
                Anterior
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={
                        p === page
                            ? 'bg-purple-600 text-white px-4 py-2 rounded-md font-semibold'
                            : 'border border-gray-700 hover:border-gray-500 text-white px-4 py-2 rounded-md font-semibold transition'
                    }
                >
                    {p + 1}
                </button>
            ))}

            <button
                onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="border border-gray-700 hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-semibold transition"
            >
                Próxima
            </button>
        </nav>
    );
}

function ShopSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden animate-pulse"
                >
                    <div className="aspect-square bg-gray-900" />
                    <div className="p-5 space-y-3">
                        <div className="h-3 bg-gray-900 rounded w-1/3" />
                        <div className="h-4 bg-gray-900 rounded w-3/4" />
                        <div className="h-4 bg-gray-900 rounded w-1/2" />
                        <div className="flex items-end justify-between pt-3 border-t border-gray-800">
                            <div className="h-6 bg-gray-900 rounded w-20" />
                            <div className="h-9 bg-gray-900 rounded w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}