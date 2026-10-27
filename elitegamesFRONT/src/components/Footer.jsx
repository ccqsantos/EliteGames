import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/elitegames_logo2_outline.png";
import {
    FaDiscord,
    FaInstagram,
    FaTwitch,
    FaTwitter,
    FaYoutube
} from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-[#050505] text-gray-400 py-15 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Grid Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">

                    {/* Brand Section (Ocupa 2 colunas no desktop) */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt="EliteGames Logo"
                                className="h-9 w-9"
                            />
                            <span className="text-xl font-bold text-white">
                                Elite<span className="text-purple-500">Games</span>
                            </span>
                        </Link>
                        <p className="text-sm max-w-xs leading-relaxed">
                            A plataforma definitiva para gamers que buscam performance e qualidade em equipamentos premium.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <span className="text-xs bg-[#141414] border border-gray-800 px-2 py-1 rounded text-gray-300">
                                🏆 12k+ Clientes
                            </span>
                            <span className="text-xs bg-[#141414] border border-gray-800 px-2 py-1 rounded text-gray-300">
                                ⭐ 4.9 Avaliação
                            </span>
                        </div>
                    </div>

                    {/* Produtos */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Produtos</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/shop/consoles" className="hover:text-purple-400 transition">Consoles</Link></li>
                            <li><Link to="/shop/monitors" className="hover:text-purple-400 transition">Monitores</Link></li>
                            <li><Link to="/shop/keyboards" className="hover:text-purple-400 transition">Teclados</Link></li>
                            <li><Link to="/shop/mice" className="hover:text-purple-400 transition">Mouses</Link></li>
                            <li><Link to="/shop/headsets" className="hover:text-purple-400 transition">Headsets</Link></li>
                        </ul>
                    </div>

                    {/* Suporte */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Suporte</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/help" className="hover:text-purple-400 transition">Central de ajuda</Link></li>
                            <li><Link to="/contact" className="hover:text-purple-400 transition">Contato</Link></li>
                            <li><Link to="/faq" className="hover:text-purple-400 transition">Perguntas frequentes</Link></li>
                            <li><Link to="/warranty" className="hover:text-purple-400 transition">Garantia</Link></li>
                            <li><Link to="/returns" className="hover:text-purple-400 transition">Trocas e devoluções</Link></li>
                        </ul>
                    </div>

                    {/* Empresa */}
                    <div>
                        <h4 className="text-white font-semibold text-sm mb-4">Empresa</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-purple-400 transition">Sobre nós</Link></li>
                            <li><Link to="/blog" className="hover:text-purple-400 transition">Blog</Link></li>
                            <li><Link to="/careers" className="hover:text-purple-400 transition">Carreiras</Link></li>
                            <li><Link to="/terms" className="hover:text-purple-400 transition">Termos de uso</Link></li>
                            <li><Link to="/privacy" className="hover:text-purple-400 transition">Política de privacidade</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter (Mais compacta) */}
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-white font-semibold text-lg">📬 Fique por dentro</h3>
                        <p className="text-sm text-gray-500 mt-1">Receba ofertas exclusivas e novidades antes de todo mundo.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input
                            type="email"
                            placeholder="Seu melhor e-mail"
                            className="bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition w-full md:w-64"
                        />
                        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition whitespace-nowrap">
                            Inscrever
                        </button>
                    </div>
                </div>

                {/* Rodapé Inferior */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-gray-800 gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs text-gray-500">
                        <p>&copy; 2026 EliteGames. Todos os direitos reservados.</p>
                        <div className="hidden md:block text-gray-700">|</div>
                        <div className="flex gap-3">
                            <Link to="/terms" className="hover:text-white transition">Termos</Link>
                            <Link to="/privacy" className="hover:text-white transition">Privacidade</Link>
                            <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
                        </div>
                    </div>

                    {/* Ícones Sociais no tamanho 30 */}
                    <div className="flex gap-4 text-gray-500">
                        <a href="#" className="hover:text-purple-500 transition" aria-label="YouTube"><FaYoutube size={30}/></a>
                        <a href="#" className="hover:text-purple-500 transition" aria-label="Twitter"><FaTwitter size={30}/></a>
                        <a href="#" className="hover:text-purple-500 transition" aria-label="Instagram"><FaInstagram size={30}/></a>
                        <a href="#" className="hover:text-purple-500 transition" aria-label="Discord"><FaDiscord size={30}/></a>
                        <a href="#" className="hover:text-purple-500 transition" aria-label="Twitch"><FaTwitch size={30}/></a>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;