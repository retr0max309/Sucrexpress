'use client';
import { useState, useEffect, useRef } from 'react';
import { useInboxStore } from '../../store/inboxStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import { sincronizacionesService } from '../../services/sincronizacionesService';
import '../../assets/styles/bandejaEntrada.css';

export default function BandejaEntrada() {
  const [isOpen, setIsOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const dropdownRef = useRef(null);
  const ultimoTimestampRef = useRef(new Date().toISOString());

  const {
    items,
    setSincronizaciones
  } = useInboxStore();

  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    cargarInicial();

    const interval = setInterval(() => {
      verificarCambios();
    }, 6000);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cargarInicial = async () => {
    try {
      setCargando(true);
      const response = await sincronizacionesService.getSincronizaciones(10);
      if (response.success && response.data) {
        setSincronizaciones(response.data);
        if (response.data.length > 0) {
          ultimoTimestampRef.current = response.data[0].timestamp;
        }
      }
    } catch (error) {
      console.error('Error cargando sincronizaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const verificarCambios = async () => {
    try {
      const response = await sincronizacionesService.getCambiosDesde(ultimoTimestampRef.current);
      if (response.success && response.hay_cambios && response.data) {
        const { addItem } = useInboxStore.getState();
        
        response.data.forEach(item => {
          addItem(item);
          mostrarNotificacion(item);
        });

        if (response.data.length > 0) {
          ultimoTimestampRef.current = response.data[0].timestamp;
        }
      }
    } catch (error) {
      console.error('Error verificando cambios:', error);
    }
  };

  const mostrarNotificacion = (item) => {
    let titulo = '';
    let mensaje = '';

    if (item.tipo === 'paquete') {
      titulo = `Paquete ${item.estado}`;
      mensaje = `${item.numero_guia} - ${item.destinatario}, ${item.ciudad}`;
    } else if (item.tipo === 'incidencia') {
      titulo = `Incidencia ${item.estado_incidencia}`;
      mensaje = `${item.numero_guia} - ${item.repartidor}`;
    }

    addNotification({
      tipo: item.tipo,
      tipo_evento: item.tipo_evento,
      titulo,
      mensaje,
      icono_fa: item.icono_fa
    });
  };

  const handleItemClick = (item) => {
    if (item.tipo === 'paquete') {
      localStorage.setItem('activeAdminSection', 'lista-paquetes');
      window.location.href = '/admin';
    } else if (item.tipo === 'incidencia') {
      localStorage.setItem('activeAdminSection', 'incidencias');
      window.location.href = '/admin';
    }
    setIsOpen(false);
  };

  return (
    <div className="bandeja-entrada-wrapper" ref={dropdownRef}>
      <button
        className="bandeja-entrada-icon"
        onClick={() => setIsOpen(!isOpen)}
        title="Bandeja de entrada"
        aria-label="Abrir bandeja de entrada"
      >
        <i className="fas fa-inbox"></i>
        {items.length > 0 && <span className="bandeja-badge">{items.length}</span>}
      </button>

      {isOpen && (
        <div className="bandeja-dropdown">
          <div className="bandeja-header">
            <h3>Últimas Sincronizaciones</h3>
            <button 
              className="btn-cerrar" 
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar bandeja"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {cargando && items.length === 0 ? (
            <div className="bandeja-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="bandeja-vacia">
              <i className="fas fa-inbox"></i>
              <p>No hay sincronizaciones</p>
            </div>
          ) : (
            <div className="bandeja-lista">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`bandeja-item bandeja-${item.tipo}`}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                >
                  <div className="item-icono">
                    <i className={item.icono_fa}></i>
                  </div>
                  <div className="item-contenido">
                    <p className="item-numero-guia">{item.numero_guia}</p>
                    <p className="item-descripcion">
                      {item.tipo === 'paquete' 
                        ? `${item.destinatario} - ${item.ciudad}`
                        : `${item.repartidor} - ${item.tipo_incidencia}`
                      }
                    </p>
                    <div className="item-footer">
                      <span className={`item-estado badge-${item.tipo_evento}`}>
                        {item.tipo === 'paquete' ? item.estado : item.estado_incidencia}
                      </span>
                      <span className="item-hora">
                        {formatearHora(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatearHora(timestamp) {
  const fecha = new Date(timestamp);
  const ahora = new Date();
  const diferencia = (ahora - fecha) / 1000;

  if (diferencia < 60) return 'Hace segundos';
  if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)}m`;
  if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)}h`;

  return fecha.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
