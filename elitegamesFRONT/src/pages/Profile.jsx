import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BsPencil,
    BsSave,
    BsX,
    BsCameraFill,
    BsBoxSeam,
    BsReceipt,
    BsShop,
    BsPersonCircle,
    BsTrash,
    BsBoxArrowRight
} from 'react-icons/bs';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, updateUser } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [photoVersion, setPhotoVersion] = useState(Date.now());
    const [profilePic, setProfilePic] = useState('');
    const [hasPhoto, setHasPhoto] = useState(true);

    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/profile');
            setUserData(data);
            setEditFormData({ name: data.name || '', email: data.email || '' });
        } catch (err) {
            console.error(err);
            showError(err.response?.data || 'Erro ao carregar o perfil.');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(''), 3000);
    };

    // ---------- Edição ----------
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            const payload = {
                name: editFormData.name,
                email: editFormData.email,
            };

            const { data } = await api.put('/profile', payload);

            if (data.token) {
                localStorage.setItem('token', data.token);
                setUserData(data.user);
                updateUser?.(data.user);
                showSuccess('Perfil atualizado. Sessão renovada.');
            } else {
                setUserData(data);
                updateUser?.(data);
                showSuccess('Perfil atualizado com sucesso!');
            }
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            showError(err.response?.data || 'Erro ao atualizar o perfil.');
        }
    };

    const handleCancelEdit = () => {
        setEditFormData({
            name: userData.name || '',
            email: userData.email || '',
        });
        setIsEditing(false);
    };

    // ---------- Foto ----------
    const handlePhotoSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // (opcional) validação de tipo/tamanho
        if (!file.type.startsWith('image/')) {
            showError('Selecione um arquivo de imagem.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError('A imagem deve ter no máximo 5MB.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Força o <img> a buscar a nova imagem, ignorando o cache
            setHasPhoto(true);
            setPhotoVersion(Date.now());

            // Atualiza o userData local para refletir que agora há foto
            setUserData((prev) => (prev ? { ...prev, profileImage: true } : prev));
            updateUser?.({ ...userData, profileImage: true });

            showSuccess('Foto atualizada com sucesso!');
        } catch (err) {
            console.error(err);
            showError(err.response?.data || 'Erro ao enviar a foto.');
        } finally {
            // Limpa o input para permitir reenviar o mesmo arquivo
            e.target.value = '';
        }
    };

    const profilePhotoUrl = hasPhoto
        ? `http://localhost:8080/profile/photo`
        : null;

    // ---------- Ações ----------
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.');
        if (!confirm) return;

        try {
            await api.delete('/profile');
            logout();
            navigate('/login');
        } catch (err) {
            console.error(err);
            showError(err.response?.data || 'Erro ao excluir a conta.');
        }
    };

    // ---------- Helpers ----------
    const getInitials = (name) => {
        if (!name) return '?';
        return name.trim().split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    };

    const getRoleLabel = (role) => {
        if (role === 'SELLER') return 'Vendedor';
        if (role === 'CUSTOMER') return 'Cliente';
        return 'Usuário';
    };

    const formatDate = (date) => {
        if (!date) return '—';
        try {
            return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        } catch {
            return '—';
        }
    };

    // ---------- Render ----------
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center text-white gap-4">
                <BsPersonCircle size={64} className="text-gray-600" />
                <h2 className="text-2xl font-bold">Você não está logado</h2>
                <button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition">
                    Fazer Login
                </button>
            </div>
        );
    }

    const isSeller = userData.role === 'SELLER';

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 md:px-8">

            {/* Toast Messages */}
            {successMessage && (
                <div className="fixed top-6 right-6 bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-6 right-6 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
                    {errorMessage}
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header do Perfil */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                    <div className="relative">
                        {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/30"
                            onError={() => setHasPhoto(false)}/>
                        ) : (
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg ${isSeller ? 'bg-purple-700' : 'bg-purple-600'}`}>
                                {getInitials(userData.name)}
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-[#0a0a0a] border border-gray-700 p-2 rounded-full cursor-pointer hover:border-purple-500 transition shadow-md">
                            <BsCameraFill className="text-gray-300 text-sm" />
                            <input type="file" accept="image/*" onChange={handlePhotoSelect} hidden />
                        </label>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-white mb-1">{userData.name || 'Usuário'}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isSeller ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                {isSeller ? '🏪 Vendedor' : '🛒 Cliente'}
                            </span>
                            {userData.createdAt && (
                                <span className="text-xs text-gray-500">Membro desde {formatDate(userData.createdAt)}</span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">{userData.email}</p>
                    </div>
                </div>

                {/* Informações da Conta */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-white">Informações da Conta</h2>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition">
                                <BsPencil /> Editar
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Nome completo</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editFormData.email}
                                        onChange={handleEditChange}
                                        className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:border-purple-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={handleSaveEdit} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                                    <BsSave /> Salvar
                                </button>
                                <button onClick={handleCancelEdit} className="flex items-center gap-2 bg-[#0a0a0a] hover:bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold transition">
                                    <BsX /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-800/50">
                                <span className="text-sm text-gray-400">Nome</span>
                                <span className="text-sm font-medium">{userData.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-800/50">
                                <span className="text-sm text-gray-400">E-mail</span>
                                <span className="text-sm font-medium">{userData.email}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-sm text-gray-400">Tipo de Conta</span>
                                <span className="text-sm font-medium">{getRoleLabel(userData.role)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ações Rápidas (Role) */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">{isSeller ? 'Painel do Vendedor' : 'Minhas Compras'}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {isSeller ? (
                            <>
                                <Link to="/seller/products" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsBoxSeam size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Meus Produtos</h3>
                                    <p className="text-xs text-gray-500">Gerencie seus anúncios e estoque.</p>
                                </Link>
                                <Link to="/orders/received" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsReceipt size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Pedidos Recebidos</h3>
                                    <p className="text-xs text-gray-500">Veja e atualize os pedidos dos clientes.</p>
                                </Link>
                                <Link to="/seller/new-product" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsShop size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Anunciar Produto</h3>
                                    <p className="text-xs text-gray-500">Cadastre um novo produto na loja.</p>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/orders/my" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsReceipt size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Meus Pedidos</h3>
                                    <p className="text-xs text-gray-500">Acompanhe suas compras e avaliações.</p>
                                </Link>
                                <Link to="/shop" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsShop size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Ir às Compras</h3>
                                    <p className="text-xs text-gray-500">Explore GPUs, periféricos e mais.</p>
                                </Link>
                                <Link to="/profile/client-preferences" className="group bg-[#0a0a0a] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition flex flex-col gap-2">
                                    <BsPersonCircle size={24} className="text-purple-500 mb-1" />
                                    <h3 className="font-semibold text-sm text-white group-hover:text-purple-400 transition">Preferências</h3>
                                    <p className="text-xs text-gray-500">Complete seus dados e notificações.</p>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Ações de Conta (Perigo e Logout) */}
                <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button onClick={handleDeleteAccount} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition">
                        <BsTrash /> Excluir minha conta
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-[#0a0a0a] border border-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                        <BsBoxArrowRight /> Sair da conta
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Profile;