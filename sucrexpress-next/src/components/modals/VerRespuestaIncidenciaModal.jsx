'use client';
import React from 'react';
import { FiX, FiFileText, FiCheckCircle, FiAlertCircle, FiCalendar, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import '../../assets/styles/modals.css';

const VerRespuestaIncidenciaModal = ({ isOpen, incidencia, onClose }) => {
  if (!isOpen || !incidencia) return null;

  if (isOpen && incidencia) {
    console.log('[VER_RESPUESTA_MODAL] Modal abierto');
    console.log('[VER_RESPUESTA_MODAL] Datos de incidencia recibidos:');
    console.log('[VER_RESPUESTA_MODAL]   - ID:', incidencia.id);
    console.log('[VER_RESPUESTA_MODAL]   - numero_guia:', incidencia.numero_guia);
    console.log('[VER_RESPUESTA_MODAL]   - tipo_respuesta:', incidencia.tipo_respuesta);
    console.log('[VER_RESPUESTA_MODAL]   - respuesta_admin:', incidencia.respuesta_admin ? 'PRESENTE' : 'NULO');
    console.log('[VER_RESPUESTA_MODAL]   - fecha_respuesta:', incidencia.fecha_respuesta);
    console.log('[VER_RESPUESTA_MODAL]   - respondido_por:', incidencia.respondido_por);
    console.log('[VER_RESPUESTA_MODAL]   - nuevo_estado_paquete:', incidencia.nuevo_estado_paquete);
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      const date = new Date(fecha);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const año = date.getFullYear();
      const horas = String(date.getHours()).padStart(2, '0');
      const minutos = String(date.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch {
      return 'N/A';
    }
  };

  const getTipoRespuestaBadge = (tipo) => {
    const tipos = {
      'aceptar_reclamacion': 'Reclamo Aceptado',
      'rechazar_reclamacion': 'Reclamo Rechazado',
      'solicitar_evidencia': 'Solicitar Evidencia',
      'otro': 'Otro'
    };
    return tipos[tipo] || tipo || 'Sin especificar';
  };

  const getTipoRespuestaColor = (tipo) => {
    const colores = {
      'aceptar_reclamacion': '#10b981',
      'rechazar_reclamacion': '#ef4444',
      'solicitar_evidencia': '#f59e0b',
      'otro': '#6b7280'
    };
    return colores[tipo] || '#6b7280';
  };

  // Verificar si tiene respuesta válida
  const tieneRespuesta = Boolean(
    incidencia.respuesta_admin?.trim() && 
    incidencia.tipo_respuesta
  );

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <FiFileText size={24} />
            <h2>Respuesta de la Incidencia</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body ver-respuesta-body">
          {/* Información compacta */}
          <div className="respuesta-container">
            {/* Header de la incidencia */}
            <div className="respuesta-header-compact">
              <div className="header-item">
                <span className="header-label">Guía</span>
                <span className="header-value">{incidencia.numero_guia || 'N/A'}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Tipo</span>
                <span className="header-value">{incidencia.tipo_incidencia || 'N/A'}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Fecha</span>
                <span className="header-value">{formatFecha(incidencia.fecha_reporte).split(' ')[0]}</span>
              </div>
              <div className="header-item">
                <span className="header-label">Estado</span>
                <span className="badge-estado">{incidencia.estado || 'N/A'}</span>
              </div>
            </div>

            {/* Descripción de la incidencia */}
            <div className="respuesta-description">
              <div className="respuesta-description-title">Comentario de Incidencia</div>
              <p>{incidencia.descripcion || 'Sin descripción'}</p>
            </div>

            {/* Respuesta o Sin Respuesta */}
            {tieneRespuesta ? (
              <div className="respuesta-content">
                <div className="response-header-inline">
                  <FiCheckCircle size={18} style={{ color: '#10b981' }} />
                  <h4>Respuesta del Administrador</h4>
                </div>

                <div className="response-details-inline">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Tipo</span>
                      <div
                        className="badge-response"
                        style={{
                          backgroundColor: getTipoRespuestaColor(incidencia.tipo_respuesta),
                          color: 'white'
                        }}
                      >
                        {getTipoRespuestaBadge(incidencia.tipo_respuesta)}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fecha</span>
                      <span className="detail-value">{formatFecha(incidencia.fecha_respuesta)}</span>
                    </div>
                    {incidencia.respondido_por && (
                      <div className="detail-item">
                        <span className="detail-label">Por</span>
                        <span className="detail-value-with-icon">
                          <FiUser size={14} />
                          {incidencia.respondido_por}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="response-text">
                    <span className="detail-label">Respuesta</span>
                    <div className="text-box">
                      {incidencia.respuesta_admin}
                    </div>
                  </div>

                  {incidencia.nuevo_estado_paquete && (
                    <div className="response-text">
                      <span className="detail-label">Nuevo Estado</span>
                      <span className="badge-estado-paquete">
                        {incidencia.nuevo_estado_paquete}
                      </span>
                    </div>
                  )}

                  {/* Estado de lectura por el repartidor */}
                  <div className="lectura-status-section">
                    <div className="lectura-status-header">
                      {incidencia.respuesta_leida ? (
                        <>
                          <FiEye size={18} style={{ color: '#10b981' }} />
                          <span className="lectura-status-text leida">Respuesta leída por el repartidor</span>
                        </>
                      ) : (
                        <>
                          <FiEyeOff size={18} style={{ color: '#94a3b8' }} />
                          <span className="lectura-status-text no-leida">Pendiente de lectura</span>
                        </>
                      )}
                    </div>
                    {incidencia.respuesta_leida && incidencia.fecha_lectura_respuesta && (
                      <div className="lectura-fecha">
                        <FiCalendar size={14} />
                        <span>Leída el: {formatFecha(incidencia.fecha_lectura_respuesta)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-response-content">
                <FiAlertCircle size={32} />
                <p>Sin respuesta del administrador</p>
                <small>Se notificará cuando haya una respuesta disponible</small>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
};

export default VerRespuestaIncidenciaModal;

