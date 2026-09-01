// src/pages/Deliver.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BsArrowLeft, BsCloudUpload, BsFileText, BsCheckCircle, BsDownload } from 'react-icons/bs';
import '../css/Deliver.css';

const API_URL = "http://localhost:8080";

const Deliver = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deliveryMessage, setDeliveryMessage] = useState('');
    const [deliveryFile, setDeliveryFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.role !== 'FREELANCER') {
            alert('Apenas freelancers podem acessar esta página.');
            navigate('/services');
            return;
        }

        loadOrder();
    }, [orderId, isAuthenticated, user]);

    const loadOrder = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.get(`${API_URL}/orders/${orderId}`, { headers });

            console.log("Detalhes do pedido:", response.data);
            setOrder(response.data);

            if (response.data.status !== 'PENDING' && response.data.status !== 'IN_PROGRESS') {
                setError('Este pedido não pode ser entregue pois não está em andamento.');
            }
        } catch (error) {
            console.error("Erro ao carregar pedido:", error);
            setError("Erro ao carregar informações do pedido.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) {
                alert('Arquivo muito grande. Máximo 50MB.');
                return;
            }

            const allowedTypes = ['application/zip', 'application/pdf', 'image/jpeg', 'image/png', 'application/x-rar-compressed'];
            const isValidType = allowedTypes.includes(file.type) ||
                file.name.endsWith('.zip') ||
                file.name.endsWith('.rar') ||
                file.name.endsWith('.pdf') ||
                file.name.endsWith('.jpg') ||
                file.name.endsWith('.jpeg') ||
                file.name.endsWith('.png');

            if (!isValidType) {
                alert('Tipo de arquivo não permitido. Use ZIP, RAR, PDF, JPG ou PNG.');
                return;
            }

            setDeliveryFile(file);
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!deliveryMessage.trim() && !deliveryFile) {
            alert('Adicione uma mensagem ou anexe um arquivo para entregar o serviço.');
            return;
        }

        if (!window.confirm('Tem certeza que deseja entregar este serviço? O cliente irá avaliar a entrega.')) {
            return;
        }

        setSubmitting(true);
        setUploadProgress(0);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            if (deliveryMessage.trim()) {
                formData.append('message', deliveryMessage);
            }

            if (deliveryFile) {
                formData.append('file', deliveryFile);
            }

            // Usar o endpoint correto de entrega com upload
            const response = await axios.post(
                `${API_URL}/orders/${orderId}/deliver`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percentCompleted);
                        }
                    }
                }
            );

            console.log("Entrega realizada:", response.data);
            setSuccess('Serviço entregue com sucesso! O cliente será notificado.');

            setTimeout(() => {
                navigate('/services');
            }, 2000);

        } catch (error) {
            console.error("Erro ao entregar serviço:", error);

            if (error.response?.status === 403) {
                setError('Você não tem permissão para entregar este pedido.');
            } else if (error.response?.status === 400) {
                setError(error.response.data || 'Este pedido não pode ser entregue.');
            } else {
                setError(error.response?.data || 'Erro ao entregar serviço. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = async () => {
        if (!order?.deliveryFileUrl) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/orders/${orderId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = order.deliveryFileUrl.split('/').pop() || 'arquivo_entregue';
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Erro ao baixar arquivo:", error);
            alert("Erro ao baixar o arquivo.");
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

    if (loading) {
        return (
            <div className="deliver-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando informações do pedido...</p>
                </div>
            </div>
        );
    }

    if (error && !order) {
        return (
            <div className="deliver-container">
                <div className="error-card">
                    <h2>Erro ao carregar pedido</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/services')} className="btn-back">
                        Voltar para Serviços
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="deliver-container">
            <div className="deliver-card">
                <div className="deliver-header">
                    <button className="btn-back" onClick={() => navigate('/services')}>
                        <BsArrowLeft /> Voltar
                    </button>
                    <h1>Entregar Serviço</h1>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        <BsCheckCircle /> {success}
                    </div>
                )}

                {order && (
                    <>
                        <div className="order-info">
                            <h2>Informações do Pedido</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Pedido #</label>
                                    <span>{order.id}</span>
                                </div>
                                <div className="info-item">
                                    <label>Serviço</label>
                                    <span>{order.service?.title || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Cliente</label>
                                    <span>{order.client?.name || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email do Cliente</label>
                                    <span>{order.client?.email || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Valor</label>
                                    <span className="price">{formatPrice(order.totalAmount || order.service?.price)}</span>
                                </div>
                                <div className="info-item">
                                    <label>Data do Pedido</label>
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                        {order.status === 'PENDING' ? '⏳ Pendente' :
                                            order.status === 'IN_PROGRESS' ? '🚀 Em andamento' :
                                                order.status === 'DELIVERED' ? '📦 Entregue' : order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {order.deliveryFileUrl && (
                            <div className="previous-delivery">
                                <h3>Arquivo já entregue</h3>
                                <button onClick={handleDownload} className="btn-download">
                                    <BsDownload /> Baixar arquivo entregue
                                </button>
                            </div>
                        )}

                        <div className="service-details">
                            <h3>Descrição do Serviço</h3>
                            <p>{order.service?.description || 'N/A'}</p>

                            {order.service?.skills && order.service.skills.length > 0 && (
                                <div className="skills">
                                    <strong>Skills:</strong>
                                    <div className="skills-tags">
                                        {order.service.skills.map((skill, idx) => (
                                            <span key={idx} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Só mostrar formulário se o pedido não foi entregue ainda */}
                        {order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && (
                            <form onSubmit={handleSubmit} className="delivery-form">
                                <div className="form-group">
                                    <label htmlFor="deliveryMessage">
                                        <BsFileText /> Mensagem para o cliente
                                    </label>
                                    <textarea
                                        id="deliveryMessage"
                                        value={deliveryMessage}
                                        onChange={(e) => setDeliveryMessage(e.target.value)}
                                        placeholder="Descreva o que foi entregue, instruções de uso, etc..."
                                        rows="5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deliveryFile">
                                        <BsCloudUpload /> Anexar arquivo (ZIP, PDF, imagens)
                                    </label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="deliveryFile"
                                            onChange={handleFileChange}
                                            accept=".zip,.rar,.pdf,.jpg,.jpeg,.png"
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-upload"
                                            onClick={() => document.getElementById('deliveryFile').click()}
                                        >
                                            <BsCloudUpload /> Selecionar arquivo
                                        </button>
                                        {fileName && (
                                            <span className="file-name">📎 {fileName}</span>
                                        )}
                                    </div>
                                    <small>Formatos permitidos: ZIP, RAR, PDF, JPG, PNG. Máximo 50MB.</small>
                                </div>

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="upload-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <span>{uploadProgress}% enviado</span>
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => navigate('/services')}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-submit"
                                        disabled={submitting || (order.status !== 'PENDING' && order.status !== 'IN_PROGRESS')}
                                    >
                                        {submitting ? 'Entregando...' : 'Entregar Serviço'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {order.status === 'DELIVERED' && (
                            <div className="info-message">
                                <p>✅ Serviço já entregue. Aguardando avaliação do cliente.</p>
                            </div>
                        )}

                        {order.status === 'COMPLETED' && (
                            <div className="info-message completed">
                                <p>🎉 Pedido concluído! Obrigado por trabalhar conosco.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Deliver;