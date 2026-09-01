import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Freelancers.css';

const API_URL = "http://localhost:8080";

// Categorias para filtro
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

const Freelancers = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.get(`${API_URL}/services`, { headers });

            console.log("Serviços carregados (detalhado):", response.data);

            if (response.data && Array.isArray(response.data)) {
                setServices(response.data);
            } else {
                setServices([]);
            }
        } catch (error) {
            console.error("Erro ao carregar serviços:", error);
            setError("Erro ao carregar serviços. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // 🔧 Função para obter o preço do serviço
    const getServicePrice = (service) => {
        // Tenta diferentes campos onde o preço pode estar
        if (service.price) return service.price;
        if (service.basicPrice) return service.basicPrice;
        if (service.amount) return service.amount;
        if (service.value) return service.value;
        return 0;
    };

    const filteredServices = services
        .filter(service => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                service.title?.toLowerCase().includes(search) ||
                service.description?.toLowerCase().includes(search) ||
                service.skills?.some(s => s.toLowerCase().includes(search)) ||
                service.freelancer?.name?.toLowerCase().includes(search)
            );
        })
        .filter(service => !selectedCategory || service.category === selectedCategory);

    const formatPrice = (price) => {
        // 🔧 Verifica se price existe e é um número válido
        if (!price && price !== 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
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
            await axios.post(
                `${API_URL}/orders?serviceId=${serviceId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Serviço contratado com sucesso!");
            window.location.href = "/projects";
        } catch (error) {
            console.error("Erro ao contratar:", error);
            alert(error.response?.data || "Erro ao contratar serviço.");
        }
    };

    if (loading) {
        return (
            <div className="freelancers-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Carregando serviços...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="freelancers-container">
            <div className="freelancers-header">
                <h1>Serviços Disponíveis</h1>
                <p>Encontre o freelancer perfeito para o seu projeto</p>
            </div>

            <div className="filters-section">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar serviços por título, freelancer ou habilidades..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>

                <div className="filters-row">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todas as categorias</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="freelancers-grid">
                {filteredServices.length === 0 ? (
                    <div className="no-results">
                        <p>Nenhum serviço encontrado.</p>
                    </div>
                ) : (
                    filteredServices.map(service => {
                        const servicePrice = getServicePrice(service);
                        console.log(`Serviço ${service.id} - Preço:`, servicePrice, 'Dados completos:', service);

                        return (
                            <div key={service.id} className="freelancer-card">
                                <div className="freelancer-avatar">
                                    {service.freelancer?.name?.charAt(0) || '👤'}
                                </div>
                                <div className="freelancer-info">
                                    <h3>{service.title}</h3>
                                    <p className="freelancer-role">
                                        {service.freelancer?.name || "Freelancer"}
                                    </p>
                                    <p className="freelancer-description">
                                        {service.description?.substring(0, 100)}...
                                    </p>

                                    <div className="skills-container">
                                        {service.skills?.slice(0, 3).map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                        {service.skills?.length > 3 && (
                                            <span className="skill-tag">+{service.skills.length - 3}</span>
                                        )}
                                    </div>

                                    <div className="freelancer-stats">
                                        <div className="stat">
                                            <span className="stat-value">{formatPrice(servicePrice)}</span>
                                            <span className="stat-label">preço fixo</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">⭐ {service.averageRating || 0}</span>
                                            <span className="stat-label">avaliação</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{service.ordersCompleted || 0}</span>
                                            <span className="stat-label">contratados</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">{service.deliveryTimeDays || 7} dias</span>
                                            <span className="stat-label">entrega</span>
                                        </div>
                                    </div>

                                    <button
                                        className="btn-hire"
                                        onClick={() => handleHire(service.id)}
                                        disabled={user?.role === 'FREELANCER'}
                                    >
                                        {user?.role === 'FREELANCER' ? 'Você é freelancer' : 'Contratar agora'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Freelancers;