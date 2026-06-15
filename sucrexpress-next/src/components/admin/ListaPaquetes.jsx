'use client';
import React, { useState, useEffect } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoTrashOutline, 
  IoEyeOutline,
  IoRefreshOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoQrCodeOutline,
  IoCreateOutline
} from 'react-icons/io5';
import { paquetesService } from '../../services/paquetesService';
import toast from 'react-hot-toast';
import QRModal from '../modals/QRModal';
import DetallesPaqueteModal from '../modals/DetallesPaqueteModal';
import EditarPaqueteModal from '../modals/EditarPaqueteModal';
import '../../assets/styles/listaPaquetes.css';
import '../../assets/styles/qr.css';


const ListaPaquetes = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrModal, setQrModal] = useState({
    isOpen: false,
    qrCode: null,
    numeroGuia: null
  });
  const [detallesModal, setDetallesModal] = useState({
    isOpen: false,
    paquete: null
  });
  const [editarModal, setEditarModal] = useState({
    isOpen: false,
    paquete: null
  });
  const [filtros, setFiltros] = useState({
    estado: '',
    ciudad: '',
    busqueda: ''
  });


  // Lugares de Chuquisaca para filtros
  const lugaresChuquisaca = [
    'Sucre',
    'Yotala',
    'Poroma',
    'Tarabuco',
    'Yamparáez',
    'Zudáñez',
    'Presto',
    'Mojocoya',
    'Icla',
    'Padilla',
    'Tomina',
    'Sopachuy',
    'Villa Alcalá',
    'El Villar',
    'Monteagudo',
    'Huacareta',
    'Camargo',
    'San Lucas',
    'Incahuasi',
    'Villa Serrano',
    'Culpina',
    'Las Carreras',
    'Villa Abecia',
    'Azurduy'
  ];


  // Cargar paquetes al montar
  useEffect(() => {
    cargarPaquetes();
  }, []);


  // Función para cargar paquetes
  const cargarPaquetes = async () => {
    setLoading(true);
    try {
      // ✅ CORRECCIÓN: obtenerPaquetes() → obtenerTodos()
      const response = await paquetesService.obtenerTodos();
      if (response.success) {
        setPaquetes(response.data);
        console.log('Paquetes cargados:', response.data.length);
      }
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
      toast.error('Error al cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };


  // Manejar cambio de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };


  // Filtrar paquetes
  const paquetesFiltrados = paquetes.filter(paquete => {
    const matchEstado = !filtros.estado || paquete.estado === filtros.estado;
    const matchCiudad = !filtros.ciudad || paquete.ciudad_destino === filtros.ciudad;
    const matchBusqueda = !filtros.busqueda || 
      paquete.numero_guia.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      paquete.nombre_destinatario.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return matchEstado && matchCiudad && matchBusqueda;
  });


  // Eliminar paquete
  const handleEliminar = async (id, numero_guia) => {
    if (!window.confirm(`¿Está seguro de eliminar el paquete ${numero_guia}?`)) {
      return;
    }


    try {
      // ✅ CORRECCIÓN: eliminarPaquete() → eliminar()
      const response = await paquetesService.eliminar(id);
      if (response.success) {
        toast.success('Paquete eliminado exitosamente');
        cargarPaquetes();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el paquete');
    }
  };


  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { class: 'admin-badge-warning', text: 'Pendiente' },
      en_ruta: { class: 'admin-badge-primary', text: 'En Ruta' },
      entregado: { class: 'admin-badge-success', text: 'Entregado' },
      fallido: { class: 'admin-badge-danger', text: 'Fallido' }
    };
    
    const badge = badges[estado] || badges.pendiente;
    return <span className={`admin-badge ${badge.class}`}>{badge.text}</span>;
  };


  // Formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerQR = async (paquete) => {
    try {
      if (!paquete.qr_code) {
        const response = await paquetesService.obtenerQR(paquete.id);
        if (response.success) {
          setQrModal({
            isOpen: true,
            qrCode: response.data.qr_code,
            numeroGuia: response.data.numero_guia
          });
        }
      } else {
        setQrModal({
          isOpen: true,
          qrCode: paquete.qr_code,
          numeroGuia: paquete.numero_guia
        });
      }
    } catch (error) {
      console.error('Error al obtener QR:', error);
      toast.error('Error al cargar el QR');
    }
  };

  const handleDescargarQR = async (paquete) => {
    try {
      let qrCode = paquete.qr_code;
      if (!qrCode) {
        const response = await paquetesService.obtenerQR(paquete.id);
        if (response.success) {
          qrCode = response.data.qr_code;
        }
      }

      if (qrCode) {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `QR_${paquete.numero_guia}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR descargado');
      }
    } catch (error) {
      console.error('Error descargando QR:', error);
      toast.error('Error al descargar el QR');
    }
  };

  const handleImprimirQR = async (paquete) => {
    try {
      let qrCode = paquete.qr_code;
      if (!qrCode) {
        const response = await paquetesService.obtenerQR(paquete.id);
        if (response.success) {
          qrCode = response.data.qr_code;
        }
      }

      if (qrCode) {
        const printWindow = window.open('', '', 'height=600,width=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>QR - ${paquete.numero_guia}</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
                }
                .print-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                }
                img {
                  max-width: 400px;
                  border: 2px solid #333;
                  padding: 10px;
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <h2>Código QR del Paquete</h2>
                <h3>${paquete.numero_guia}</h3>
                <img src="${qrCode}" alt="QR Code" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Error imprimiendo QR:', error);
      toast.error('Error al imprimir el QR');
    }
  };

  const handleVerDetalles = (paquete) => {
    setDetallesModal({
      isOpen: true,
      paquete: paquete
    });
  };

  const handleEditar = (paquete) => {
    setEditarModal({
      isOpen: true,
      paquete: paquete
    });
  };

  const handleActualizarPaquete = () => {
    cargarPaquetes();
  };


  return (
    <div className="admin-table-container">
      {/* Header */}
      <div className="admin-table-header">
        <div>
          <h2 style={{ fontFamily: 'Panchang, sans-serif', fontWeight: 600, color: '#1e5f8c', marginBottom: '8px' }}>
            Lista de Paquetes
          </h2>
          <p style={{ color: '#64748b', fontFamily: 'Alpino, sans-serif', margin: 0 }}>
            Gestiona todos los envíos en Chuquisaca
          </p>
        </div>
        <button onClick={cargarPaquetes} className="admin-btn admin-btn-primary" disabled={loading}>
          <IoRefreshOutline />
          Actualizar
        </button>
      </div>


      {/* Filtros */}
      <div className="admin-filters">
        <div className="admin-filter-group">
          <IoSearchOutline className="filter-icon" />
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleFiltroChange}
            placeholder="Buscar por Nro. Guía o Destinatario..."
            className="admin-filter-input"
          />
        </div>


        <select
          name="estado"
          value={filtros.estado}
          onChange={handleFiltroChange}
          className="admin-filter-select"
        >
          <option value="">Todos los Estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_ruta">En Ruta</option>
          <option value="entregado">Entregado</option>
          <option value="fallido">Fallido</option>
        </select>


        <select
          name="ciudad"
          value={filtros.ciudad}
          onChange={handleFiltroChange}
          className="admin-filter-select"
        >
          <option value="">Todos los Lugares</option>
          {lugaresChuquisaca.map(lugar => (
            <option key={lugar} value={lugar}>{lugar}</option>
          ))}
        </select>
      </div>


      {/* Estadísticas */}
      <div className="admin-stats-mini">
        <div className="stat-mini">
          <span className="stat-mini-label">Total</span>
          <span className="stat-mini-value">{paquetesFiltrados.length}</span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Pendientes</span>
          <span className="stat-mini-value text-warning">
            {paquetesFiltrados.filter(p => p.estado === 'pendiente').length}
          </span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">En Ruta</span>
          <span className="stat-mini-value text-primary">
            {paquetesFiltrados.filter(p => p.estado === 'en_ruta').length}
          </span>
        </div>
        <div className="stat-mini">
          <span className="stat-mini-label">Entregados</span>
          <span className="stat-mini-value text-success">
            {paquetesFiltrados.filter(p => p.estado === 'entregado').length}
          </span>
        </div>
      </div>


      {/* Tabla */}
      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Cargando paquetes...</p>
        </div>
      ) : paquetesFiltrados.length === 0 ? (
        <div className="admin-empty">
          <IoSearchOutline size={48} color="#cbd5e1" />
          <p>No se encontraron paquetes</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nro. Guía</th>
                <th>Destinatario</th>
                <th>Lugar</th>
                <th>Peso (kg)</th>
                <th>Precio (Bs.)</th>
                <th>Estado</th>
                <th>Repartidor</th>
                <th>QR</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paquetesFiltrados.map(paquete => (
                <tr key={paquete.id}>
                  <td><strong>{paquete.numero_guia}</strong></td>
                  <td>{paquete.nombre_destinatario}</td>
                  <td>{paquete.ciudad_destino}</td>
                  <td>{parseFloat(paquete.peso).toFixed(2)}</td>
                  <td>Bs. {parseFloat(paquete.precio_envio).toFixed(2)}</td>
                  <td>{getEstadoBadge(paquete.estado)}</td>
                  <td>{paquete.repartidor_nombre || '-'}</td>
                  <td>
                    <div className="qr-table-cell-qr">
                      {paquete.qr_code ? (
                        <img 
                          src={paquete.qr_code} 
                          alt="QR" 
                          className="qr-thumbnail"
                          onClick={() => handleVerQR(paquete)}
                          title="Ver QR"
                        />
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>-</span>
                      )}
                    </div>
                  </td>
                  <td>{formatFecha(paquete.created_at)}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="qr-action-btn qr-action-btn-view"
                        title="Ver Detalles"
                        onClick={() => handleVerDetalles(paquete)}
                      >
                        <IoEyeOutline size={14} />
                        Ver
                      </button>
                      <button
                        className="qr-action-btn qr-action-btn-edit"
                        title="Editar Paquete"
                        onClick={() => handleEditar(paquete)}
                      >
                        <IoCreateOutline size={14} />
                        Editar
                      </button>
                      <button
                        className="qr-action-btn qr-action-btn-view"
                        title="Ver QR"
                        onClick={() => handleVerQR(paquete)}
                      >
                        <IoQrCodeOutline size={14} />
                        QR
                      </button>
                      <button
                        className="qr-action-btn qr-action-btn-download"
                        title="Descargar QR"
                        onClick={() => handleDescargarQR(paquete)}
                      >
                        <IoDownloadOutline size={14} />
                      </button>
                      <button
                        className="qr-action-btn qr-action-btn-print"
                        title="Imprimir QR"
                        onClick={() => handleImprimirQR(paquete)}
                      >
                        <IoPrintOutline size={14} />
                      </button>
                      {paquete.estado === 'pendiente' && (
                        <button
                          className="qr-action-btn qr-action-btn-delete"
                          title="Eliminar"
                          onClick={() => handleEliminar(paquete.id, paquete.numero_guia)}
                        >
                          <IoTrashOutline size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QRModal
        isOpen={qrModal.isOpen}
        qrCode={qrModal.qrCode}
        numeroGuia={qrModal.numeroGuia}
        onClose={() => setQrModal({ isOpen: false, qrCode: null, numeroGuia: null })}
      />

      <DetallesPaqueteModal
        isOpen={detallesModal.isOpen}
        paquete={detallesModal.paquete}
        onClose={() => setDetallesModal({ isOpen: false, paquete: null })}
      />

      <EditarPaqueteModal
        isOpen={editarModal.isOpen}
        paquete={editarModal.paquete}
        onClose={() => setEditarModal({ isOpen: false, paquete: null })}
        onActualizar={handleActualizarPaquete}
      />
    </div>
  );
};


export default ListaPaquetes;
