import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BsCreditCard,
    BsQrCode,
    BsBank,
    BsShieldCheck,
    BsArrowLeft,
    BsCheckCircle,
    BsLock,
    BsPerson,
    BsCalendar,
} from 'react-icons/bs';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Contrato REST isolado — ajuste quando houver um PaymentController real
// ---------------------------------------------------------------------------
const cartApi = {
    get: (config) => api.get('/cart', config),
    removeItem: (productId) => api.delete(`/cart/items/${productId}`),
};

const orderApi = {
    // O OrderController atual aceita quantity como @RequestParam
    create: (productId, quantity = 1) =>
        api.post('/orders', null, { params: { productId, quantity } }),
};

const formatPrice = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
        Number(value ?? 0)
    );

const PAYMENT_METHODS = [
    {
        id: 'pix',
        label: 'PIX',
        description: 'Aprovação imediata. QR Code gerado após confirmação.',
        icon: BsQrCode,
    },
    {
        id: 'credit_card',
        label: 'Cartão de crédito',
        description: 'Em até 12x sem juros. Pagamento processado na hora.',
        icon: BsCreditCard,
    },
    {
        id: 'boleto',
        label: 'Boleto bancário',
        description: 'Vence em 3 dias úteis. Aprovação após o pagamento.',
        icon: BsBank,
    },
];

// ---------- validações client-side ----------
function onlyDigits(str) {
    return (str ?? '').replace(/\D/g, '');
}

function luhnValid(cardNumber) {
    const digits = onlyDigits(cardNumber);
    if (digits.length < 13) return false;
    let sum = 0;
    let double = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = Number(digits[i]);
        if (double) {
            n *= 2;
            if (n > 9) n -= 9;
        }
        sum += n;
        double = !double;
    }
    return sum % 10 === 0;
}

function validateCard(form) {
    const errors = {};
    if (!form.cardName.trim()) errors.cardName = 'Informe o nome impresso no cartão.';
    if (!luhnValid(form.cardNumber)) errors.cardNumber = 'Número de cartão inválido.';

    const digits = onlyDigits(form.cardNumber);
    if (digits.length < 13 || digits.length > 19)
        errors.cardNumber = 'Número de cartão inválido.';

    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry))
        errors.cardExpiry = 'Use o formato MM/AA.';
    else {
        const [mm, yy] = form.cardExpiry.split('/').map(Number);
        const now = new Date();
        const expiry = new Date(2000 + yy, mm, 0); // último dia do mês
        if (mm < 1 || mm > 12) errors.cardExpiry = 'Mês inválido.';
        else if (expiry < now) errors.cardExpiry = 'Cartão expirado.';
    }

    if (!/^\d{3,4}$/.test(form.cardCvv)) errors.cardCvv = 'CVV inválido.';
    return errors;
}

// ---------- máscaras ----------
const maskCardNumber = (v) =>
    onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

