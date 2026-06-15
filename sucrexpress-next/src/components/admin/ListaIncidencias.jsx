'use client';
import { useState, useEffect } from 'react';
import { incidenciasService } from '../../services/incidenciasService';
import IncidenciaDetailModal from '../modals/IncidenciaDetailModal';
import ResponderIncidenciaModal from '../modals/ResponderIncidenciaModal';
import VerRespuestaIncidenciaModal from '../modals/VerRespuestaIncidenciaModal';
import ConfirmDeleteIncidenciaModal from '../modals/ConfirmDeleteIncidenciaModal';
import LoadingSpinner from '../common/LoadingSpinner';
import { FiBarChart2, FiClock, FiMessageSquare, FiCheck, FiMoreVertical, FiEye, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import '../../assets/styles/incidencias.css';

export default function ListaIncidencias() {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterFecha, setFilterFecha] = useState({ inicio: '', fin: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estadisticas, setEstadisticas] = useState(null);
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [showVerRespuestaModal, setShowVerRespuestaModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  useEffect(() => {
    fetchIncidencias();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado, filterTipo, filterFecha, searchTerm]);

  const fetchIncidencias = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        estado: filterEstado !== 'todos' ? filterEstado : null,
        tipo: filterTipo !== 'todos' ? filterTipo : null,
        search: searchTerm || null,
        fecha_inicio: filterFecha.inicio || null,
        fecha_fin: filterFecha.fin || null
      };

      const response = await incidenciasService.getIncidencias(filters, currentPage, 10);

      if (response.success) {
        setIncidencias(response.data || []);
        setTotalPages(response.totalPages || 1);
      } else {
        setError(response.message || 'Error al cargar incidencias');
      }
    } catch (err) {
      console.error('Error fetching incidencias:', err);
      setError('Error al cargar incidencias. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarDatos = async () => {
    console.log('[LISTA_INCIDENCIAS] Actualizando datos...');
    await fetchIncidencias();
    await fetchEstadisticas();
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await incidenciasService.getEstadisticas();
      if (response.success) {
        setEstadisticas(response.data);
      }
    } catch (err) {
      console.error('Error fetching estadisticas:', err);
    }
  };

  const handleBuscar = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterTipo('todos');
    setFilterFecha({ inicio: '', fin: '' });
    setCurrentPage(1);
  };

  const handleVerDetalles = async (incidencia) => {
    try {
      setLoading(true);
      const response = await incidenciasService.getIncidenciaById(incidencia.id);
      if (response.success) {
        setSelectedIncidencia(response.data);
        setShowDetalleModal(true);
      } else {
        setError(response.message || 'Error al cargar detalles');
      }
    } catch (err) {
      console.error('Error fetching incidencia details:', err);
      setError('Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (incidencia) => {
    try {
      console.log('[LISTA_INCIDENCIAS] Abriendo modal Responder para:', incidencia.id);
      setLoading(true);
      
      // Fetch fresco de la incidencia
      const response = await incidenciasService.getIncidenciaById(incidencia.id);
      
      if (response.success && response.data) {
        setSelectedIncidencia(response.data);
        setShowResponderModal(true);
      } else {
        setError('Error al cargar incidencia');
      }
    } catch (err) {
      console.error('[LISTA_INCIDENCIAS] Error al abrir modal responder:', err);
      setError('Error al cargar incidencia');
    } finally {
      setLoading(false);
      setMenuAbiertoId(null);
    }
  };

  const handleVerRespuesta = async (incidencia) => {
    try {
      console.log('[LISTA_INCIDENCIAS] Abriendo modal Ver Respuesta para:', incidencia.id);
      setLoading(true);
      
      // Fetch fresco de la incidencia para obtener campos de respuesta actualizados
      const response = await incidenciasService.getIncidenciaById(incidencia.id);
      
      console.log('[LISTA_INCIDENCIAS] Datos frescos recibidos:', response);
      
      if (response.success && response.data) {
        setSelectedIncidencia(response.data);
        setShowVerRespuestaModal(true);
      } else {
        setError('Error al cargar la respuesta');
      }
    } catch (err) {
      console.error('[LISTA_INCIDENCIAS] Error al cargar respuesta:', err);
      setError('Error al cargar la respuesta');
    } finally {
      setLoading(false);
      setMenuAbiertoId(null);
    }
  };

  const handleResolver = async (incidencia) => {
    try {
      setLoadingResponse(true);
      const response = await incidenciasService.resolverIncidencia(incidencia.id);
      if (response.success) {
        await fetchIncidencias();
        await fetchEstadisticas();
        setMenuAbiertoId(null);
      } else {
        setError(response.message || 'Error al resolver incidencia');
      }
    } catch (err) {
      console.error('Error resolving incidencia:', err);
      setError('Error al resolver incidencia');
    } finally {
      setLoadingResponse(false);
    }
  };

  const handleEliminar = (incidencia) => {
    setSelectedIncidencia(incidencia);
    setShowConfirmDeleteModal(true);
    setMenuAbiertoId(null);
  };

  const confirmDelete = async () => {
    try {
      setLoadingResponse(true);
      const response = await incidenciasService.cancelarIncidencia(selectedIncidencia.id);
      if (response.success) {
        await fetchIncidencias();
        await fetchEstadisticas();
        setShowConfirmDeleteModal(false);
        setSelectedIncidencia(null);
      } else {
        setError(response.message || 'Error al cancelar incidencia');
      }
    } catch (err) {
      console.error('Error canceling incidencia:', err);
      setError('Error al cancelar incidencia');
    } finally {
      setLoadingResponse(false);
    }
  };

  const confirmResponder = async (respuesta, tipoRespuesta, nuevoEstado) => {
    try {
      console.log('[LISTA_INCIDENCIAS] confirmResponder - Iniciando respuesta');
      console.log('[LISTA_INCIDENCIAS] confirmResponder - ID incidencia:', selectedIncidencia.id);
      console.log('[LISTA_INCIDENCIAS] confirmResponder - respuesta:', respuesta ? 'presente' : 'vacío');
      console.log('[LISTA_INCIDENCIAS] confirmResponder - tipoRespuesta:', tipoRespuesta);
      console.log('[LISTA_INCIDENCIAS] confirmResponder - nuevoEstado:', nuevoEstado);
      
      setLoadingResponse(true);
      const response = await incidenciasService.responderIncidencia(
        selectedIncidencia.id,
        respuesta,
        tipoRespuesta,
        nuevoEstado
      );
      
      console.log('[LISTA_INCIDENCIAS] confirmResponder - Respuesta del servidor:', response);
      
      if (response.success) {
        console.log('[LISTA_INCIDENCIAS] confirmResponder - Éxito, recargando incidencias');
        await fetchIncidencias();
        await fetchEstadisticas();
        setShowResponderModal(false);
        setSelectedIncidencia(null);
      } else {
        console.error('[LISTA_INCIDENCIAS] confirmResponder - Error en respuesta:', response.message);
        setError(response.message || 'Error al responder incidencia');
      }
    } catch (err) {
      console.error('[LISTA_INCIDENCIAS] confirmResponder - Error capturado:', err);
      setError('Error al responder incidencia');
    } finally {
      setLoadingResponse(false);
    }
  };

  const toggleMenu = (id) => {
    setMenuAbiertoId(menuAbiertoId === id ? null : id);
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${horas}:${minutos}`;
  };

  const truncateText = (text, length = 50) => {
    return text && text.length > length ? text.substring(0, length) + '...' : text;
  };

  const getEstadoBadge = (estado) => {
    const estadoClass = `badge-estado badge-${estado}`;
    const labels = {
      'pendiente': 'Pendiente',
      'respondida': 'Respondida'
    };
    return <span className={estadoClass}>{labels[estado] || estado}</span>;
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      'falla_vehiculo': 'Falla Vehículo',
      'accidente_transito': 'Accidente',
      'retencion_policial': 'Retención Policial',
      'destinatario_ausente': 'Destinatario Ausente',
      'direccion_incorrecta': 'Dirección Incorrecta',
      'paquete_danado': 'Paquete Dañado',
      'otra': 'Otra'
    };
    return badges[tipo] || tipo;
  };

  return (
    <div className="lista-incidencias-container">
      <header className="header-section">
        <div className="header-content">
          <h1>Gestión de Incidencias</h1>
          <p>Administra y responde a incidencias de repartidores</p>
        </div>
      </header>

      {estadisticas && (
        <section className="estadisticas-section">
          <div className="estadistica-card">
            <div className="card-icon total">
              <FiBarChart2 />
            </div>
            <div className="card-content">
              <p className="card-label">Total</p>
              <p className="card-value">{estadisticas.total_incidencias || 0}</p>
            </div>
          </div>

          <div className="estadistica-card">
            <div className="card-icon pendiente">
              <FiClock />
            </div>
            <div className="card-content">
              <p className="card-label">Pendientes</p>
              <p className="card-value">{estadisticas.por_estado?.pendiente || 0}</p>
            </div>
          </div>

          <div className="estadistica-card">
            <div className="card-icon respondida">
              <FiMessageSquare />
            </div>
            <div className="card-content">
              <p className="card-label">Respondidas</p>
              <p className="card-value">{estadisticas.por_estado?.respondida || 0}</p>
            </div>
          </div>
        </section>
      )}

      <section className="filtros-section">
        <div className="filtro-group">
          <input
            type="text"
            placeholder="Buscar por número de guía..."
            value={searchTerm}
            onChange={handleBuscar}
            className="search-input"
          />
        </div>

        <div className="filtro-group">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Estado: Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="respondida">Respondida</option>
          </select>
        </div>

        <div className="filtro-group">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Tipo: Todos</option>
            <option value="falla_vehiculo">Falla Vehículo</option>
            <option value="accidente_transito">Accidente Tránsito</option>
            <option value="retencion_policial">Retención Policial</option>
            <option value="destinatario_ausente">Destinatario Ausente</option>
            <option value="direccion_incorrecta">Dirección Incorrecta</option>
            <option value="paquete_danado">Paquete Dañado</option>
            <option value="otra">Otra</option>
          </select>
        </div>

        <div className="filtro-group">
          <input
            type="date"
            value={filterFecha.inicio}
            onChange={(e) => setFilterFecha({ ...filterFecha, inicio: e.target.value })}
            className="filter-input"
            placeholder="Desde"
          />
        </div>

        <button onClick={handleLimpiarFiltros} className="btn-limpiar">
          Limpiar Filtros
        </button>
        
        <button 
          onClick={handleActualizarDatos} 
          className="btn-actualizar"
          disabled={loading}
          title="Actualizar datos"
        >
          <FiRefreshCw size={18} className={loading ? 'rotating' : ''} />
          Actualizar
        </button>
      </section>

      <section className="contenido-section">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <LoadingSpinner />
        ) : incidencias.length === 0 ? (
          <div className="empty-state">
            <p>No hay incidencias</p>
          </div>
        ) : (
          <>
            <div className="tabla-wrapper">
              <table className="tabla-incidencias">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nro Guía</th>
                    <th>Repartidor</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Foto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencias.map((incidencia) => (
                    <tr key={incidencia.id} className="fila-incidencia">
                      <td>{formatFecha(incidencia.fecha_reporte || incidencia.created_at)}</td>
                      <td className="numero-guia">{incidencia.numero_guia}</td>
                      <td>{incidencia.repartidor_id}</td>
                      <td>
                        <span className="tipo-badge">{getTipoBadge(incidencia.tipo_incidencia)}</span>
                      </td>
                      <td title={incidencia.descripcion}>
                        {truncateText(incidencia.descripcion)}
                      </td>
                      <td className="foto-cell">
                        {incidencia.foto_evidencia_url ? <FiCheck className="icon-check" /> : '-'}
                      </td>
                      <td>{getEstadoBadge(incidencia.estado)}</td>
                      <td className="acciones-cell">
                        <div className="menu-acciones">
                          <button
                            className="btn-menu"
                            onClick={() => toggleMenu(incidencia.id)}
                            title="Más opciones"
                          >
                            <FiMoreVertical />
                          </button>
                          {menuAbiertoId === incidencia.id && (
                            <div className="menu-dropdown">
                              <button
                                onClick={() => handleVerDetalles(incidencia)}
                                className="menu-item"
                              >
                                <FiEye /> Ver Detalles
                              </button>
                              {incidencia.estado === 'respondida' && (
                                <button
                                  onClick={() => handleVerRespuesta(incidencia)}
                                  className="menu-item"
                                >
                                  <FiMessageSquare /> Ver Respuesta
                                </button>
                              )}
                              {incidencia.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleResponder(incidencia)}
                                  className="menu-item"
                                >
                                  <FiMessageSquare /> Responder
                                </button>
                              )}
                              {incidencia.estado === 'respondida' && (
                                <button
                                  onClick={() => handleEliminar(incidencia)}
                                  className="menu-item delete"
                                  disabled={loadingResponse}
                                >
                                  <FiTrash2 /> Eliminar
                                </button>
                              )}
                              {incidencia.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleEliminar(incidencia)}
                                  className="menu-item delete"
                                >
                                  <FiTrash2 /> Eliminar
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="paginacion">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn-paginacion"
                >
                  Anterior
                </button>
                <span className="pagina-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-paginacion"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {showDetalleModal && (
        <IncidenciaDetailModal
          isOpen={showDetalleModal}
          incidencia={selectedIncidencia}
          onClose={() => {
            setShowDetalleModal(false);
            setSelectedIncidencia(null);
          }}
          onResponder={() => {
            setShowDetalleModal(false);
            handleResponder(selectedIncidencia);
          }}
        />
      )}

      {showResponderModal && (
        <ResponderIncidenciaModal
          isOpen={showResponderModal}
          incidencia={selectedIncidencia}
          onClose={() => {
            setShowResponderModal(false);
            setSelectedIncidencia(null);
          }}
          onResponder={confirmResponder}
          loading={loadingResponse}
        />
      )}

      {showVerRespuestaModal && (
        <VerRespuestaIncidenciaModal
          isOpen={showVerRespuestaModal}
          incidencia={selectedIncidencia}
          onClose={() => {
            setShowVerRespuestaModal(false);
            setSelectedIncidencia(null);
          }}
        />
      )}

      {showConfirmDeleteModal && (
        <ConfirmDeleteIncidenciaModal
          isOpen={showConfirmDeleteModal}
          incidencia={selectedIncidencia}
          onClose={() => {
            setShowConfirmDeleteModal(false);
            setSelectedIncidencia(null);
          }}
          onConfirm={confirmDelete}
          loading={loadingResponse}
        />
      )}
    </div>
  );
}
