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
} from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../css/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, updateUser } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [photoVersion, setPhotoVersion] = useState(Date.now()); // cache-busting

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
            showError(
                err.response?.data || 'Erro ao carregar o perfil.'
            );
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

            // Se o e-mail mudou, o backend retorna { message, token, user }
            if (data.token) {
                localStorage.setItem('token', data.token);
                setUserData(data.user);
                updateUser?.(data.user);
                showSuccess('Perfil atualizado. Sessão renovada.');
            } else {
                // Retornou o User direto
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

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/profile/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Força o browser a buscar a nova foto
            setPhotoVersion(Date.now());
            showSuccess('Foto atualizada com sucesso!');
        } catch (err) {
            console.error(err);
            showError(err.response?.data || 'Erro ao enviar a foto.');
        }
    };

    const profilePhotoUrl = userData?.profileImage
        ? `http://localhost:8080/profile/photo?v=${photoVersion}`
        : null;

    // ---------- Ações ----------

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm(
            'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.'
        );
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
        return name
            .trim()
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const getRoleLabel = (role) => {
        if (role === 'SELLER') return 'Vendedor';
        if (role === 'CUSTOMER') return 'Cliente';
        return 'Usuário';
    };

    const formatDate = (date) => {
        if (!date) return '—';
        try {
            return new Date(date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '—';
        }
    };

    // ---------- Render ----------

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-card">
                    <p>Carregando perfil...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="profile-page">
                <div className="profile-not-logged">
                    <div className="not-logged-card">
                        <BsPersonCircle size={48} />
                        <h2>Você não está logado</h2>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Fazer Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isSeller = userData.role === 'SELLER';

    return (
        <div className="profile-page">
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="error-message api-error">{errorMessage}</div>
            )}

            <div className="profile-card">
                {/* HEADER */}
                <div className="profile-header">
                    <div className="profile-avatar-container">
                        {profilePhotoUrl ? (
                            <img
                                src={profilePhotoUrl}
                                alt="Foto de perfil"
                                className="profile-avatar-image"
                            />
                        ) : (
                            <div
                                className="profile-avatar"
                                style={{
                                    backgroundColor: isSeller ? '#6d28d9' : '#7c3aed',
                                }}
                            >
                                {getInitials(userData.name)}
                            </div>
                        )}

                        <label className="upload-photo-button" title="Trocar foto">
                            <BsCameraFill className="photo-icon" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoSelect}
                                hidden
                            />
                        </label>
                    </div>

                    <div>
                        <h1>{userData.name || 'Usuário'}</h1>
                        <p className="profile-role-line">
                            {isSeller ? '🏪 Vendedor' : '🛒 Cliente'}
                        </p>
                        {userData.createdAt && (
                            <p className="profile-since">
                                Membro desde {formatDate(userData.createdAt)}
                            </p>
                        )}
                    </div>
                </div>

                {/* INFORMAÇÕES DA CONTA */}
                <div className="profile-content">
                    <div className="section-header">
                        <h2>Informações da Conta</h2>
                        {!isEditing && (
                            <button
                                className="btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                <BsPencil /> Editar
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editFormData.email}
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="edit-actions">
                                <button className="btn-save" onClick={handleSaveEdit}>
                                    <BsSave /> Salvar
                                </button>
                                <button className="btn-cancel" onClick={handleCancelEdit}>
                                    <BsX /> Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-row">
                                <span className="detail-label">Nome:</span>
                                <span className="detail-value">{userData.name}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">E-mail:</span>
                                <span className="detail-value">{userData.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tipo:</span>
                                <span className="detail-value">
                                    {getRoleLabel(userData.role)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* AÇÕES POR ROLE */}
                <div className="profile-content">
                    <div className="section-header">
                        <h2>{isSeller ? 'Minha Loja' : 'Minhas Compras'}</h2>
                    </div>

                    {isSeller ? (
                        <div className="role-actions">
                            <Link to="/seller/products" className="role-card">
                                <BsBoxSeam size={24} />
                                <div>
                                    <h3>Meus Produtos</h3>
                                    <p>Gerencie seus anúncios e estoque.</p>
                                </div>
                            </Link>

                            <Link to="/orders/received" className="role-card">
                                <BsReceipt size={24} />
                                <div>
                                    <h3>Pedidos Recebidos</h3>
                                    <p>Veja e atualize os pedidos dos clientes.</p>
                                </div>
                            </Link>

                            <Link to="/seller/new-product" className="role-card">
                                <BsShop size={24} />
                                <div>
                                    <h3>Anunciar Produto</h3>
                                    <p>Cadastre um novo produto na loja.</p>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <div className="role-actions">
                            <Link to="/orders/my" className="role-card">
                                <BsReceipt size={24} />
                                <div>
                                    <h3>Meus Pedidos</h3>
                                    <p>Acompanhe suas compras e avaliações.</p>
                                </div>
                            </Link>

                            <Link to="/shop" className="role-card">
                                <BsShop size={24} />
                                <div>
                                    <h3>Ir às Compras</h3>
                                    <p>Explore GPUs, periféricos e mais.</p>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                <div className="profile-actions">
                    <button
                        className="btn-delete"
                        onClick={handleDeleteAccount}
                        title="Excluir conta"
                    >
                        <BsTrash /> Excluir Conta
                    </button>
                    <button className="btn-logout" onClick={handleLogout}>
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;