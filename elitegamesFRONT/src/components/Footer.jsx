import React from 'react';
import '../css/Footer.css';
import { Link } from 'react-router-dom';
import logo from "../assets/elitegames_logo2_outline.png"
import {FaDiscord, FaInstagram, FaTwitch, FaTwitter, FaYoutube} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-section brand-section">
                        <div className="logo">
                            <span className="logo-icon"><img src={logo} alt={"logo EliteGames"} style={{height: 45, width: 45}}/></span>
                            <span className="logo-text-footer">
                Elite<span className="logo-highlight">Games</span>
              </span>
                        </div>
                        <p className="footer-description">
                            A plataforma definitiva para gamers que buscam performance e qualidade em equipamentos premium.
                        </p>
                        <div className="footer-badges">
                            <span className="badge">🏆 12k+ Clientes</span>
                            <span className="badge">⭐ 4.9 Avaliação</span>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="footer-section">
                        <h4>Produtos</h4>
                        <ul>
                            <li><Link className="nav-link" to="/shop/consoles">Consoles</Link></li>
                            <li><Link className="nav-link" to="/shop/monitors">Monitores</Link></li>
                            <li><Link className="nav-link" to="/shop/keyboards">Teclados</Link></li>
                            <li><Link className="nav-link" to="/shop/mice">Mouses</Link></li>
                            <li><Link className="nav-link" to="/shop/headsets">Headsets</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="footer-section">
                        <h4>Suporte</h4>
                        <ul>
                            <li><Link className="nav-link" to="/help">Central de ajuda</Link></li>
                            <li><Link className="nav-link" to="/contact">Contato</Link></li>
                            <li><Link className="nav-link" to="/faq">Perguntas frequentes</Link></li>
                            <li><Link className="nav-link" to="/warranty">Garantia</Link></li>
                            <li><Link className="nav-link" to="/returns">Trocas e devoluções</Link></li>
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div className="footer-section">
                        <h4>Empresa</h4>
                        <ul>
                            <li><Link className="nav-link" to="/about">Sobre nós</Link></li>
                            <li><Link className="nav-link" to="/blog">Blog</Link></li>
                            <li><Link className="nav-link" to="/careers">Carreiras</Link></li>
                            <li><Link className="nav-link" to="/terms">Termos de uso</Link></li>
                            <li><Link className="nav-link" to="/privacy">Política de privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="footer-newsletter">
                    <div className="newsletter-content">
                        <div className="newsletter-text">
                            <h3>📬 Fique por dentro</h3>
                            <p>Receba ofertas exclusivas e novidades antes de todo mundo</p>
                        </div>
                        <div className="newsletter-form">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="newsletter-input"
                            />
                            <button className="newsletter-btn">Inscrever</button>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            &copy; 2026 EliteGames. Todos os direitos reservados.
                        </p>
                        <div className="footer-bottom-links">
                            <Link to="/terms" className="bottom-link">Termos</Link>
                            <span className="link-divider">|</span>
                            <Link to="/privacy" className="bottom-link">Privacidade</Link>
                            <span className="link-divider">|</span>
                            <Link to="/cookies" className="bottom-link">Cookies</Link>
                        </div>
                    </div>
                    <div className="social-links">
                        <a href="#" className="social-link" aria-label="YouTube">
                            <FaYoutube size={20}/>
                        </a>
                        <a href="#" className="social-link" aria-label="Twitter">
                            <FaTwitter size={20}/>
                        </a>
                        <a href="#" className="social-link" aria-label="Instagram">
                            <FaInstagram size={20}/>
                        </a>
                        <a href="#" className="social-link" aria-label="Discord">
                            <FaDiscord size={20}/>
                        </a>
                        <a href="#" className="social-link" aria-label="Twitch">
                            <FaTwitch size={20}/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;