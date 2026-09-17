// src/pages/Home.jsx
import React from 'react';
import Header from '../components/Header'; // Seu componente existente
import Footer from '../components/Footer'; // Seu componente existente
import HeroSection from '../components/home/HeroSection';
import Categories from '../components/home/Categories';
import TrendingProducts from '../components/home/TrendingProducts';
import PromoBanner from '../components/home/PromoBanner';
import BestSellers from '../components/home/BestSellers';
import GuaranteeSection from '../components/home/GuaranteeSection';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] font-sans selection:bg-purple-500/30">
            <main>
                <HeroSection />
                <Categories />
                <TrendingProducts />
                <PromoBanner />
                <BestSellers />
                <GuaranteeSection />
            </main>
        </div>
    );
}