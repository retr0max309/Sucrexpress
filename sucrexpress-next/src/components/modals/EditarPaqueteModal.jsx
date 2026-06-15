'use client';
import React, { useState, useEffect } from 'react';
import { 
  IoCloseOutline, 
  IoCubeOutline, 
  IoLocationOutline, 
  IoScaleOutline, 
  IoCashOutline, 
  IoDocumentTextOutline, 
  IoSaveOutline, 
  IoPersonOutline,
  IoWarningOutline
} from 'react-icons/io5';
import { paquetesService } from '../../services/paquetesService';
import { useAdminFormValidation } from '../../hooks/useAdminFormValidation';
import toast from 'react-hot-toast';
import '../../assets/styles/modals.css';

const EditarPaqueteModal = ({ isOpen, paquete, onClose, onActualizar }) => {
  const initialData = {
    nombre_destinatario: '',
    apellido_destinatario: '',
    ci_destinatario: '',
    email_destinatario: '',
    telefono_destinatario: '',
    direccion_destino: '',
    numero_casa: '',
    numero_departamento: '',
    ciudad_destino: '',
    contenido: '',
    peso: '',
    precio_envio: '',
    observaciones: '',
    estado: 'pendiente'
  };

  const { 
    formData, 
    errors, 
    updateField, 
    validateForm, 
    sanitizeFormData,
    hasErrors 
  } = useAdminFormValidation(initialData, 'paquete');

  const [loading, setLoading] = useState(false);

  // Tarifas por ciudad
  const tarifasPorCiudad = {
    'Sucre': 12,
    'La Paz': 50,
    'Santa Cruz': 60,
    'Cochabamba': 45,
    'Oruro': 40,
    'Potosí': 30,
    'Tarija': 65,
    'Beni': 70,
    'Pando': 80
  };

  const ciudades = Object.keys(tarifasPorCiudad);

  useEffect(() => {
    if (isOpen && paquete) {
      // Llenar los datos usando updateField
      const datosIniciales = {
        nombre_destinatario: paquete.nombre_destinatario || '',
        apellido_destinatario: paquete.apellido_destinatario || '',
        ci_destinatario: paquete.ci_destinatario || '',
        email_destinatario: paquete.email_destinatario || '',
        telefono_destinatario: paquete.telefono_destinatario || '',
        direccion_destino: paquete.direccion_exacta || '',
        numero_casa: paquete.numero_casa || '',
        numero_departamento: paquete.numero_departamento || '',
        ciudad_destino: paquete.ciudad_destino || '',
        contenido: paquete.contenido || '',
        peso: paquete.peso || '',
        precio_envio: paquete.precio_envio || '',
        observaciones: paquete.observaciones || '',
        estado: paquete.estado || 'pendiente'
      };
      
      Object.keys(datosIniciales).forEach(key => {
        updateField(key, datosIniciales[key]);
      });
    }
  }, [isOpen, paquete]);

  const calcularRecargoPorPeso = (peso) => {
    const pesoNum = parseFloat(peso) || 0;
    if (pesoNum <= 2) return 0;
    if (pesoNum <= 5) return 10;
    if (pesoNum <= 10) return 20;
    if (pesoNum <= 20) return 35;
    return 50 + Math.ceil((pesoNum - 20) * 2.5);
  };

  const calcularPrecio = (ciudad, peso) => {
    if (!ciudad || !peso) return 0;
    const tarifaBase = tarifasPorCiudad[ciudad] || 0;
    const recargoPeso = calcularRecargoPorPeso(peso);
    return tarifaBase + recargoPeso;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);

    // Auto-calcular precio si cambia ciudad o peso
    if (name === 'ciudad_destino' || name === 'peso') {
      const ciudad = name === 'ciudad_destino' ? value : formData.ciudad_destino;
      const peso = name === 'peso' ? value : formData.peso;
      if (ciudad && peso) {
        const precioCalculado = calcularPrecio(ciudad, peso);
        updateField('precio_envio', precioCalculado.toFixed(2));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrija los errores del formulario');
      return;
    }

    // Validar cambio de estado
    if (formData.estado !== paquete.estado) {
      const confirmar = window.confirm(
        `¿Cambiar estado de "${paquete.estado}" a "${formData.estado}"?`
      );
      if (!confirmar) {
        return;
      }
    }

    setLoading(true);

    try {
      // Sanitizar datos
      const datosLimpios = sanitizeFormData();
      
      const updateData = {
        nombre_destinatario: datosLimpios.nombre_destinatario,
        apellido_destinatario: datosLimpios.apellido_destinatario,
        ci_destinatario: datosLimpios.ci_destinatario,
        email_destinatario: datosLimpios.email_destinatario,
        telefono_destinatario: datosLimpios.telefono_destinatario,
        direccion_exacta: datosLimpios.direccion_destino,
        numero_casa: datosLimpios.numero_casa,
        numero_departamento: datosLimpios.numero_departamento || null,
        ciudad_destino: datosLimpios.ciudad_destino,
        contenido: datosLimpios.contenido,
        peso: parseFloat(datosLimpios.peso),
        precio_envio: parseFloat(datosLimpios.precio_envio),
        observaciones: datosLimpios.observaciones || null,
        estado: datosLimpios.estado
      };

      const response = await paquetesService.actualizar(paquete.id, updateData);

      if (response.success) {
        toast.success('Paquete actualizado exitosamente');
        if (onActualizar) {
          onActualizar();
        }
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el paquete');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !paquete) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content editar-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <IoCubeOutline size={24} />
            <h2>Editar Paquete</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body editar-body">
          <form onSubmit={handleSubmit} className="editar-form">
            {/* Información del Destinatario */}
            <div className="editar-section">
              <div className="section-header">
                <IoPersonOutline size={20} />
                <h3>Información del Destinatario</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre_destinatario">Nombre *</label>
                  <input
                    type="text"
                    id="nombre_destinatario"
                    name="nombre_destinatario"
                    value={formData.nombre_destinatario}
                    onChange={handleChange}
                    className={errors.nombre_destinatario ? 'error' : ''}
                  />
                  {errors.nombre_destinatario && (
                    <span className="error-text">
                      <IoWarningOutline size={14} />
                      {errors.nombre_destinatario}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="apellido_destinatario">Apellido *</label>
                  <input
                    type="text"
                    id="apellido_destinatario"
                    name="apellido_destinatario"
                    value={formData.apellido_destinatario}
                    onChange={handleChange}
                    className={errors.apellido_destinatario ? 'error' : ''}
                  />
                  {errors.apellido_destinatario && (
                    <span className="error-text">
                      <IoWarningOutline size={14} />
                      {errors.apellido_destinatario}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email_destinatario">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="email_destinatario"
                    name="email_destinatario"
                    value={formData.email_destinatario}
                    onChange={handleChange}
                    className={errors.email_destinatario ? 'error' : ''}
                  />
                  {errors.email_destinatario && (
                    <span className="error-text">
                      <IoWarningOutline size={14} />
                      {errors.email_destinatario}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="telefono_destinatario">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono_destinatario"
                    name="telefono_destinatario"
                    value={formData.telefono_destinatario}
                    onChange={handleChange}
                    className={errors.telefono_destinatario ? 'error' : ''}
                  />
                  {errors.telefono_destinatario && (
                    <span className="error-text">
                      <IoWarningOutline size={14} />
                      {errors.telefono_destinatario}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Entrega */}
            <div className="editar-section">
              <div className="section-header">
                <IoLocationOutline size={20} />
                <h3>Información de Entrega</h3>
              </div>

              <div className="form-group">
                <label htmlFor="direccion_destino">Dirección *</label>
                <input
                  type="text"
                  id="direccion_destino"
                  name="direccion_destino"
                  value={formData.direccion_destino}
                  onChange={handleChange}
                  className={errors.direccion_destino ? 'error' : ''}
                />
                {errors.direccion_destino && (
                  <span className="error-text">
                    <IoWarningOutline size={14} />
                    {errors.direccion_destino}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numero_casa">Número de Casa *</label>
                  <input
                    type="text"
                    id="numero_casa"
                    name="numero_casa"
                    value={formData.numero_casa}
                    onChange={handleChange}
                    className={errors.numero_casa ? 'error' : ''}
                  />
                  {errors.numero_casa && (
                    <span className="error-text">
                      <IoWarningOutline size={14} />
                      {errors.numero_casa}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="numero_departamento">Número de Departamento</label>
                  <input
                    type="text"
                    id="numero_departamento"
                    name="numero_departamento"
                    value={formData.numero_departamento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ciudad_destino">Ciudad *</label>
                <select
                  id="ciudad_destino"
                  name="ciudad_destino"
                  value={formData.ciudad_destino}
                  onChange={handleChange}
                  className={errors.ciudad_destino ? 'error' : ''}
                >
                  <option value="">Seleccionar ciudad...</option>
                  {ciudades.map(ciudad => (
                    <option key={ciudad} value={ciudad}>{ciudad}</option>
                  ))}
                </select>
                {errors.ciudad_destino && (
                  <span className="error-text">
                    <IoWarningOutline size={14} />
                    {errors.ciudad_destino}
                  </span>
                )}
              </div>
            </div>

            {/* Detalles del Paquete */}
            <div className="editar-section">
              <div className="section-header">
                <IoCubeOutline size={20} />
                <h3>Detalles del Paquete</h3>
              </div>

              <div className="form-group">
                <label htmlFor="contenido">Contenido *</label>
                <textarea
                  id="contenido"
                  name="contenido"
                  value={formData.contenido}
                  onChange={handleChange}
                  rows="2"
                  className={errors.contenido ? 'error' : ''}
                />
                {errors.contenido && (
                  <span className="error-text">
                    <IoWarningOutline size={14} />
                    {errors.contenido}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="peso">Peso (kg) *</label>
                  <input
                    type="number"
                    id="peso"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    step="0.01"
                    min="0.1"
                    max="1000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precio_envio">Precio de Envío (Bs.) *</label>
                  <input
                    type="number"
                    id="precio_envio"
                    name="precio_envio"
                    value={formData.precio_envio}
                    step="0.01"
                    disabled
                    className="readonly-field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Estado *</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_ruta">En Ruta</option>
                    <option value="entregado">Entregado</option>
                    <option value="fallido">Fallido</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="2"
                />
              </div>
            </div>

            {/* Footer */}
            {hasErrors && (
              <div className="validation-alert">
                <IoWarningOutline size={20} />
                <span>Hay errores de validación. Por favor revise los campos marcados.</span>
              </div>
            )}
            
            <div className="modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn-modal-save" disabled={loading || hasErrors} title={hasErrors ? 'Corrija los errores para continuar' : 'Guardar cambios'}>
                <IoSaveOutline size={18} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPaqueteModal;
