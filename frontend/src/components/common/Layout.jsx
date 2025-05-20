import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';
import { Outlet } from 'react-router-dom'; // 👉 Importa esto

const Layout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          <Outlet /> {/* 👉 Este renderiza las páginas como Home.jsx */}
        </div>
      </div>
    </div>
  );
};

export default Layout;
