'use client';
import { useState, useEffect } from 'react';
import { incidenciasService } from '../../services/incidenciasService';
import { FiPackage, FiUser, FiAlertTriangle, FiImage, FiCalendar } from 'react-icons/fi';

export default function IncidenciaDetailModal({ isOpen, incidencia, onClose, onResponder }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !incidencia) return null;

  const formatFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecuperarLabel = (valor) => {
    if (valor === true) return 'Sí';
    if (valor === false) return 'No';
    return 'No especificado';
  };

  const getTipoIncidencia = (tipo) => {
    const tipos = {
      'falla_vehiculo': 'Falla Vehículo',
      'accidente_transito': 'Accidente de Tránsito',
      'retencion_policial': 'Retención Policial',
      'destinatario_ausente': 'Destinatario Ausente',
      'direccion_incorrecta': 'Dirección Incorrecta',
      'paquete_danado': 'Paquete Dañado',
      'otra': 'Otra'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'respondida': 'Respondida',
      'resuelta': 'Resuelta',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-detalle-incidencia" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles de Incidencia</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* INFORMACIÓN DEL PAQUETE */}
          <div className="detalle-section">
            <h3><FiPackage style={{ display: 'inline-block', marginRight: '0.5rem' }} /> Información del Paquete</h3>
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="label">Número Guía:</span>
                <span className="value highlight">{incidencia.numero_guia || 'No disponible'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Destinatario:</span>
                <span className="value">{incidencia.nombre_destinatario || 'No disponible'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Dirección:</span>
                <span className="value">{incidencia.direccion_entrega || 'No disponible'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Teléfono:</span>
                <span className="value">{incidencia.telefono_destinatario || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL REPARTIDOR */}
          <div className="detalle-section">
            <h3><FiUser style={{ display: 'inline-block', marginRight: '0.5rem' }} /> Información del Repartidor</h3>
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="label">Nombre:</span>
                <span className="value highlight">{incidencia.repartidor_nombre || 'No disponible'}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Ciudad:</span>
                <span className="value">{incidencia.repartidor_ciudad || 'No disponible'}</span>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DE LA INCIDENCIA */}
          <div className="detalle-section incidencia-seccion">
            <h3><FiAlertTriangle style={{ display: 'inline-block', marginRight: '0.5rem' }} /> Información de la Incidencia</h3>
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="label">Tipo:</span>
                <span className="value badge-tipo">{getTipoIncidencia(incidencia.tipo_incidencia)}</span>
              </div>
              <div className="detalle-item">
                <span className="label">¿Se recuperará?:</span>
                <span className="value">{getRecuperarLabel(incidencia.se_recuperara)}</span>
              </div>
              <div className="detalle-item">
                <span className="label">Estado:</span>
                <span className={`value badge-estado badge-${incidencia.estado}`}>
                  {getEstadoLabel(incidencia.estado)}
                </span>
              </div>
              <div className="detalle-item full">
                <span className="label">Descripción:</span>
                <span className="value descripcion-box">
                  {incidencia.descripcion && incidencia.descripcion.trim() 
                    ? incidencia.descripcion 
                    : 'Descripción no proporcionada'}
                </span>
              </div>
            </div>
          </div>

          {/* FOTO DE EVIDENCIA */}
          {incidencia.foto_evidencia_url && (
            <div className="detalle-section">
              <h3><FiImage style={{ display: 'inline-block', marginRight: '0.5rem' }} /> Foto de Evidencia</h3>
              <div className="foto-evidencia">
                <img
                  src={incidencia.foto_evidencia_url}
                  alt="Evidencia de incidencia"
                  className="img-evidencia"
                />
              </div>
            </div>
          )}

          {/* FECHA DE REPORTE */}
          <div className="detalle-section">
            <h3><FiCalendar style={{ display: 'inline-block', marginRight: '0.5rem' }} /> Información Administrativa</h3>
            <div className="detalle-grid">
              <div className="detalle-item">
                <span className="label">Fecha de Reporte:</span>
                <span className="value">{formatFecha(incidencia.fecha_reporte)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>
          {(incidencia.estado === 'pendiente' || incidencia.estado === 'respondida') && (
            <button onClick={onResponder} className="btn btn-primary">
              Responder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
