import Header from './Header';
import Footer from './Footer';
import '../css/Layout.css';
import { Outlet } from 'react-router-dom';
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="layout">
        <Header />
      <main className="main-content">
        <Outlet/>
      </main>
        <Footer />
    </div>
  );
};

export default Layout;