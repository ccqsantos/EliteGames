import React from 'react';
import '../css/Home.css';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="badge">⚡ Lançamento 2026</span>
                    <h1>
                        O futuro do <span className="highlight">gaming</span> está aqui
                    </h1>
                    <p>
                        Equipamentos premium para elevar sua performance ao próximo nível
                    </p>
                    <div className="hero-buttons">
                        <Link to="/shop">
                            <button className="btn-primary-large">Explorar produtos</button>
                        </Link>
                        <Link to="/offers">
                            <button className="btn-outline-large">Ver ofertas</button>
                        </Link>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Produtos</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">12k</span>
                        <span className="stat-label">Clientes</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">4.9</span>
                        <span className="stat-label">Avaliação</span>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories">
                <h2>Explore <span className="highlight">categorias</span></h2>
                <div className="categories-grid">
                    <div className="category-card">
                        <div className="category-icon">🎮</div>
                        <h3>Consoles</h3>
                        <p>PlayStation, Xbox, Nintendo</p>
                    </div>
                    <div className="category-card">
                        <div className="category-icon">🖥️</div>
                        <h3>Monitores</h3>
                        <p>4K, 144Hz, Ultrawide</p>
                    </div>
                    <div className="category-card">
                        <div className="category-icon">⌨️</div>
                        <h3>Teclados</h3>
                        <p>Mecânicos, RGB, Wireless</p>
                    </div>
                    <div className="category-card">
                        <div className="category-icon">🖱️</div>
                        <h3>Mouses</h3>
                        <p>Precisão, Ultra-leves</p>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured">
                <div className="section-header">
                    <h2>Produtos em <span className="highlight">destaque</span></h2>
                    <Link to="/shop" className="see-all">Ver todos →</Link>
                </div>
                <div className="products-grid">
                    <div className="product-card">
                        <div className="product-image">
                            <span className="product-tag">Top venda</span>
                        </div>
                        <div className="product-info">
                            <h3>RTX 5090 Gaming</h3>
                            <p>24GB GDDR7, Ray Tracing</p>
                            <div className="product-price">
                                <span className="price">R$ 12.999</span>
                                <span className="installments">10x sem juros</span>
                            </div>
                            <button className="btn-add">Adicionar</button>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="product-image">
                            <span className="product-tag tag-purple">Oferta</span>
                        </div>
                        <div className="product-info">
                            <h3>Monitor 49" Ultrawide</h3>
                            <p>5120x1440, 240Hz, HDR</p>
                            <div className="product-price">
                                <span className="price">R$ 8.499</span>
                                <span className="installments">8x sem juros</span>
                            </div>
                            <button className="btn-add">Adicionar</button>
                        </div>
                    </div>

                    <div className="product-card">
                        <div className="product-image">
                            <span className="product-tag tag-new">Novo</span>
                        </div>
                        <div className="product-info">
                            <h3>Teclado Pro X</h3>
                            <p>Switch Magnético, 8000Hz</p>
                            <div className="product-price">
                                <span className="price">R$ 1.899</span>
                                <span className="installments">5x sem juros</span>
                            </div>
                            <button className="btn-add">Adicionar</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2>Por que escolher a <span className="highlight">EliteGames</span>?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Performance máxima</h3>
                        <p>Produtos selecionados para gamers exigentes</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Segurança total</h3>
                        <p>Pagamentos e garantia 100% protegidos</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Entrega rápida</h3>
                        <p>Frete expresso para todo o Brasil</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Suporte especializado</h3>
                        <p>Equipe de gamers para gamers</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-content">
                    <h2>Pronto para <span className="highlight">dominar</span> o jogo?</h2>
                    <p>Junte-se à Elite e tenha acesso aos melhores equipamentos do mercado</p>
                    <Link to="/join">
                        <button className="btn-primary-large">Tornar-se Elite →</button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;