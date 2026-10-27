import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BsEnvelope,
    BsTag,
    BsTruck,
    BsMegaphone,
    BsCheckCircle,
    BsArrowLeft,
    BsSave,
    BsTelephone,
    BsGeoAlt,
} from 'react-icons/bs';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PREFERENCE_FIELDS = [
    {
        key: 'emailOnOrderUpdates',
        label: 'Atualizações de pedido por e-mail',
        description: 'Receba e-mails quando o status do seu pedido mudar.',
        icon: BsEnvelope,
    },
    {
        key: 'emailOnPromotions',
        label: 'Promoções por e-mail',
        description: 'Ofertas, cupons e novidades das lojas que você segue.',
        icon: BsTag,
    },
    {
        key: 'smsOnShipping',
        label: 'SMS sobre envio',
        description: 'Receba um SMS quando seu pedido sair para entrega.',
        icon: BsTruck,
    },
    {
        key: 'acceptsMarketing',
        label: 'Comunicações de marketing',
        description: 'Aceito receber comunicações gerais de marketing da EliteGames.',
        icon: BsMegaphone,
    },
];

const EMPTY_ADDRESS = {
    street: '',
    number: '',
    postalCode: '',
    city: '',
    state: '',
    country: 'Brasil',
};

export default function ClientPreferences() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // toasts
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // ---- preferências ----
    const [preferences, setPreferences] = useState({
        emailOnOrderUpdates: false,
        emailOnPromotions: false,
        smsOnShipping: false,
        acceptsMarketing: false,
    });
    const [savedPreferences, setSavedPreferences] = useState(null);
    const [savingPreferences, setSavingPreferences] = useState(false);

    // ---- contato (telefone) ----
    const [phone, setPhone] = useState('');
    const [savedPhone, setSavedPhone] = useState('');
    const [savingPhone, setSavingPhone] = useState(false);

    // ---- endereço ----
    const [addressId, setAddressId] = useState(null);
    const [address, setAddress] = useState(EMPTY_ADDRESS);
    const [savedAddress, setSavedAddress] = useState(EMPTY_ADDRESS);
    const [savingAddress, setSavingAddress] = useState(false);

    // ---------- carregamento ----------
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        const controller = new AbortController();

        (async () => {
            try {
                const { data: addrs } = await api.get('/profile/address', {
                    signal: controller.signal,
                });

                // GET retorna lista (ou 204 se vazio)
                const first = Array.isArray(addrs) ? addrs[0] : null;

                if (first) {
                    const normalizedAddr = {
                        street: first.street ?? '',
                        number: first.number ?? '',
                        postalCode: first.postalCode ?? '',
                        city: first.city ?? '',
                        state: first.state ?? '',
                        country: first.country ?? 'Brasil',
                    };
                    setAddress(normalizedAddr);
                    setSavedAddress(normalizedAddr);
                    setAddressId(first.id);   // ⬅️ guarda o id para o PUT
                } else {
                    // sem endereço: zera e deixa addressId null (próximo save será POST)
                    setAddress(EMPTY_ADDRESS);
                    setSavedAddress(EMPTY_ADDRESS);
                    setAddressId(null);
                }
                // preferências
                const { data: prefs } = await api.get('/profile/preferences', {
                    signal: controller.signal,
                });
                const normalizedPrefs = {
                    emailOnOrderUpdates: !!prefs.emailOnOrderUpdates,
                    emailOnPromotions: !!prefs.emailOnPromotions,
                    smsOnShipping: !!prefs.smsOnShipping,
                    acceptsMarketing: !!prefs.acceptsMarketing,
                };
                setPreferences(normalizedPrefs);
                setSavedPreferences(normalizedPrefs);

                // telefone (vem do /profile)
                const { data: profile } = await api.get('/profile', {
                    signal: controller.signal,
                });
                setPhone(profile.phone ?? '');
                setSavedPhone(profile.phone ?? '');

                // endereço
                try {
                    const { data: addr } = await api.get('/profile/address', {
                        signal: controller.signal,
                    });
                    const normalizedAddr = {
                        street: addr?.street ?? '',
                        number: addr?.number ?? '',
                        postalCode: addr?.postalCode ?? '',
                        city: addr?.city ?? '',
                        state: addr?.state ?? '',
                        country: addr?.country ?? 'Brasil',
                    };
                    setAddress(normalizedAddr);
                    setSavedAddress(normalizedAddr);
                } catch (addrErr) {
                    // 404 = ainda não tem endereço cadastrado; não é erro fatal
                    if (addrErr.response?.status !== 404) throw addrErr;
                }
            } catch (err) {
                if (axios.isCancel(err)) return;
                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    'Erro ao carregar dados.'
                )
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [isAuthenticated]);

    // ---------- helpers ----------
    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 3000);
    };

    const toggle = (key) =>
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));


    const handlePhoneChange = (e) => setPhone(e.target.value);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const hasPreferenceChanges =
        savedPreferences &&
        PREFERENCE_FIELDS.some(
            (f) => preferences[f.key] !== savedPreferences[f.key]
        );

    const hasPhoneChanges = phone !== savedPhone;

    const hasAddressChanges =
        address.street !== savedAddress.street ||
        address.number !== savedAddress.number ||
        address.postalCode !== savedAddress.postalCode ||
        address.city !== savedAddress.city ||
        address.state !== savedAddress.state ||
        address.country !== savedAddress.country;

    // ---------- salvar preferências ----------
    async function handleSavePreferences() {
        setSavingPreferences(true);
        try {
            const { data } = await api.put('/profile/preferences', preferences);
            const normalized = {
                emailOnOrderUpdates: !!data.emailOnOrderUpdates,
                emailOnPromotions: !!data.emailOnPromotions,
                smsOnShipping: !!data.smsOnShipping,
                acceptsMarketing: !!data.acceptsMarketing,
            };
            setPreferences(normalized);
            setSavedPreferences(normalized);
            showSuccess('Preferências atualizadas com sucesso!');
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao salvar preferências.';
            showError(typeof msg === 'string' ? msg : 'Erro ao salvar preferências.');
        } finally {
            setSavingPreferences(false);
        }
    }

    // ---------- salvar telefone ----------
    async function handleSavePhone() {
        setSavingPhone(true);
        try {
            const { data } = await api.put('/profile', {
                name: user?.name,
                email: user?.email,
                phone,
            });
            const newPhone = data?.phone ?? phone;
            setPhone(newPhone);
            setSavedPhone(newPhone);
            showSuccess('Telefone atualizado com sucesso!');
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                err.response?.data ||
                'Erro ao salvar telefone.';
            showError(typeof msg === 'string' ? msg : 'Erro ao salvar telefone.');
        } finally {
            setSavingPhone(false);
        }
    }

    // ---------- salvar endereço ----------
    async function handleSaveAddress() {
            // validação básica
            const required = ['street', 'number', 'postalCode', 'city', 'state'];
            const missing = required.filter((k) => !address[k]?.trim());
            if (missing.length > 0) {
                showError('Preencha todos os campos obrigatórios do endereço.');
                return;
            }

            setSavingAddress(true);
            try {
                let data;
                if (addressId) {
                    // já existe → atualiza
                    ({data} = await api.put(`/profile/address/${addressId}`, address));
                } else {
                    // não existe → cria e guarda o id retornado
                    ({data} = await api.post('/profile/address', address));
                    if (data?.id) setAddressId(data.id);
                }

                const normalized = {
                    street: data?.street ?? '',
                    number: data?.number ?? '',
                    postalCode: data?.postalCode ?? '',
                    city: data?.city ?? '',
                    state: data?.state ?? '',
                    country: data?.country ?? 'Brasil',
                };
                setAddress(normalized);
                setSavedAddress(normalized);
                showSuccess('Endereço atualizado com sucesso!');
            } catch (err) {
                console.error(err);
                const msg =
                    err.response?.data?.message ||
                    err.response?.data ||
                    'Erro ao salvar endereço.';
                showError(typeof msg === 'string' ? msg : 'Erro ao salvar endereço.');
            } finally {
                setSavingAddress(false);
            }
    }
    async function handleCepLookup() {
        // 1. Limpa máscara e valida tamanho
        const cleanCep = address.postalCode.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            showError('CEP inválido. Digite 8 números.');
            return;
        }

        try {
            // 2. Chama a API ViaCEP
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            // 3. Verifica se o CEP existe (ViaCEP retorna { erro: true } se não achar)
            if (data.erro) {
                showError('CEP não encontrado.');
                return;
            }

            // 4. Preenche os campos do formulário
            setAddress((prev) => ({
                ...prev,
                street: data.logradouro || prev.street,
                // O ViaCEP não retorna o número, então mantemos o que o usuário digitou
                number: prev.number,
                city: data.localidade || prev.city,
                state: data.uf || prev.state,
                // Bairro não está no seu formulário, mas se tivesse, seria data.bairro
            }));

            showSuccess('Endereço preenchido pelo CEP!');

        } catch (err) {
            console.error(err);
            showError('Erro ao buscar CEP. Preencha manualmente.');
        }
    }


    // ---------- estados de tela ----------
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center gap-4 px-4">
                <h2 className="text-2xl font-bold">Faça login para ver suas preferências</h2>
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
                    Não foi possível carregar as preferências
                </h2>
                <p className="text-gray-400 text-sm">{String(error)}</p>
                <button
                    onClick={() => navigate('/profile')}
                    className="text-purple-400 hover:underline flex items-center gap-2"
                >
                    <BsArrowLeft /> Voltar ao perfil
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">
            {/* Toasts */}
            {successMessage && (
                <div className="fixed top-6 right-6 bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg shadow-lg z-50">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-6 right-6 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg shadow-lg z-50">
                    {errorMessage}
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition text-sm"
                >
                    <BsArrowLeft /> Voltar ao perfil
                </button>

                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Preferências de <span className="text-purple-500">compra</span>
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                    Escolha como deseja ser notificado e mantenha seus dados de contato atualizados.
                </p>

                {/* ===================== CONTATO ===================== */}
                <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BsTelephone className="text-purple-500" />
                        <h2 className="text-lg font-bold">Contato</h2>
                    </div>

                    <label className="block text-sm text-gray-400 mb-1" htmlFor="phone">
                        Telefone
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSavePhone}
                            disabled={savingPhone || !hasPhoneChanges}
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            {savingPhone ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Salvando…
                                </>
                            ) : (
                                <>
                                    <BsSave /> Salvar telefone
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* ===================== ENDEREÇO ===================== */}
                <section className="bg-[#141414] border border-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BsGeoAlt className="text-purple-500" />
                        <h2 className="text-lg font-bold">Endereço de entrega</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="street">
                                Rua / Logradouro *
                            </label>
                            <input
                                id="street"
                                name="street"
                                value={address.street}
                                onChange={handleAddressChange}
                                placeholder="Av. Paulista"
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="number">
                                Número *
                            </label>
                            <input
                                id="number"
                                name="number"
                                value={address.number}
                                onChange={handleAddressChange}
                                placeholder="1000"
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="postalCode">
                                CEP *
                            </label>
                            <input
                                id="postalCode"
                                name="postalCode"
                                value={address.postalCode}
                                onChange={handleAddressChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault(); // Evita submit do form, se houver
                                        handleCepLookup();
                                    }
                                }}
                                placeholder="01310-100"
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="city">
                                Cidade *
                            </label>
                            <input
                                id="city"
                                name="city"
                                value={address.city}
                                onChange={handleAddressChange}
                                placeholder="São Paulo"
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="state">
                                Estado *
                            </label>
                            <input
                                id="state"
                                name="state"
                                value={address.state}
                                onChange={handleAddressChange}
                                placeholder="SP"
                                maxLength={2}
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition uppercase"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm text-gray-400 mb-1" htmlFor="country">
                                País
                            </label>
                            <input
                                id="country"
                                name="country"
                                value={address.country}
                                onChange={handleAddressChange}
                                placeholder="Brasil"
                                className="w-full bg-[#0a0a0a] border border-gray-800 focus:border-purple-500 rounded-lg px-4 py-2.5 text-white outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSaveAddress}
                            disabled={savingAddress || !hasAddressChanges}
                            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                        >
                            {savingAddress ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Salvando…
                                </>
                            ) : (
                                <>
                                    <BsSave /> Salvar endereço
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* ===================== PREFERÊNCIAS ===================== */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 space-y-2">
                    <h2 className="text-lg font-bold mb-2">Notificações</h2>
                    {PREFERENCE_FIELDS.map((field) => {
                        const Icon = field.icon;
                        const active = preferences[field.key];
                        return (
                            <div
                                key={field.key}
                                className="flex items-start justify-between gap-4 py-4 border-b border-gray-800/50 last:border-0"
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div
                                        className={`mt-0.5 p-2 rounded-lg ${
                                            active
                                                ? 'bg-purple-500/15 text-purple-400'
                                                : 'bg-gray-800/50 text-gray-500'
                                        }`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-white">
                                            {field.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {field.description}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={active}
                                    onClick={() => toggle(field.key)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                                        active ? 'bg-purple-600' : 'bg-gray-700'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                                            active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <p className="text-xs text-gray-500">
                        {hasPreferenceChanges
                            ? 'Você tem alterações não salvas nas notificações.'
                            : 'Suas preferências de notificação estão atualizadas.'}
                    </p>

                    <button
                        onClick={handleSavePreferences}
                        disabled={savingPreferences || !hasPreferenceChanges}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition"
                    >
                        {savingPreferences ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Salvando…
                            </>
                        ) : (
                            <>
                                <BsSave /> Salvar preferências
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 bg-[#141414] border border-gray-800 rounded-xl p-4 flex items-start gap-3">
                    <BsCheckCircle className="text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400">
                        Você pode alterar essas preferências a qualquer momento. E-mails
                        transacionais (confirmação de compra, envio) são sempre enviados por
                        segurança.
                    </p>
                </div>
            </div>
        </div>
    );
}