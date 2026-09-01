import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BsPencil, BsTrash, BsPlus, BsX, BsCheck, BsPeople, BsBoxSeam, BsStar, BsStarFill } from 'react-icons/bs';
import '../css/Services.css';

const API_URL = "http://localhost:8080";

// Categorias baseadas no Enum do backend
const CATEGORIES = [
    { value: 'PROGRAMMING', label: 'Programação', icon: '💻' },
    { value: 'DESIGN', label: 'Design', icon: '🎨' },
    { value: 'VIDEO', label: 'Vídeo e Animação', icon: '🎬' },
    { value: 'MARKETING', label: 'Marketing', icon: '📈' },
    { value: 'WRITING', label: 'Redação e Conteúdo', icon: '✍️' },
    { value: 'ART', label: 'Arte e Ilustração', icon: '🖼️' },
    { value: 'OTHER', label: 'Outros', icon: '📦' }
];

const getCategoryLabel = (categoryValue) => {
    const category = CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue || 'Outros';
};

const getCategoryIcon = (categoryValue) => {
    const category = CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.icon : '📦';
};

const Services = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [showClientsModal, setShowClientsModal] = useState(false);
    const [serviceOrders, setServiceOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        deliveryTimeDays: '',
        skills: ''
    });

    // Carregar serviços baseado no tipo de usuário
    useEffect(() => {
        if (isAuthenticated) {
            loadServices();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    // Função para recarregar serviços
    const loadServices = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            let response;

            if (user?.role === 'FREELANCER') {
                response = await axios.get(`${API_URL}/services/my`, { headers });
            } else {
                response = await axios.get(`${API_URL}/services`, { headers });
            }

            console.log("Serviços carregados:", response.data);

            if (response.data && Array.isArray(response.data)) {
                setServices(response.data);
            } else {
                setServices([]);
            }
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
            if (error.response?.status === 401) {
                setError("Sessão expirada. Faça login novamente.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setError(error.response?.data || "Erro ao carregar serviços. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }, [user?.role]);

    // Carregar ordens (pedidos) de um serviço específico
    const loadServiceOrders = async (serviceId) => {
        setLoadingOrders(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`${API_URL}/orders/received`, { headers });
            const ordersForService = response.data.filter(order => order.service?.id === serviceId);
            setServiceOrders(ordersForService);
        } catch (error) {
            console.error("Erro ao carregar pedidos do serviço:", error);
            setServiceOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleViewClients = async (service) => {
        setSelectedService(service);
        await loadServiceOrders(service.id);
        setShowClientsModal(true);
    };

    const refreshServiceOrders = async () => {
        if (selectedService) {
            await loadServiceOrders(selectedService.id);
        }
    };

    // Função para ver detalhes da avaliação
    const handleViewReview = (order) => {
        setSelectedOrderDetails(order);
        setShowReviewModal(true);
    };

    const handleCloseReviewModal = async () => {
        setShowReviewModal(false);
        setSelectedOrderDetails(null);
        // 🔧 Recarregar pedidos ao fechar o modal de avaliação
        await refreshServiceOrders();
    };

    // Função para navegar para a página de entrega com o pedido específico
    const handleDeliverOrder = (orderId) => {
        navigate(`/deliver/${orderId}`);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({
            title: '',
            description: '',
            price: '',
            category: '',
            deliveryTimeDays: '',
            skills: ''
        });
        setShowModal(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setFormData({
            title: service.title || '',
            description: service.description || '',
            price: service.price || '',
            category: service.category || '',
            deliveryTimeDays: service.deliveryTimeDays || '',
            skills: service.skills?.join(', ') || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validCategories = CATEGORIES.map(c => c.value);
        if (!validCategories.includes(formData.category)) {
            alert(`Categoria inválida. Escolha uma das opções: ${validCategories.join(', ')}`);
            return;
        }

        if (!formData.title.trim()) {
            alert("Título é obrigatório");
            return;
        }
        if (!formData.description.trim()) {
            alert("Descrição é obrigatória");
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            alert("Preço deve ser maior que zero");
            return;
        }
        if (!formData.deliveryTimeDays || parseInt(formData.deliveryTimeDays) <= 0) {
            alert("Prazo de entrega deve ser maior que zero");
            return;
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category,
                deliveryTimeDays: parseInt(formData.deliveryTimeDays),
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
            };

            if (editingService) {
                await axios.put(`${API_URL}/services/${editingService.id}`, payload, { headers });
                alert("Serviço atualizado com sucesso!");
            } else {
                await axios.post(`${API_URL}/services`, payload, { headers });
                alert("Serviço criado com sucesso!");
            }

            setShowModal(false);
            await loadServices();

        } catch (error) {
            console.error("Erro ao salvar serviço:", error);
            alert(error.response?.data || "Erro ao salvar serviço.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (serviceId) => {
        if (!window.confirm("Tem certeza que deseja excluir este serviço?")) return;

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/services/${serviceId}`, { headers });
            alert("Serviço excluído com sucesso!");
            await loadServices();
        } catch (error) {
            console.error("Erro ao excluir serviço:", error);
            alert(error.response?.data || "Erro ao excluir serviço.");
        }
    };

    const handleHire = async (serviceId) => {
        if (!isAuthenticated) {
            alert("Faça login para contratar este serviço.");
            window.location.href = "/login";
            return;
        }

        if (user?.role !== 'CLIENT') {
            alert("Apenas clientes podem contratar serviços.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_URL}/orders?serviceId=${serviceId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Serviço contratado com sucesso!");
            await loadServices();
            window.location.href = "/projects";
        } catch (error) {
            console.error("Erro ao contratar:", error);
            alert(error.response?.data || "Erro ao contratar serviço.");
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'PENDING': '⏳ Pendente',
            'IN_PROGRESS': '🚀 Em andamento',
            'DELIVERED': '📦 Entregue',
            'COMPLETED': '✅ Concluído',
            'CANCELLED': '❌ Cancelado'
        };
        return statusMap[status] || status;
    };

    // Componente de estrelas para avaliação
    const StarDisplay = ({ rating }) => {
        return (
            <div className="star-display">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
                        {star <= rating ? <BsStarFill /> : <BsStar />}
                    </span>
                ))}
            </div>
        );
    };

    // Renderização para usuário não logado
    if (!isAuthenticated) {
        return (
            <div className="services-container">
                <div className="not-logged-card">
                    <h2>Explore os serviços disponíveis</h2>
                    <p>Faça login para ver todos os serviços e contratar freelancers.</p>
                    <button onClick={() => window.location.href = "/login"} className="btn-primary">
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    // Renderização para FREELANCER
    if (user?.role === 'FREELANCER') {
        return (
            <div className="services-container">
                <div className="services-header">
                    <h1>Meus Serviços</h1>
                    <p>Gerencie os serviços que você oferece</p>
                    <button className="btn-create-service" onClick={openCreateModal}>
                        <BsPlus /> Criar Novo Serviço
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Carregando seus serviços...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>{error}</p>
                        <button onClick={loadServices} className="btn-retry">Tentar novamente</button>
                    </div>
                ) : services.length === 0 ? (
                    <div className="no-services">
                        <p>Você ainda não criou nenhum serviço.</p>
                        <button onClick={openCreateModal} className="btn-create-service">
                            Criar meu primeiro serviço
                        </button>
                    </div>
                ) : (
                    <div className="services-grid">
                        {services.map(service => (
                            <div key={service.id} className="service-card">
                                <div className="service-header">
                                    <h3>{service.title}</h3>
                                    <div className="service-actions">
                                        <button
                                            className="btn-view-clients"
                                            onClick={() => handleViewClients(service)}
                                            title={`Ver quem contratou (${service.ordersCompleted || 0})`}
                                        >
                                            <BsPeople />
                                        </button>
                                        <button
                                            className="btn-edit"
                                            onClick={() => openEditModal(service)}
                                            title="Editar"
                                        >
                                            <BsPencil />
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(service.id)}
                                            title="Excluir"
                                        >
                                            <BsTrash />
                                        </button>
                                    </div>
                                </div>

                                <p className="service-description">{service.description}</p>

                                <div className="service-details">
                                    <span className="service-price">{formatPrice(service.price)}</span>
                                    <span className="service-delivery">⏱️ Entrega em {service.deliveryTimeDays} dias</span>
                                </div>

                                <div className="service-category">
                                    <span className="category-tag">
                                        {getCategoryIcon(service.category)} {getCategoryLabel(service.category)}
                                    </span>
                                </div>

                                <div className="skills-container">
                                    {service.skills?.map((skill, idx) => (
                                        <span key={idx} className="skill-tag">{skill}</span>
                                    ))}
                                </div>

                                {service.ordersCompleted > 0 && (
                                    <button
                                        className="btn-deliver-service"
                                        onClick={() => handleViewClients(service)}
                                    >
                                        <BsBoxSeam /> Ver Pedidos
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Clientes com avaliações */}
                {/* Modal de Clientes com avaliações */}
                {showClientsModal && selectedService && (
                    <div className="modal-overlay" onClick={() => setShowClientsModal(false)}>
                        <div className="modal-content clients-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    <BsPeople /> Pedidos do serviço
                                    <br />
                                    <small>{selectedService.title}</small>
                                </h2>
                                <button className="modal-close" onClick={() => setShowClientsModal(false)}>
                                    <BsX />
                                </button>
                            </div>

                            <div className="modal-body">
                                {loadingOrders ? (
                                    <div className="loading-spinner-small">Carregando pedidos...</div>
                                ) : serviceOrders.length === 0 ? (
                                    <div className="no-clients">
                                        <p>Nenhum cliente contratou este serviço ainda.</p>
                                    </div>
                                ) : (
                                    <div className="clients-list">
                                        <table className="clients-table">
                                            <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Status</th>
                                                <th>Data</th>
                                                <th>Valor</th>
                                                <th>Avaliação</th>
                                                <th>Ações</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {serviceOrders.map(order => (
                                                <tr key={order.id}>
                                                    <td className="client-name">
                                                        {order.client?.name || 'Cliente'}
                                                        <br />
                                                        <small>{order.client?.email}</small>
                                                    </td>
                                                    <td>
                                            <span className={`order-status ${order.status?.toLowerCase()}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                                    </td>
                                                    <td>{formatDate(order.createdAt)}</td>
                                                    <td className="order-amount">
                                                        {formatPrice(order.totalAmount || selectedService.price)}
                                                    </td>
                                                    <td className="review-cell">
                                                        {order.clientRating ? (
                                                            <button
                                                                className="btn-view-review"
                                                                onClick={() => handleViewReview(order)}
                                                            >
                                                                <StarDisplay rating={order.clientRating} />
                                                                <span className="review-comment-preview">
                                                        {order.clientReview?.substring(0, 30)}
                                                                    {order.clientReview?.length > 30 ? '...' : ''}
                                                    </span>
                                                            </button>
                                                        ) : order.status === 'COMPLETED' ? (
                                                            <span className="no-review">Avaliado sem comentário</span>
                                                        ) : order.status === 'DELIVERED' ? (
                                                            <span className="badge-delivered">Aguardando avaliação</span>
                                                        ) : (
                                                            <span className="no-review">-</span>
                                                        )}
                                                    </td>
                                                    <td className="order-actions-cell">
                                                        {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                                                            <button
                                                                className="btn-deliver"
                                                                onClick={() => handleDeliverOrder(order.id)}
                                                            >
                                                                <BsBoxSeam /> Entregar
                                                            </button>
                                                        )}
                                                        {order.status === 'DELIVERED' && (
                                                            <span className="badge-delivered">Aguardando cliente</span>
                                                        )}
                                                        {order.status === 'COMPLETED' && (
                                                            <span className="badge-completed">✓ Concluído</span>
                                                        )}
                                                        {order.status === 'CANCELLED' && (
                                                            <span className="badge-cancelled">✗ Cancelado</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button className="btn-refresh" onClick={refreshServiceOrders}>
                                    🔄 Atualizar
                                </button>
                                <button className="btn-close" onClick={() => setShowClientsModal(false)}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de visualização da avaliação */}
                {/* Modal de visualização da avaliação */}
                {showReviewModal && selectedOrderDetails && (
                    <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                        <div className="review-view-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Avaliação do Cliente</h2>
                                <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                                    <BsX />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="review-details">
                                    <p className="review-client">
                                        <strong>Cliente:</strong> {selectedOrderDetails.client?.name}
                                    </p>
                                    <div className="review-rating">
                                        <strong>Avaliação:</strong>
                                        <StarDisplay rating={selectedOrderDetails.clientRating} />
                                    </div>
                                    <div className="review-comment">
                                        <strong>Comentário:</strong>
                                        <p>{selectedOrderDetails.clientReview || "Nenhum comentário fornecido."}</p>
                                    </div>
                                    <div className="review-date">
                                        <strong>Data da conclusão:</strong>
                                        <p>{formatDate(selectedOrderDetails.completedAt) || formatDate(selectedOrderDetails.updatedAt) || "Recentemente"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-refresh" onClick={async () => {
                                    await refreshServiceOrders();
                                    // Recarregar os detalhes do pedido também
                                    const updatedOrder = serviceOrders.find(o => o.id === selectedOrderDetails.id);
                                    if (updatedOrder) {
                                        setSelectedOrderDetails(updatedOrder);
                                    }
                                }}>
                                    🔄 Atualizar
                                </button>
                                <button className="btn-close" onClick={async () => {
                                    setShowReviewModal(false);
                                    await refreshServiceOrders();
                                }}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Criar/Editar Serviço */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{editingService ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
                                <button className="modal-close" onClick={() => setShowModal(false)}>
                                    <BsX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="service-form">
                                <div className="form-group">
                                    <label>Título do Serviço *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: Criação de Logo Profissional"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descrição *</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Descreva detalhadamente o que você oferece..."
                                        rows="4"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Preço (R$) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="150"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Prazo de entrega (dias) *</label>
                                        <input
                                            type="number"
                                            name="deliveryTimeDays"
                                            value={formData.deliveryTimeDays}
                                            onChange={handleChange}
                                            placeholder="7"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Categoria *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Skills (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="React, Node.js, UI/UX, Figma..."
                                    />
                                    <small>Separe cada habilidade por vírgula</small>
                                </div>

                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={submitting}>
                                        <BsCheck /> {submitting ? 'Salvando...' : (editingService ? 'Atualizar' : 'Criar')} Serviço
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Renderização para CLIENTE
    const filteredServices = selectedCategory
        ? services.filter(service => service.category === selectedCategory)
        : services;

    return (
        <div className="services-container">
            <div className="services-header">
                <h1>Serviços Disponíveis</h1>
                <p>Encontre o freelancer perfeito para o seu projeto</p>
            </div>

            <div className="category-filters">
                <button
                    className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('')}
                >
                    Todos
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.value}
                        className={`filter-chip ${selectedCategory === cat.value ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.value)}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando serviços...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={loadServices} className="btn-retry">Tentar novamente</button>
                </div>
            ) : filteredServices.length === 0 ? (
                <div className="no-services">
                    <p>Nenhum serviço disponível no momento.</p>
                </div>
            ) : (
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <div key={service.id} className="service-card">
                            <div className="service-header">
                                <h3>{service.title}</h3>
                                <span className="freelancer-name">
                                    👨‍💻 {service.freelancer?.name || "Freelancer"}
                                </span>
                            </div>

                            <p className="service-description">{service.description}</p>

                            <div className="service-details">
                                <span className="service-price">{formatPrice(service.price)}</span>
                                <span className="service-delivery">⏱️ Entrega em {service.deliveryTimeDays} dias</span>
                            </div>

                            <div className="service-category">
                                <span className="category-tag">
                                    {getCategoryIcon(service.category)} {getCategoryLabel(service.category)}
                                </span>
                            </div>

                            <div className="skills-container">
                                {service.skills?.slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="skill-tag">{skill}</span>
                                ))}
                                {service.skills?.length > 3 && (
                                    <span className="skill-tag">+{service.skills.length - 3}</span>
                                )}
                            </div>


                            <button
                                className="btn-hire"
                                onClick={() => handleHire(service.id)}
                            >
                                Contratar Agora
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Services;