const maskExpiry = (v) => {
    const d = onlyDigits(v).slice(0, 4);
    return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

export default function Payment() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [method, setMethod] = useState('pix');
    const [form, setForm] = useState({
        cardName: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        installments: 1,
    });
    const [formErrors, setFormErrors] = useState({});

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // ---------- carrega carrinho ----------
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();
        (async () => {
            try {
                const { data } = await cartApi.get({ signal: controller.signal });
                setCart(data);
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
        })();
        return () => controller.abort();
    }, [isAuthenticated]);

    // ---------- derivados ----------
    const items = cart?.items ?? [];

    const subtotal = useMemo(
        () =>
            items.reduce(
                (acc, i) =>
                    acc + Number(i.unitPriceSnapshot ?? 0) * Number(i.quantity ?? 0),
                0
            ),
        [items]
    );

    const itemCount = useMemo(
        () => items.reduce((acc, i) => acc + Number(i.quantity ?? 0), 0),
        [items]
    );

    const installments = useMemo(() => {
        const max = 12;
        const minValue = 5; // parcela mínima de R$ 5,00
        return Array.from({ length: max }, (_, i) => i + 1).filter(
            (n) => subtotal / n >= minValue || n === 1
        );
    }, [subtotal]);

    // ---------- handlers ----------
    function handleChange(e) {
        const { name, value } = e.target;
        let masked = value;
        if (name === 'cardNumber') masked = maskCardNumber(value);
        if (name === 'cardExpiry') masked = maskExpiry(value);
        if (name === 'cardCvv') masked = onlyDigits(value).slice(0, 4);
        setForm((prev) => ({ ...prev, [name]: masked }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    async function handleConfirm() {
        setSubmitError(null);

        if (method === 'credit_card') {
            const errors = validateCard(form);
            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }
        }

        if (!items.length) {
            setSubmitError('Seu carrinho está vazio.');
            return;
        }

        setSubmitting(true);

        const created = [];
        const failed = [];

        for (const item of items) {
            try {
                // Cria pedido(s) com a quantidade correta
                await orderApi.create(item.productId, item.quantity);
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

        // Remove do carrinho apenas os itens cujo pedido foi criado
        for (const productId of created) {
            try {
                await cartApi.removeItem(productId);
            } catch {
                /* item pode ficar; o pedido já foi criado */
            }
        }

        setSubmitting(false);

        if (failed.length === 0) {
            // Sucesso: vai para Meus Pedidos
            navigate('/orders/my', { replace: true });
        } else {
            setSubmitError(
                `${failed.length} item(ns) não puderam ser processados. ` +
                failed.map((f) => `#${f.productId}: ${f.message}`).join(' | ')
            );
        }
    }

    // ---------- estados de tela ----------
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center gap-4 px-4">
                <BsLock size={56} className="text-gray-600" />
                <h2 className="text-2xl font-bold">Faça login para finalizar a compra</h2>
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
                <Link to="/cart" className="text-purple-400 hover:underline flex items-center gap-2">
                    <BsArrowLeft /> Voltar ao carrinho
                </Link>
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center gap-4 px-4">
                <h2 className="text-2xl font-bold">Seu carrinho está vazio</h2>
                <Link
                    to="/shop"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                    Explorar produtos
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm"
                >
                    <BsArrowLeft /> Voltar ao carrinho
                </button>

                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Finalizar <span className="text-purple-500">compra</span>
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                    Revise seus dados e escolha a forma de pagamento.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna esquerda: pagamento */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Métodos */}
                        <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold mb-4">Forma de pagamento</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    const active = method === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => {
                                                setMethod(m.id);
                                                setFormErrors({});
                                                setSubmitError(null);
                                            }}
                                            className={`text-left p-4 rounded-xl border transition ${
                                                active
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : 'border-gray-800 hover:border-gray-600 bg-[#0a0a0a]'
                                            }`}
                                        >
                                            <Icon
                                                size={22}
                                                className={active ? 'text-purple-400' : 'text-gray-400'}
                                            />
                                            <p className="font-semibold text-sm mt-2">{m.label}</p>
                                            <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Formulário condicional */}
                        {method === 'credit_card' && (
                            <CardForm
                                form={form}
                                errors={formErrors}
                                onChange={handleChange}
                                installments={installments}
                                subtotal={subtotal}
                            />
                        )}

                        {method === 'pix' && (
                            <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <BsQrCode className="text-purple-400" /> Pagamento via PIX
                                </h2>
                                <p className="text-sm text-gray-400">
                                    O QR Code será gerado após a confirmação. Você terá 30 minutos
                                    para pagar. A aprovação é imediata.
                                </p>
                            </section>
                        )}

                        {method === 'boleto' && (
                            <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <BsBank className="text-purple-400" /> Boleto bancário
                                </h2>
                                <p className="text-sm text-gray-400">
                                    O boleto será enviado para <strong>{user?.email}</strong> e vence
                                    em 3 dias úteis. O pedido será aprovado após a confirmação do
                                    pagamento.
                                </p>
                            </section>
                        )}

                        {submitError && (
                            <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 text-sm text-red-400">
                                {submitError}
                            </div>
                        )}
                    </div>

                    {/* Coluna direita: resumo */}
                    <aside className="lg:col-span-1">
                        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 sticky top-6 space-y-4">
                            <h2 className="text-lg font-bold">Resumo do pedido</h2>

                            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                {items.map((item) => (
                                    <li
                                        key={item.productId}
                                        className="flex justify-between gap-3 text-sm"
                                    >
                                        <span className="text-gray-400 line-clamp-1">
                                            {item.quantity}x {item.productNameSnapshot}
                                        </span>
                                        <span className="text-white font-semibold whitespace-nowrap">
                                            {formatPrice(
                                                Number(item.unitPriceSnapshot) * item.quantity
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="border-t border-gray-800 pt-3 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal ({itemCount} item(ns))</span>
                                    <span className="text-white font-semibold">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Frete</span>
                                    <span className="text-green-400 font-semibold">Grátis</span>
                                </div>
                                <div className="flex justify-between text-base pt-2 border-t border-gray-800">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold text-purple-400">
                                        {formatPrice(subtotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={submitting}
                                className="w-full h-12 rounded-md font-bold flex items-center justify-center gap-2 transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Processando…
                                    </>
                                ) : (
                                    <>
                                        <BsCheckCircle /> Confirmar e pagar
                                    </>
                                )}
                            </button>

                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                <BsShieldCheck className="text-purple-500" />
                                Ambiente seguro. Seus dados não são armazenados.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

// ---------- subcomponente: formulário de cartão ----------
function CardForm({ form, errors, onChange, installments, subtotal }) {
    return (
        <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <BsCreditCard className="text-purple-400" /> Dados do cartão
            </h2>

            <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="cardName">
                    Nome impresso no cartão
                </label>
                <div className="relative">
                    <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        id="cardName"
                        name="cardName"
                        value={form.cardName}
                        onChange={onChange}
                        autoComplete="cc-name"
                        className={`w-full bg-[#0a0a0a] border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none transition ${
                            errors.cardName
                                ? 'border-red-500'
                                : 'border-gray-800 focus:border-purple-500'
                        }`}
                    />
                </div>
                {errors.cardName && (
                    <p className="text-xs text-red-400 mt-1">{errors.cardName}</p>
                )}
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="cardNumber">
                    Número do cartão
                </label>
                <div className="relative">
                    <BsCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        id="cardNumber"
                        name="cardNumber"
                        value={form.cardNumber}
                        onChange={onChange}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        className={`w-full bg-[#0a0a0a] border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none transition ${
                            errors.cardNumber
                                ? 'border-red-500'
                                : 'border-gray-800 focus:border-purple-500'
                        }`}
                    />
                </div>
                {errors.cardNumber && (
                    <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1" htmlFor="cardExpiry">
                        Validade
                    </label>
                    <div className="relative">
                        <BsCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            id="cardExpiry"
                            name="cardExpiry"
                            value={form.cardExpiry}
                            onChange={onChange}
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            placeholder="MM/AA"
                            className={`w-full bg-[#0a0a0a] border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none transition ${
                                errors.cardExpiry
                                    ? 'border-red-500'
                                    : 'border-gray-800 focus:border-purple-500'
                            }`}
                        />
                    </div>
                    {errors.cardExpiry && (
                        <p className="text-xs text-red-400 mt-1">{errors.cardExpiry}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1" htmlFor="cardCvv">
                        CVV
                    </label>
                    <div className="relative">
                        <BsLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            id="cardCvv"
                            name="cardCvv"
                            value={form.cardCvv}
                            onChange={onChange}
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="000"
                            className={`w-full bg-[#0a0a0a] border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none transition ${
                                errors.cardCvv
                                    ? 'border-red-500'
                                    : 'border-gray-800 focus:border-purple-500'
                            }`}
                        />
                    </div>
                    {errors.cardCvv && (
                        <p className="text-xs text-red-400 mt-1">{errors.cardCvv}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="installments">
                    Parcelas
                </label>
                <select
                    id="installments"
                    name="installments"
                    value={form.installments}
                    onChange={onChange}
                    className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                >
                    {installments.map((n) => (
                        <option key={n} value={n}>
                            {n}x de {formatPrice(subtotal / n)} {n === 1 ? '(à vista)' : 'sem juros'}
                        </option>
                    ))}
                </select>
            </div>
        </section>
    );
}