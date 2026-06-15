'use client';
  // frontend/src/components/admin/DashboardHome.jsx
  import React, { useEffect, useState } from 'react';
  import {
    IoCubeOutline,
    IoCheckmarkCircleOutline,
    IoCarSportOutline,
    IoCloseCircleOutline,
    IoTrendingUp,
    IoTimeOutline
  } from 'react-icons/io5';
// Importa el cliente de Supabase
import { supabase } from '../../utils/supabaseClient';
  const DashboardHome = () => {
    const [paquetes, setPaquetes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
      total: 0,
      exitosos: 0,
      transito: 0,
      pendientes: 0,
      tendenciaTotal: 0,
      tendenciaExitosos: 0,
      tendenciaTransito: 0,
      tendenciaPendientes: 0,
    });

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        setLoading(true);
        // Primero intentamos una consulta simple para verificar la conexión
        const { data, error } = await supabase
          .from('paquetes')
          .select(`
            id,
            numero_guia,
            nombre_destinatario,
            ciudad_destino,
            direccion_exacta,
            estado,
            repartidor_id,
            repartidor_nombre,
            fecha_creacion,
            fecha_asignacion,
            fecha_entrega,
            created_at,
            updated_at
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error) {
          console.error('Error al obtener paquetes:', error.message);
          // Mostrar mensaje más específico según el error
          if (error.code === 'PGRST301') {
            console.error('Error de autenticación con Supabase');
          } else if (error.code === 'PGRST302') {
            console.error('Error de permisos en la tabla');
          } else if (error.code === '42P01') {
            console.error('La tabla no existe');
          } else {
            console.error('Error desconocido:', error.code, error.message);
          }
          return;
        }

        if (data) {
          console.log('Datos recibidos de Supabase:', data);
          // Formatea los datos antes de guardarlos
          const paquetesFormateados = data.map(pkg => ({
            ...pkg,
            // Asegúrate de que los campos críticos existan
            numero_guia: pkg.numero_guia || 'Sin asignar',
            nombre_destinatario: pkg.nombre_destinatario || 'Sin asignar',
            estado: pkg.estado || 'Pendiente',
            repartidor_nombre: pkg.repartidor_nombre || 'Sin asignar',
            ciudad_destino: pkg.ciudad_destino || 'Sin asignar',
            direccion_exacta: pkg.direccion_exacta || 'Sin dirección'
          }));
          setPaquetes(paquetesFormateados);
          // Actualizar estadísticas
          const total = data.length;
          const exitosos = data.filter(p => p.estado?.toLowerCase() === 'entregado').length;
          const transito = data.filter(p => p.estado?.toLowerCase() === 'en_ruta').length;
          const pendientes = data.filter(p => p.estado?.toLowerCase() === 'pendiente').length;

          setEstadisticas({
            total,
            exitosos,
            transito,
            pendientes,
            tendenciaTotal: 0,
            tendenciaExitosos: 0,
            tendenciaTransito: 0,
            tendenciaPendientes: 0,
          });
        }
      } catch (error) {
        console.error('Error en fetchPaquetes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Auto-refresh cada 5 segundos para mantener datos actualizados
    fetchPaquetes();
    const interval = setInterval(fetchPaquetes, 5000);
    
    return () => clearInterval(interval);
  }, []);

    // Los 7 más recientes
    const recientes = paquetes.slice(0, 7);

    return (
      <div className="admin-dashboard">
        {/* Header Section */}
        <div className="admin-dashboard-header">
          <div className="header-content">
            <h2 className="dashboard-title">Panel de Control</h2>
            <p className="dashboard-subtitle">
              Resumen general de operaciones y métricas clave
            </p>
          </div>
          <div className="header-actions">
            <div className="date-display">
              <IoTimeOutline className="date-icon" />
              <span>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card" style={{ borderColor: '#3b82f6' }}>
            <div className="stat-header">
              <div className="admin-stat-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}><IoCubeOutline size={24} /></div>
              <div className="trend-indicator" style={{ color: '#10b981' }}><IoTrendingUp size={16} /><span>{estadisticas.tendenciaTotal}%</span></div>
            </div>
            <div className="admin-stat-content">
              <h3 className="admin-stat-value" style={{ color: '#3b82f6' }}>{estadisticas.total}</h3>
              <p className="admin-stat-title">Total de Envíos</p>
              <p className="admin-stat-description">Total de paquetes registrados hoy</p>
            </div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: '#10b981' }}>
            <div className="stat-header">
              <div className="admin-stat-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}><IoCheckmarkCircleOutline size={24} /></div>
              <div className="trend-indicator" style={{ color: '#10b981' }}><IoTrendingUp size={16} /><span>{estadisticas.tendenciaExitosos}%</span></div>
            </div>
            <div className="admin-stat-content">
              <h3 className="admin-stat-value" style={{ color: '#10b981' }}>{estadisticas.exitosos}</h3>
              <p className="admin-stat-title">Entregas Exitosas</p>
              <p className="admin-stat-description">Paquetes entregados satisfactoriamente</p>
            </div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: '#f59e0b' }}>
            <div className="stat-header">
              <div className="admin-stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}><IoCarSportOutline size={24} /></div>
              <div className="trend-indicator" style={{ color: '#ef4444' }}><IoTrendingUp size={16} /><span>{estadisticas.tendenciaTransito}%</span></div>
            </div>
            <div className="admin-stat-content">
              <h3 className="admin-stat-value" style={{ color: '#f59e0b' }}>{estadisticas.transito}</h3>
              <p className="admin-stat-title">En Ruta</p>
              <p className="admin-stat-description">Paquetes en proceso de entrega</p>
            </div>
          </div>
          <div className="admin-stat-card" style={{ borderColor: '#ef4444' }}>
            <div className="stat-header">
              <div className="admin-stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><IoCloseCircleOutline size={24} /></div>
              <div className="trend-indicator" style={{ color: '#ef4444' }}><IoTrendingUp size={16} /><span>{estadisticas.tendenciaPendientes}%</span></div>
            </div>
            <div className="admin-stat-content">
              <h3 className="admin-stat-value" style={{ color: '#ef4444' }}>{estadisticas.pendientes}</h3>
              <p className="admin-stat-title">Entregas Pendientes</p>
              <p className="admin-stat-description">Paquetes con entrega fallida</p>
            </div>
          </div>
        </div>

        {/* Tabla de Paquetes Recientes */}
        <div className="admin-table-section">
          <div className="section-header">
            <h3 className="section-title">Paquetes Recientes</h3>
            <button className="view-all-button">Ver todos los paquetes</button>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
    <tr>
      <th>Nro. Guía</th>
      <th>Remitente</th>
      <th>Destinatario</th>
      <th>Estado</th>
      <th>Ubicación</th>
      <th>Fecha y Hora</th>
      <th>Repartidor</th>
    </tr>
  </thead>
  <tbody>
    {loading
      ? <tr><td colSpan={7}>Cargando...</td></tr>
      : recientes.length === 0
        ? <tr><td colSpan={7}>No hay paquetes registrados</td></tr>
        : recientes.map((pkg, idx) => (
            <tr key={pkg.id || idx}>
              <td className="package-code">
                {pkg.numero_guia || 'Sin asignar'}
              </td>
              <td>
                {'Por implementar'} {/* El remitente no está en la tabla actual */}
              </td>
              <td>
                {pkg.nombre_destinatario || 'Sin asignar'}
              </td>
              <td>
                <span className={`status-badge status-${pkg.estado?.toLowerCase().replace(/ /g, '-') || 'pendiente'}`}>
                  {pkg.estado?.toUpperCase().replace(/_/g, ' ') || 'PENDIENTE'}
                </span>
              </td>
              <td>
                {pkg.ciudad_destino ? `${pkg.ciudad_destino} - ${pkg.direccion_exacta || ''}` : 'Sin ubicación'}
              </td>
              <td className="datetime-cell">
                {pkg.created_at ? (
                  <>
                    <span className="date">{new Date(pkg.created_at).toLocaleDateString('es-ES')}</span>
                    <span className="time">{new Date(pkg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : 'Fecha no disponible'}
              </td>
              <td>
                {pkg.repartidor_nombre || 'Sin asignar'}
              </td>
            </tr>
          ))}
  </tbody>

            </table>
          </div>
        </div>
      </div>
    );
  };

  export default DashboardHome;
