'use client';
import React, { useEffect, useState, useRef } from 'react';
import apiClient from '@/lib/apiClient';
import '../../assets/styles/listaRepartidores.new.css';
import { 
  IoPersonAdd, 
  IoSearch, 
  IoCheckmarkCircle, 
  IoStar, 
  IoTrendingUp, 
  IoLocationSharp, 
  IoClose, 
  IoEllipsisVertical, 
  IoCheckmark, 
  IoMailOutline, 
  IoCallOutline, 
  IoCardOutline, 
  IoBicycle, 
  IoFilterOutline, 
  IoCreateOutline, 
  IoTrashOutline, 
  IoEyeOutline, 
  IoCloseCircle, 
  IoPeople, 
  IoShieldCheckmark,
  IoLockClosedOutline,
  IoWarningOutline
} from 'react-icons/io5';
import { useAdminFormValidation } from '../../hooks/useAdminFormValidation';


const ListaRepartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  
  const initialData = {
    nombre_completo: '',
    email: '',
    telefono: '',
    numero_ci: '',
    tipo_vehiculo: '',
    ciudad: '',
    password: '',
    confirmPassword: '',
    estado: 'Activo',
    verificado: false
  };

  const { 
    formData, 
    errors: formErrors, 
    updateField, 
    validateForm, 
    resetForm, 
    sanitizeFormData,
    hasErrors 
  } = useAdminFormValidation(initialData, 'repartidor');

  const [submitting, setSubmitting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchRepartidores();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchRepartidores = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/repartidores');
      const result = response.data;
      
      if (result.success) {
        setRepartidores(result.data || []);
      } else {
        console.error('Error en la respuesta:', result.message);
        setRepartidores([]);
      }
    } catch (error) {
      console.error('Error al obtener repartidores:', error);
      setRepartidores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepartidores = repartidores.filter(r => {
    const matchesSearch =
      r.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.numero_ci?.includes(searchTerm);
    
    if (filterStatus === 'todos') return matchesSearch;
    return matchesSearch && r.estado?.toLowerCase() === filterStatus;
  });

  const stats = {
  total: repartidores.length,
  activos: repartidores.filter(r => r.estado === 'Activo').length,
  inactivos: repartidores.filter(r => r.estado === 'Inactivo').length,  // ← NUEVO
  verificados: repartidores.filter(r => r.verificado).length,
  promedioCalif:
    repartidores.reduce((acc, r) => acc + (r.calificacion || 0), 0) /
      repartidores.length || 0
};


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === 'checkbox' ? checked : value);
  };

  const validateFormLocal = () => {
    return validateForm();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFormLocal()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión primero.');
        setSubmitting(false);
        return;
      }

      console.log('Token encontrado:', token ? 'Sí' : 'No');
      
      // Sanitizar datos
      const datosLimpios = sanitizeFormData();
      
      const response = await apiClient.post('/repartidores', {
        nombre_completo: datosLimpios.nombre_completo.trim(),
        email: datosLimpios.email.trim().toLowerCase(),
        telefono: datosLimpios.telefono.trim(),
        numero_ci: datosLimpios.numero_ci.trim(),
        tipo_vehiculo: datosLimpios.tipo_vehiculo,
        ciudad: datosLimpios.ciudad.trim(),
        estado: datosLimpios.estado,
        verificado: datosLimpios.verificado,
      });

      const result = response.data;

      await fetchRepartidores();
      setShowModal(false);
      resetForm();
      alert('Repartidor registrado exitosamente');
    } catch (error) {
      console.error('Error al registrar repartidor:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const toggleMenu = (id) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleEdit = (repartidor) => {
    setSelectedRepartidor(repartidor);
    // Llenar el formulario con los datos del repartidor
    Object.keys(repartidor).forEach(key => {
      if (key in formData) {
        updateField(key, repartidor[key]);
      }
    });
    setShowEditModal(true);
    setActiveMenuId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateFormLocal()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión primero.');
        setSubmitting(false);
        return;
      }
      
      // Sanitizar datos
      const datosLimpios = sanitizeFormData();
      
      const response = await apiClient.put(`/repartidores/${selectedRepartidor.id}`, {
        nombre_completo: datosLimpios.nombre_completo.trim(),
        email: datosLimpios.email.trim().toLowerCase(),
        telefono: datosLimpios.telefono.trim(),
        numero_ci: datosLimpios.numero_ci.trim(),
        tipo_vehiculo: datosLimpios.tipo_vehiculo,
        ciudad: datosLimpios.ciudad.trim(),
        estado: datosLimpios.estado,
        verificado: datosLimpios.verificado,
      });

    const result = response.data;

    await fetchRepartidores();
    setShowEditModal(false);
    setSelectedRepartidor(null);
    resetForm();
    alert('Repartidor actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar repartidor:', error);
    alert(error.message);
  } finally {
    setSubmitting(false);
  }
};


  const handleDelete = (repartidor) => {
    setSelectedRepartidor(repartidor);
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión primero.');
        return;
      }

      const response = await apiClient.delete(`/repartidores/${selectedRepartidor.id}`);
      const result = response.data;

      await fetchRepartidores();
      setShowDeleteModal(false);
      setSelectedRepartidor(null);
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      alert(error.message);
    }
  };

  const handleViewDetails = (repartidor) => {
    setSelectedRepartidor(repartidor);
    setShowDetailsModal(true);
    setActiveMenuId(null);
  };

  return (
    <div className="lista-repartidores-container">
      <div className="header-section">
        <div className="header-content">
          <div className="header-text">
            <h1>Gestión de Repartidores</h1>
            <p className="subtitle">Administra y supervisa a tu equipo de distribución</p>
          </div>
          <button 
            className="btn-agregar-repartidor"
            onClick={() => setShowModal(true)}
          >
            <IoPersonAdd size={20} /> 
            <span>Nuevo Repartidor</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
  {/* Total Repartidores */}
  <div className="stat-card stat-primary">
    <div className="stat-icon-box">
      <IoPeople size={28} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{stats.total}</span>
      <span className="stat-label">Total Repartidores</span>
    </div>
  </div>

  {/* Activos */}
  <div className="stat-card stat-success">
    <div className="stat-icon-box stat-icon-success">
      <IoCheckmarkCircle size={28} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{stats.activos}</span>
      <span className="stat-label">Activos</span>
    </div>
  </div>

  {/* Inactivos */}
  <div className="stat-card stat-danger">
    <div className="stat-icon-box stat-icon-danger">
      <IoCloseCircle size={28} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{stats.inactivos}</span>
      <span className="stat-label">Inactivos</span>
    </div>
  </div>

  {/* Verificados */}
  <div className="stat-card stat-warning">
    <div className="stat-icon-box stat-icon-warning">
      <IoShieldCheckmark size={28} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{stats.verificados}</span>
      <span className="stat-label">Verificados</span>
    </div>
  </div>

  {/* Calificación Promedio */}
  <div className="stat-card stat-info">
    <div className="stat-icon-box stat-icon-info">
      <IoStar size={28} />
    </div>
    <div className="stat-info">
      <span className="stat-value">{stats.promedioCalif.toFixed(1)}</span>
      <span className="stat-label">Calificación Promedio</span>
    </div>
  </div>
</div>


      <div className="controls-section">
        <div className="search-box">
          <IoSearch className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <IoFilterOutline size={20} />
          <select
            className="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table className="repartidores-table">
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Ubicación</th>
                <th>Contacto</th>
                <th>Vehículo</th>
                <th>Métricas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <span>Cargando repartidores...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRepartidores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="empty-state">
                      <IoPersonAdd size={48} />
                      <p>No se encontraron repartidores</p>
                      <span>Intenta ajustar los filtros de búsqueda</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRepartidores.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="repartidor-info">
                        {r.foto_perfil_url ? (
                          <img src={r.foto_perfil_url} alt={r.nombre_completo} className="avatar" />
                        ) : (
                          <div className="avatar-placeholder">
                            {r.nombre_completo?.charAt(0).toUpperCase() || 'N'}
                          </div>
                        )}
                        <div className="info-text">
                          <div className="nombre">{r.nombre_completo}</div>
                          <div className="email">
                            <IoMailOutline size={14} />
                            {r.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="location-cell">
                        <IoLocationSharp size={16} className="location-icon" />
                        <span>{r.ciudad}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <IoCallOutline size={14} />
                        <span>{r.telefono}</span>
                      </div>
                      <div className="contact-cell ci">
                        <IoCardOutline size={14} />
                        <span>{r.numero_ci}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vehiculo-badge">
                        <IoBicycle size={16} />
                        <span>{r.tipo_vehiculo || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="metricas">
                        <div className="metrica-item">
                          <span className="metrica-value">{r.cantidad_entregas ?? 0}</span>
                          <span className="metrica-label">entregas</span>
                        </div>
                        <div className="metrica-item rating">
                          <IoStar size={16} className="star-icon" />
                          <span className="metrica-value">{r.calificacion?.toFixed(1) ?? '--'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="estado-badges">
                        <span className={`badge ${r.verificado ? 'verificado' : 'no-verificado'}`}>
                          {r.verificado && <IoCheckmark size={14} />}
                          {r.verificado ? 'Verificado' : 'Sin verificar'}
                        </span>
                        <span className={`badge estado-${r.estado?.toLowerCase()}`}>
                          {r.estado || 'Sin Estado'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-menu-container" ref={activeMenuId === r.id ? menuRef : null}>
                        <button 
                          className="btn-action"
                          onClick={() => toggleMenu(r.id)}
                        >
                          <IoEllipsisVertical size={20} />
                        </button>
                        
                        {activeMenuId === r.id && (
                          <div className="action-menu">
                            <button 
                              className="menu-item"
                              onClick={() => handleViewDetails(r)}
                            >
                              <IoEyeOutline size={18} />
                              <span>Ver detalles</span>
                            </button>
                            <button 
                              className="menu-item"
                              onClick={() => handleEdit(r)}
                            >
                              <IoCreateOutline size={18} />
                              <span>Editar</span>
                            </button>
                            <button 
                              className="menu-item delete"
                              onClick={() => handleDelete(r)}
                            >
                              <IoTrashOutline size={18} />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Registrar Nuevo Repartidor</h2>
                <p className="modal-subtitle">Completa la información del nuevo miembro</p>
              </div>
              <button className="btn-close" onClick={handleCloseModal}>
                <IoClose size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="repartidor-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nombre_completo">
                    Nombre Completo <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre_completo"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez García"
                    className={formErrors.nombre_completo ? 'error' : ''}
                  />
                  {formErrors.nombre_completo && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.nombre_completo}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
  <label htmlFor="password">
    <IoLockClosedOutline /> Contraseña *
  </label>
  <input
    type="password"
    id="password"
    name="password"
    value={formData.password}
    onChange={handleInputChange}
    placeholder="Mínimo 6 caracteres"
    className={formErrors.password ? 'error' : ''}
    autoComplete="new-password"
  />
  {formErrors.password && (
    <span className="error-message">
      <IoWarningOutline size={14} />
      {formErrors.password}
    </span>
  )}
</div>

<div className="form-group">
  <label htmlFor="confirmPassword">
    <IoLockClosedOutline /> Confirmar Contraseña *
  </label>
  <input
    type="password"
    id="confirmPassword"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleInputChange}
    placeholder="Repite la contraseña"
    className={formErrors.confirmPassword ? 'error' : ''}
    autoComplete="new-password"
  />
  {formErrors.confirmPassword && (
    <span className="error-message">
      <IoWarningOutline size={14} />
      {formErrors.confirmPassword}
    </span>
  )}
</div>


                <div className="form-group">
                  <label htmlFor="telefono">
                    Teléfono <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="71234567"
                    className={formErrors.telefono ? 'error' : ''}
                  />
                  {formErrors.telefono && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.telefono}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="numero_ci">
                    Carnet de Identidad <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="numero_ci"
                    name="numero_ci"
                    value={formData.numero_ci}
                    onChange={handleInputChange}
                    placeholder="12345678"
                    className={formErrors.numero_ci ? 'error' : ''}
                  />
                  {formErrors.numero_ci && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.numero_ci}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="ciudad">
                    Ciudad <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ej: La Paz"
                    className={formErrors.ciudad ? 'error' : ''}
                  />
                  {formErrors.ciudad && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.ciudad}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="tipo_vehiculo">
                    Tipo de Vehículo <span className="required">*</span>
                  </label>
                  <select
                    id="tipo_vehiculo"
                    name="tipo_vehiculo"
                    value={formData.tipo_vehiculo}
                    onChange={handleInputChange}
                    className={formErrors.tipo_vehiculo ? 'error' : ''}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Motocicleta">Motocicleta</option>
                    <option value="Bicicleta">Bicicleta</option>
                    <option value="Auto">Auto</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="A pie">A pie</option>
                  </select>
                  {formErrors.tipo_vehiculo && (
                    <span className="error-message">
                      <IoWarningOutline size={14} />
                      {formErrors.tipo_vehiculo}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="estado">Estado Inicial</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="verificado" className="checkbox-label">
                    <input
                      type="checkbox"
                      id="verificado"
                      name="verificado"
                      checked={formData.verificado}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-text">Marcar como verificado</span>
                  </label>
                </div>
              </div>

              {/* Aviso de validación */}
              {hasErrors && (
                <div className="validation-alert">
                  <IoWarningOutline size={20} />
                  <span>Hay errores de validación. Por favor revise los campos marcados.</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || hasErrors}
                  title={hasErrors ? 'Corrija los errores para continuar' : 'Registrar nuevo repartidor'}
                >
                  {submitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Guardando...
                    </>
                  ) : (
                    <>  
                      <IoCheckmark size={20} />
                      Registrar Repartidor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedRepartidor && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content-details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Ver detalles de: {selectedRepartidor.nombre_completo}</h2>
              </div>
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>
                <IoClose size={24} />
              </button>
            </div>
            <div className="details-body">
              <p><strong>Email:</strong> {selectedRepartidor.email}</p>
              <p><strong>Teléfono:</strong> {selectedRepartidor.telefono}</p>
              <p><strong>CI:</strong> {selectedRepartidor.numero_ci}</p>
              <p><strong>Ciudad:</strong> {selectedRepartidor.ciudad}</p>
              <p><strong>Vehículo:</strong> {selectedRepartidor.tipo_vehiculo}</p>
              <p><strong>Estado:</strong> {selectedRepartidor.estado}</p>
              <p><strong>Verificado:</strong> {selectedRepartidor.verificado ? 'Sí' : 'No'}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowDetailsModal(false)}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
{showEditModal && selectedRepartidor && (
  <div className="modal-overlay" onClick={() => {
    setShowEditModal(false);
    resetForm();
  }}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <div>
          <h2>Editar Repartidor</h2>
          <p className="modal-subtitle">Actualiza la información de {selectedRepartidor.nombre_completo}</p>
        </div>
        <button className="btn-close" onClick={() => {
          setShowEditModal(false);
          resetForm();
        }}>
          <IoClose size={24} />
        </button>
      </div>

      <form onSubmit={handleEditSubmit} className="repartidor-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="edit_nombre_completo">
              Nombre Completo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="edit_nombre_completo"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez García"
              className={formErrors.nombre_completo ? 'error' : ''}
            />
            {formErrors.nombre_completo && (
              <span className="error-message">{formErrors.nombre_completo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="edit_email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ejemplo@correo.com"
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_telefono">
              Teléfono <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="edit_telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="71234567"
              className={formErrors.telefono ? 'error' : ''}
            />
            {formErrors.telefono && (
              <span className="error-message">{formErrors.telefono}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_numero_ci">
              Carnet de Identidad <span className="required">*</span>
            </label>
            <input
              type="text"
              id="edit_numero_ci"
              name="numero_ci"
              value={formData.numero_ci}
              onChange={handleInputChange}
              placeholder="12345678"
              className={formErrors.numero_ci ? 'error' : ''}
            />
            {formErrors.numero_ci && (
              <span className="error-message">{formErrors.numero_ci}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_ciudad">
              Ciudad <span className="required">*</span>
            </label>
            <input
              type="text"
              id="edit_ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleInputChange}
              placeholder="Ej: La Paz"
              className={formErrors.ciudad ? 'error' : ''}
            />
            {formErrors.ciudad && (
              <span className="error-message">{formErrors.ciudad}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_tipo_vehiculo">
              Tipo de Vehículo <span className="required">*</span>
            </label>
            <select
              id="edit_tipo_vehiculo"
              name="tipo_vehiculo"
              value={formData.tipo_vehiculo}
              onChange={handleInputChange}
              className={formErrors.tipo_vehiculo ? 'error' : ''}
            >
              <option value="">Seleccionar...</option>
              <option value="Motocicleta">Motocicleta</option>
              <option value="Bicicleta">Bicicleta</option>
              <option value="Auto">Auto</option>
              <option value="Camioneta">Camioneta</option>
              <option value="A pie">A pie</option>
            </select>
            {formErrors.tipo_vehiculo && (
              <span className="error-message">{formErrors.tipo_vehiculo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="edit_estado">Estado</label>
            <select
              id="edit_estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="edit_verificado" className="checkbox-label">
              <input
                type="checkbox"
                id="edit_verificado"
                name="verificado"
                checked={formData.verificado}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Marcar como verificado</span>
            </label>
          </div>
        </div>

        {/* Aviso de validación */}
        {hasErrors && (
          <div className="validation-alert">
            <IoWarningOutline size={20} />
            <span>Hay errores de validación. Por favor revise los campos marcados.</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || hasErrors}
            title={hasErrors ? 'Corrija los errores para continuar' : 'Actualizar repartidor'}
          >
            {submitting ? (
              <>
                <div className="btn-spinner"></div>
                Actualizando...
              </>
            ) : (
              <>  
                <IoCheckmark size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && selectedRepartidor && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Confirmar eliminación</h2>
              </div>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>
                <IoClose size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de eliminar al repartidor {selectedRepartidor.nombre_completo}?</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaRepartidores;
