import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BsStar, BsStarFill, BsDownload } from 'react-icons/bs';
import '../css/Projects.css';

const API_URL = "http://localhost:8080";

const Projects = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user?.role === 'CLIENT') {
            loadMyOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    const loadMyOrders = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`${API_URL}/orders/my`, { headers });

            console.log("Pedidos (orders) recebidos:", response.data);

            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Erro ao carregar pedidos:", error);
            setError("Erro ao carregar seus pedidos.");
        } finally {
            setLoading(false);
        }
    };

    // Função para cancelar pedido
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.")) {
            return;
        }

        setCancellingId(orderId);

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            await axios.delete(`${API_URL}/orders/${orderId}`, { headers });

            alert("Pedido cancelado com sucesso!");
            await loadMyOrders();

        } catch (error) {
            console.error("Erro ao cancelar pedido:", error);

            if (error.response?.status === 403) {
                alert("Você não tem permissão para cancelar este pedido.");
            } else if (error.response?.status === 400) {
                alert(error.response.data || "Apenas pedidos com status PENDING podem ser cancelados.");
            } else {
                alert(error.response?.data || "Erro ao cancelar pedido. Tente novamente.");
            }
        } finally {
            setCancellingId(null);
        }
    };

    // 🔧 Função para baixar arquivo entregue
    const handleDownloadFile = async (orderId, fileName) => {
        setDownloadingId(orderId);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/orders/${orderId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            // Criar URL do blob e forçar download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'arquivo_entregue');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert("Download iniciado!");

        } catch (error) {
            console.error("Erro ao baixar arquivo:", error);

            if (error.response?.status === 404) {
                alert("Arquivo não encontrado no servidor.");
            } else {
                alert("Erro ao baixar o arquivo. Tente novamente.");
            }
        } finally {
            setDownloadingId(null);
        }
    };

    // Função para abrir modal de avaliação
    const handleReviewOrder = (order) => {
        setSelectedOrder(order);
        setRating(0);
        setHoverRating(0);
        setReviewComment('');
        setShowReviewModal(true);
    };

    // Função para enviar avaliação
    // Projects.jsx - Função handleSubmitReview atualizada

    const handleSubmitReview = async () => {
        if (rating === 0) {
            alert("Por favor, selecione uma avaliação de 1 a 5 estrelas.");
            return;
        }

        setSubmittingReview(true);

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 🔧 Enviar avaliação para o endpoint correto
            await axios.post(
                `${API_URL}/orders/${selectedOrder.id}/review`,
                {
                    rating: rating,
                    comment: reviewComment
                },
                { headers }
            );

            alert("Avaliação enviada com sucesso! Obrigado pelo feedback.");
            setShowReviewModal(false);

            // 🔧 Recarregar a lista de pedidos para atualizar o status
            await loadMyOrders();

        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);

            // 🔧 Fallback: se o endpoint /review não existir, tenta atualizar status
            if (error.response?.status === 404) {
                try {
                    await axios.put(
                        `${API_URL}/orders/${selectedOrder.id}/status?status=COMPLETED`,
                        {},
                        { headers }
                    );
                    alert("Avaliação enviada com sucesso!");
                    setShowReviewModal(false);
                    await loadMyOrders();
                } catch (fallbackError) {
                    alert("Erro ao enviar avaliação. Tente novamente.");
                }
            } else {
                alert(error.response?.data || "Erro ao enviar avaliação. Tente novamente.");
            }
        } finally {
            setSubmittingReview(false);
        }
    };

    // Componente de estrelas
    const StarRating = ({ rating, hoverRating, onRatingChange, onHoverChange }) => {
        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                        onClick={() => onRatingChange(star)}
                        onMouseEnter={() => onHoverChange(star)}
                        onMouseLeave={() => onHoverChange(0)}
                    >
                        {star <= (hoverRating || rating) ? <BsStarFill /> : <BsStar />}
                    </span>
                ))}
            </div>
        );
    };

    // Extrair nome do arquivo da URL
    const getFileNameFromUrl = (url) => {
        if (!url) return 'arquivo_entregue';
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    // Filtro de pedidos
    const filteredOrders = orders
        .filter(order => {
            if (!selectedStatus && order.status === 'CANCELED') {
                return false;
            }
            return true;
        })
        .filter(order => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                order.service?.title?.toLowerCase().includes(search) ||
                order.service?.description?.toLowerCase().includes(search) ||
                order.service?.freelancer?.name?.toLowerCase().includes(search)
            );
        })
        .filter(order => !selectedStatus || order.status === selectedStatus);

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
            'DELIVERED': '📦 Entregue - Aguardando avaliação',
            'COMPLETED': '✅ Concluído',
            'CANCELED': '❌ Cancelado',
            'DISPUTED': '⚠️ Em disputa',
            'REFUNDED': '💰 Reembolsado'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        const classMap = {
            'PENDING': 'status-pending',
            'IN_PROGRESS': 'status-progress',
            'DELIVERED': 'status-delivered',
            'COMPLETED': 'status-completed',
            'CANCELED': 'status-cancelled'
        };
        return classMap[status] || '';
    };

    const getOrderPrice = (order) => {
        if (order.totalAmount) return order.totalAmount;
        if (order.service?.price) return order.service.price;
        if (order.price) return order.price;
        return 0;
    };

    const canCancel = (status) => {
        return status === 'PENDING';
    };

    const canReview = (status) => {
        return status === 'DELIVERED';
    };

    const hasFile = (order) => {
        return order.deliveryFileUrl && order.deliveryFileUrl.trim() !== '';
    };

    if (!isAuthenticated || user?.role !== 'CLIENT') {
        return (
            <div className="projects-container">
                <div className="not-logged-card">
                    <h2>Área exclusiva para clientes</h2>
                    <p>Faça login como cliente para visualizar seus pedidos.</p>
                    <button onClick={() => window.location.href = "/login"} className="btn-primary">
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1>Meus Pedidos</h1>
                <p>Acompanhe todos os serviços que você contratou</p>
            </div>

            <div className="search-filters">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por serviço ou freelancer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filters-row">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos os status (exceto Cancelado)</option>
                        <option value="PENDING">Pendente</option>
                        <option value="IN_PROGRESS">Em andamento</option>
                        <option value="DELIVERED">Entregue</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="CANCELED">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="projects-list">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Carregando pedidos...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p>{error}</p>
                        <button onClick={loadMyOrders} className="btn-retry">Tentar novamente</button>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="no-results">
                        {selectedStatus === 'CANCELED' ? (
                            <>
                                <p>Você não tem nenhum pedido cancelado.</p>
                                <button onClick={() => setSelectedStatus('')} className="btn-primary">
                                    Ver pedidos ativos
                                </button>
                            </>
                        ) : (
                            <>
                                <p>Você ainda não tem nenhum pedido.</p>
                                <button onClick={() => window.location.href = "/services"} className="btn-primary">
                                    Explorar Serviços
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        const orderPrice = getOrderPrice(order);
                        const showCancelButton = canCancel(order.status);
                        const showReviewButton = canReview(order.status);
                        const showDownloadButton = hasFile(order);

                        return (
                            <div key={order.id} className="project-card">
                                <div className="project-header">
                                    <div className="project-title-section">
                                        <h3>{order.service?.title || "Serviço"}</h3>
                                        <span className={`project-status ${getStatusClass(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <div className="project-budget">
                                        <span className="budget-amount">
                                            {formatPrice(orderPrice)}
                                        </span>
                                        <span className="budget-type">
                                            Pedido #{order.id}
                                        </span>
                                    </div>
                                </div>

                                <p className="project-description">
                                    {order.service?.description || "Descrição não disponível"}
                                </p>

                                <div className="skills-container">
                                    {order.service?.skills?.map((skill, index) => (
                                        <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                </div>

                                {/* 🔧 Mensagem de entrega do freelancer */}
                                {order.deliveryMessage && (
                                    <div className="delivery-message">
                                        <strong>📝 Mensagem do freelancer:</strong>
                                        <p>{order.deliveryMessage}</p>
                                    </div>
                                )}

                                <div className="project-footer">
                                    <div className="project-meta">
                                        <div className="client-info">
                                            <span className="client-name">
                                                👨‍💻 {order.service?.freelancer?.name || "Freelancer"}
                                            </span>
                                        </div>
                                        <div className="project-stats">
                                            <span className="stat">
                                                📅 Criado: {formatDate(order.createdAt)}
                                            </span>
                                            {order.service?.deliveryTimeDays && (
                                                <span className="stat">
                                                    ⏱️ Prazo: {order.service.deliveryTimeDays} dias
                                                </span>
                                            )}
                                            {order.deliveredAt && (
                                                <span className="stat">
                                                    📦 Entregue: {formatDate(order.deliveredAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        {showDownloadButton && (
                                            <button
                                                className="btn-download-file"
                                                onClick={() => handleDownloadFile(order.id, getFileNameFromUrl(order.deliveryFileUrl))}
                                                disabled={downloadingId === order.id}
                                            >
                                                <BsDownload /> {downloadingId === order.id ? 'Baixando...' : 'Baixar Arquivo'}
                                            </button>
                                        )}

                                        {showCancelButton && (
                                            <button
                                                className="btn-cancel-order"
                                                onClick={() => handleCancelOrder(order.id)}
                                                disabled={cancellingId === order.id}
                                            >
                                                {cancellingId === order.id ? 'Cancelando...' : '❌ Cancelar Pedido'}
                                            </button>
                                        )}

                                        {showReviewButton && (
                                            <button
                                                className="btn-review-order"
                                                onClick={() => handleReviewOrder(order)}
                                            >
                                                ⭐ Avaliar Entrega
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de Avaliação */}
            {showReviewModal && selectedOrder && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h2>Avaliar Serviço</h2>
                            <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div className="review-modal-body">
                            <div className="review-service-info">
                                <h3>{selectedOrder.service?.title}</h3>
                                <p className="review-freelancer">
                                    Freelancer: {selectedOrder.service?.freelancer?.name}
                                </p>
                            </div>

                            {/* Mensagem do freelancer no modal de avaliação */}
                            {selectedOrder.deliveryMessage && (
                                <div className="review-delivery-message">
                                    <label>Mensagem do freelancer:</label>
                                    <p>{selectedOrder.deliveryMessage}</p>
                                </div>
                            )}

                            <div className="review-rating-section">
                                <label>Sua avaliação:</label>
                                <StarRating
                                    rating={rating}
                                    hoverRating={hoverRating}
                                    onRatingChange={setRating}
                                    onHoverChange={setHoverRating}
                                />
                                <div className="rating-label">
                                    {rating === 1 && "⭐ Muito Ruim"}
                                    {rating === 2 && "⭐⭐ Ruim"}
                                    {rating === 3 && "⭐⭐⭐ Regular"}
                                    {rating === 4 && "⭐⭐⭐⭐ Bom"}
                                    {rating === 5 && "⭐⭐⭐⭐⭐ Excelente!"}
                                </div>
                            </div>

                            <div className="review-comment-section">
                                <label>Comentário (opcional):</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Conte sobre sua experiência com este serviço..."
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="review-modal-footer">
                            <button className="btn-cancel" onClick={() => setShowReviewModal(false)}>
                                Cancelar
                            </button>
                            <button
                                className="btn-submit-review"
                                onClick={handleSubmitReview}
                                disabled={submittingReview || rating === 0}
                            >
                                {submittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;