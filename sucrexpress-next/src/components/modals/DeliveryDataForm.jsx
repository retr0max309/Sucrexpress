'use client';
import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const DeliveryDataForm = ({ isOpen, onClose }) => {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email_cl: '', // Cambiado para coincidir con backend
    movil_cl: '', // Cambiado para coincidir con backend
    direccion_cl: '', // Cambiado para coincidir con backend
    numero_casa: '',
    numero_departamento: '',
    referencias_direccion: '',
    ubicacion_latitud: -19.0469,
    ubicacion_longitud: -65.2594,
    metodo_ubicacion: 'defecto',
    tipo_pago: 'efectivo' // Cambiado para coincidir con backend
  })

  // Cargar datos existentes al abrir el modal
  useEffect(() => {
    if (isOpen && token) {
      loadExistingData()
    }
  }, [isOpen, token])

  const loadExistingData = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/datos-entrega/mis-datos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        setFormData({
          nombres: data.data.nombres || '',
          apellidos: data.data.apellidos || '',
          email_cl: data.data.email_personal || '', // Mapear desde BD
          movil_cl: data.data.celular || '', // Mapear desde BD
          direccion_cl: data.data.direccion_principal || '', // Mapear desde BD
          numero_casa: data.data.numero_casa || '',
          numero_departamento: data.data.numero_departamento || '',
          referencias_direccion: data.data.referencias_direccion || '',
          ubicacion_latitud: data.data.ubicacion_latitud || -19.0469,
          ubicacion_longitud: data.data.ubicacion_longitud || -65.2594,
          metodo_ubicacion: data.data.metodo_ubicacion || 'defecto',
          tipo_pago: data.data.tipo_pago_preferido || 'efectivo' // Mapear desde BD
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo ubicación...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            ubicacion_latitud: position.coords.latitude,
            ubicacion_longitud: position.coords.longitude,
            metodo_ubicacion: 'gps'
          }))
          toast.dismiss()
          toast.success('Ubicación obtenida correctamente')
        },
        (error) => {
          toast.dismiss()
          toast.error('No se pudo obtener la ubicación')
          console.error('Error getting location:', error)
        }
      )
    } else {
      toast.error('Geolocalización no soportada')
    }
  }

  const handleSetSucreLocation = () => {
    setFormData(prev => ({
      ...prev,
      ubicacion_latitud: -19.0469,
      ubicacion_longitud: -65.2594,
      metodo_ubicacion: 'sucre_defecto'
    }))
    toast.success('Ubicación configurada a Sucre, Bolivia')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.nombres || !formData.apellidos || !formData.email_cl || !formData.movil_cl) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    if (!formData.email_cl.includes('@gmail.com')) {
      toast.error('El email debe ser de Gmail (@gmail.com)')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/datos-entrega/guardar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Datos de entrega guardados correctamente')
        onClose()
      } else {
        toast.error(data.message || 'Error al guardar datos')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error saving data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="modal d-block" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div 
          className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="fas fa-map-marker-alt me-2"></i>
                Configurar Datos de Entrega
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {loadingData ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Cargando datos...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Información Personal */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-user me-2"></i>
                        Información Personal
                      </h6>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombres *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellidos *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email Personal (Gmail) *</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email_cl"
                        value={formData.email_cl}
                        onChange={handleInputChange}
                        placeholder="ejemplo@gmail.com"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Celular *</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="movil_cl"
                        value={formData.movil_cl}
                        onChange={handleInputChange}
                        placeholder="Ej: 70123456"
                        required
                      />
                    </div>
                  </div>

                  {/* Dirección de Entrega */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-home me-2"></i>
                        Dirección de Entrega
                      </h6>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Dirección Principal *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="direccion_cl"
                        value={formData.direccion_cl}
                        onChange={handleInputChange}
                        placeholder="Ej: Av. Hernando Siles, zona San Pedro"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Casa</label>
                      <input
                        type="text"
                        className="form-control"
                        name="numero_casa"
                        value={formData.numero_casa}
                        onChange={handleInputChange}
                        placeholder="Ej: 1234"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Número de Departamento</label>
                      <input
                        type="text"
                        className="form-control"
                        name="numero_departamento"
                        value={formData.numero_departamento}
                        onChange={handleInputChange}
                        placeholder="Ej: Dept. 2B"
                      />
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Referencias de Dirección</label>
                      <textarea
                        className="form-control"
                        name="referencias_direccion"
                        value={formData.referencias_direccion}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Ej: Cerca del mercado, casa color verde, portón negro"
                      ></textarea>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-map-marked-alt me-2"></i>
                        Ubicación GPS
                      </h6>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Latitud</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="ubicacion_latitud"
                        value={formData.ubicacion_latitud}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Longitud</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        name="ubicacion_longitud"
                        value={formData.ubicacion_longitud}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                    
                    <div className="col-12 mb-3">
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={handleGetLocation}
                        >
                          <i className="fas fa-crosshairs me-2"></i>
                          Obtener Mi Ubicación GPS
                        </button>
                        
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          onClick={handleSetSucreLocation}
                        >
                          <i className="fas fa-map-marker-alt me-2"></i>
                          Usar Ubicación de Sucre
                        </button>
                      </div>
                      <small className="form-text text-muted d-block mt-2">
                        Puedes usar GPS para ubicación exacta o configurar automáticamente a Sucre, Bolivia
                      </small>
                    </div>
                  </div>

                  {/* Método de Pago */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="fas fa-credit-card me-2"></i>
                        Método de Pago Preferido
                      </h6>
                    </div>
                    
                    <div className="col-12">
                      <select
                        className="form-select"
                        name="tipo_pago"
                        value={formData.tipo_pago}
                        onChange={handleInputChange}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="qr">Código QR</option>
                      </select>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || loadingData}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Guardar Datos
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DeliveryDataForm
