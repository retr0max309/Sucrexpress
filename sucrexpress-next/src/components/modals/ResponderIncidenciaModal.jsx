'use client';
import { useState } from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import { useAdminFormValidation } from '../../hooks/useAdminFormValidation';

export default function ResponderIncidenciaModal({ isOpen, incidencia, onClose, onResponder, loading }) {
  const initialData = {
    respuesta_admin: '',
    tipo_respuesta: '',
    nuevo_estado_paquete: null
  };

  if (isOpen && incidencia) {
    console.log('[RESPONDER_MODAL] Modal abierto para incidencia:', incidencia.id);
  }

  const { 
    formData, 
    errors: formErrors, 
    updateField, 
    validateForm, 
    sanitizeFormData,
    hasErrors 
  } = useAdminFormValidation(initialData, 'incidencia');

  if (!isOpen || !incidencia) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[RESPONDER_MODAL] Submitiendo formulario');
    console.log('[RESPONDER_MODAL] Datos del formulario:', {
      respuesta_admin: formData.respuesta_admin ? 'presente' : 'vacío',
      tipo_respuesta: formData.tipo_respuesta,
      nuevo_estado_paquete: formData.nuevo_estado_paquete
    });
    
    if (validateForm()) {
      // Sanitizar datos
      const datosLimpios = sanitizeFormData();
      
      console.log('[RESPONDER_MODAL] Datos sanitizados:', {
        respuesta_admin: datosLimpios.respuesta_admin ? 'presente' : 'vacío',
        tipo_respuesta: datosLimpios.tipo_respuesta,
        nuevo_estado_paquete: datosLimpios.nuevo_estado_paquete
      });
      
      onResponder(
        datosLimpios.respuesta_admin,
        datosLimpios.tipo_respuesta,
        datosLimpios.nuevo_estado_paquete
      );
    } else {
      console.error('[RESPONDER_MODAL] Validación fallida, errores:', formErrors);
    }
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-responder-incidencia" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Responder Incidencia</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-section">
              <h3>Información de Incidencia</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Número Guía:</span>
                  <span className="value">{incidencia.numero_guia}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tipo:</span>
                  <span className="value">{getTipoIncidencia(incidencia.tipo_incidencia)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Repartidor:</span>
                  <span className="value">{incidencia.repartidor_nombre}</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="tipo_respuesta">
                  Tipo de Respuesta <span className="required">*</span>
                </label>
                <select
                  id="tipo_respuesta"
                  name="tipo_respuesta"
                  value={formData.tipo_respuesta}
                  onChange={handleInputChange}
                  className={`form-control ${formErrors.tipo_respuesta ? 'error' : ''}`}
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="comentario">Comentario</option>
                  <option value="agendar_reentrega">Agendar Reentrega</option>
                  <option value="investigar">Investigar Incidente</option>
                  <option value="compensar">Compensar Cliente</option>
                  <option value="rechazar">Rechazar Reclamación</option>
                  <option value="otra">Otra</option>
                </select>
                {formErrors.tipo_respuesta && (
                  <span className="error-message">
                    <IoWarningOutline size={14} />
                    {formErrors.tipo_respuesta}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="respuesta_admin">
                  Respuesta / Comentario <span className="required">*</span>
                </label>
                <textarea
                  id="respuesta_admin"
                  name="respuesta_admin"
                  value={formData.respuesta_admin}
                  onChange={handleInputChange}
                  placeholder="Escribir tu respuesta aquí..."
                  rows="5"
                  maxLength="500"
                  className={`form-control ${formErrors.respuesta_admin ? 'error' : ''}`}
                />
                <div className="char-count">
                  {formData.respuesta_admin.length}/500 caracteres
                </div>
                {formErrors.respuesta_admin && (
                  <span className="error-message">
                    <IoWarningOutline size={14} />
                    {formErrors.respuesta_admin}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nuevo_estado_paquete">
                  Cambiar Estado Paquete (Opcional)
                </label>
                <select
                  id="nuevo_estado_paquete"
                  name="nuevo_estado_paquete"
                  value={formData.nuevo_estado_paquete || ''}
                  onChange={(e) => updateField('nuevo_estado_paquete', e.target.value || null)}
                  className="form-control"
                >
                  <option value="">Sin cambio (mantener actual)</option>
                  <option value="en_ruta">Reintenta Entrega</option>
                  <option value="devuelto">Devuelto</option>
                  <option value="en_investigacion">Pendiente Revisión</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aviso de validación */}
          {hasErrors && (
            <div className="validation-alert">
              <IoWarningOutline size={20} />
              <span>Hay errores de validación. Por favor revise los campos marcados.</span>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || hasErrors}
              title={hasErrors ? 'Corrija los errores para continuar' : 'Enviar respuesta'}
            >
              {loading ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
