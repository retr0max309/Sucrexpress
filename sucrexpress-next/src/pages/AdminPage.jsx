'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardHome from '../components/admin/DashboardHome';
import NuevoPaquete from '../components/admin/NuevoPaquete';
import ListaPaquetes from '../components/admin/ListaPaquetes';
import ListaRepartidores from '../components/admin/ListaRepartidores';
import ListaIncidencias from '../components/admin/ListaIncidencias';
import Reportes from '../components/admin/Reportes';
import LogisticaPanel from '../components/admin/LogisticaPanel';
import BandejaEntrada from '../components/inbox/BandejaEntrada';
import NotificationsContainer from '../components/notifications/NotificationsContainer';
import '../assets/styles/admin.css';

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeAdminSection') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeAdminSection', activeSection);
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'nuevo-paquete':
        return <NuevoPaquete />;
      case 'lista-paquetes':
        return <ListaPaquetes />;
      case 'repartidores':
        return <ListaRepartidores />;
      case 'incidencias':
        return <ListaIncidencias />;
      case 'logistica':
        return <LogisticaPanel />;
      case 'reportes':
        return <Reportes />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-container">
      <BandejaEntrada />
      <NotificationsContainer />
      <AdminSidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      <div className="admin-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminPage;
