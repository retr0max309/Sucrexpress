'use client';
import React from 'react';
import Image from 'next/image';
import { 
  IoHomeOutline, 
  IoAddCircleOutline, 
  IoListOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline,
  IoAlertCircleOutline,
  IoMapOutline
} from 'react-icons/io5';
import '../../assets/styles/adminSidebar.css';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', icon: IoHomeOutline, label: 'Dashboard' },
    { id: 'nuevo-paquete', icon: IoAddCircleOutline, label: 'Nuevo Paquete' },
    { id: 'lista-paquetes', icon: IoListOutline, label: 'Lista de Paquetes' },
    { id: 'repartidores', icon: IoPeopleOutline, label: 'Repartidores' },
    { id: 'incidencias', icon: IoAlertCircleOutline, label: 'Incidencias' },
    { id: 'logistica', icon: IoMapOutline, label: 'Logística' },
    { id: 'reportes', icon: IoStatsChartOutline, label: 'Reportes' },
  ];

  return (
    <div className="admin-sidebar">
      {/* Logo Section */}
      <div className="admin-sidebar-logo">
        <div className="admin-logo-container">
          <Image src="/logo.png" alt="SucreExpress" className="admin-logo-img" width={60} height={60} />
        </div>
        <h5 className="admin-logo-title">Panel Admin</h5>
        <div className="admin-sidebar-divider"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`admin-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <div className="admin-sidebar-item-content">
              <item.icon className="admin-sidebar-icon" />
              <span className="admin-sidebar-label">{item.label}</span>
            </div>
            {activeSection === item.id && <div className="admin-sidebar-indicator"></div>}
          </button>
        ))}
      </nav>

      
    </div>
  );
};

export default AdminSidebar;
