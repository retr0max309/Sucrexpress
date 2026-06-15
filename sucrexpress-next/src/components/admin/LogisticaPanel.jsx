'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  IoMapOutline, IoPersonOutline, IoReloadOutline,
  IoSendOutline, IoSearchOutline, IoAlertCircleOutline,
  IoCheckmarkCircleOutline, IoNavigateOutline, IoTrashOutline
} from 'react-icons/io5';
import RutaMapaViewer from './RutaMapaViewer';
import toast from 'react-hot-toast';
import '../../assets/styles/logistica.css';

import apiClient from '@/lib/apiClient';

const API_BASE = process.env.NEXT_PUBLIC_NEST_API_URL
  ? `${process.env.NEXT_PUBLIC_NEST_API_URL}/api`
  : 'http://localhost:3001/api';
const getToken = () => (typeof window !== 'undefined'
  ? (localStorage.getItem('token') || localStorage.getItem('jwt_token'))
  : null);
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const MAX_PAQUETES = 10;

const LogisticaPanel = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [paquetesPendientes, setPaquetesPendientes] = useState([]);
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState(null);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [rutaCalculada, setRutaCalculada] = useState(null);
  const [cargandoRepartidores, setCargandoRepartidores] = useState(false);
  const [cargandoPaquetes, setCargandoPaquetes] = useState(false);
  const [calculando, setCalculando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  // Cargar repartidores activos
  const cargarRepartidores = useCallback(async () => {
    setCargandoRepartidores(true);
    try {
      const res = await fetch(`${API_BASE}/repartidores`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setRepartidores(data.data.filter(r => r.estado === 'Activo' || r.estado === 'activo'));
      }
    } catch {
      toast.error('Error al cargar repartidores');
    } finally {
      setCargandoRepartidores(false);
    }
  }, []);

  // Cargar paquetes pendientes
  const cargarPaquetes = useCallback(async () => {
    setCargandoPaquetes(true);
    try {
      const res = await fetch(`${API_BASE}/paquetes?estado=asignado`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setPaquetesPendientes(data.data || []);
    } catch {
      toast.error('Error al cargar paquetes');
    } finally {
      setCargandoPaquetes(false);
    }
  }, []);

  useEffect(() => {
    cargarRepartidores();
    cargarPaquetes();
  }, [cargarRepartidores, cargarPaquetes]);

  const seleccionarRepartidor = (rep) => {
    setRepartidorSeleccionado(rep);
    setRutaCalculada(null);
    setPaquetesSeleccionados([]);
  };

  const togglePaquete = (paquete) => {
    const yaSeleccionado = paquetesSeleccionados.find(p => p.id === paquete.id);
    if (yaSeleccionado) {
      setPaquetesSeleccionados(prev => prev.filter(p => p.id !== paquete.id));
    } else {
      if (paquetesSeleccionados.length >= MAX_PAQUETES) {
        toast.error(`Máximo ${MAX_PAQUETES} paquetes por ruta`);
        return;
      }
      setPaquetesSeleccionados(prev => [...prev, paquete]);
    }
    setRutaCalculada(null);
  };

  const calcularRuta = async () => {
    if (!repartidorSeleccionado) { toast.error('Selecciona un repartidor'); return; }
    if (paquetesSeleccionados.length === 0) { toast.error('Selecciona al menos 1 paquete'); return; }

    setCalculando(true);
    setRutaCalculada(null);
    try {
      const res = await fetch(`${API_BASE}/rutas/calcular`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          repartidor_id: repartidorSeleccionado.id,
          paquete_ids: paquetesSeleccionados.map(p => p.id)
        })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'Error al calcular la ruta');
        return;
      }
      setRutaCalculada(data.data);
      toast.success('¡Ruta óptima calculada!');
    } catch {
      toast.error('Error de conexión al calcular la ruta');
    } finally {
      setCalculando(false);
    }
  };

  const enviarRuta = async () => {
    if (!rutaCalculada) return;
    setEnviando(true);
    try {
      // 1. Guardar ruta en BD
      const resSave = await fetch(`${API_BASE}/rutas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(rutaCalculada)
      });
      const saveData = await resSave.json();
      if (!saveData.success) { toast.error(saveData.message || 'Error al guardar la ruta'); return; }

      // 2. Cambiar estado a "enviada" para disparar Realtime en la app móvil
      await fetch(`${API_BASE}/rutas/${saveData.data.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ estado: 'enviada' })
      });

      toast.success('✅ Ruta enviada al repartidor');
      setRutaCalculada(null);
      setPaquetesSeleccionados([]);
      cargarPaquetes();
    } catch {
      toast.error('Error al enviar la ruta');
    } finally {
      setEnviando(false);
    }
  };

  const limpiar = () => {
    setRepartidorSeleccionado(null);
    setPaquetesSeleccionados([]);
    setRutaCalculada(null);
    setBusqueda('');
  };

  // Paquetes filtrados por búsqueda
  const paquetesFiltrados = paquetesPendientes.filter(p => {
    const q = busqueda.toLowerCase();
    return (
      p.numero_guia?.toLowerCase().includes(q) ||
      p.nombre_destinatario?.toLowerCase().includes(q) ||
      p.ciudad_destino?.toLowerCase().includes(q)
    );
  });

  const formatearDuracion = (segundos) => {
    const min = Math.round(segundos / 60);
    if (min < 60) return `${min} min`;
    return `${Math.floor(min / 60)}h ${min % 60}min`;
  };

  return (
    <div className="logistica-container">
      {/* Header */}
      <div className="logistica-header">
        <div className="logistica-header-text">
          <h2>Logística de Distribución</h2>
          <p>Calcula y despacha rutas óptimas para tus repartidores en tiempo real</p>
        </div>
        <IoMapOutline className="logistica-header-icon" />
      </div>

      <div className="logistica-grid">
        {/* Panel izquierdo */}
        <div className="logistica-left">

          {/* Repartidores */}
          <div className="logistica-card">
            <div className="logistica-card-header">
              <span className="logistica-card-title">
                <IoPersonOutline /> Repartidor
              </span>
              <button onClick={cargarRepartidores} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <IoReloadOutline />
              </button>
            </div>
            <div className="logistica-card-body" style={{ padding: '0.75rem 1rem' }}>
              {cargandoRepartidores ? (
                <div className="logistica-loading"><IoReloadOutline className="spin" /> Cargando...</div>
              ) : repartidores.length === 0 ? (
                <div className="logistica-empty"><IoPersonOutline size={28} /> No hay repartidores activos</div>
              ) : (
                repartidores.map(rep => {
                  const tieneGps = !!(rep.latitud_actual && rep.longitud_actual);
                  return (
                    <div
                      key={rep.id}
                      className={`repartidor-item ${repartidorSeleccionado?.id === rep.id ? 'selected' : ''}`}
                      onClick={() => seleccionarRepartidor(rep)}
                    >
                      <div className="repartidor-avatar">
                        {rep.foto_perfil_url
                          ? <img src={rep.foto_perfil_url} alt={rep.nombre_completo} />
                          : rep.nombre_completo?.[0]?.toUpperCase()
                        }
                      </div>
                      <div className="repartidor-info">
                        <div className="repartidor-nombre">{rep.nombre_completo}</div>
                        <div className="repartidor-ciudad">{rep.ciudad} · {rep.tipo_vehiculo || 'Vehículo'}</div>
                      </div>
                      <div className={`gps-indicator ${tieneGps ? 'activo' : 'inactivo'}`} title={tieneGps ? 'GPS activo' : 'Sin GPS'} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Paquetes */}
          <div className="logistica-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="logistica-card-header">
              <span className="logistica-card-title">
                <IoNavigateOutline /> Paquetes aceptados
              </span>
              <span className="paquetes-counter">{paquetesSeleccionados.length}/{MAX_PAQUETES}</span>
            </div>
            <div className="logistica-card-body" style={{ flex: 1, overflowY: 'auto' }}>
              <div className="paquetes-search">
                <IoSearchOutline />
                <input
                  placeholder="Buscar guía, destinatario..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </div>
              {!repartidorSeleccionado && (
                <div className="alerta-gps">
                  <IoAlertCircleOutline /> Selecciona un repartidor primero
                </div>
              )}
              {cargandoPaquetes ? (
                <div className="logistica-loading"><IoReloadOutline className="spin" /> Cargando paquetes...</div>
              ) : paquetesFiltrados.length === 0 ? (
                <div className="logistica-empty">
                  <IoCheckmarkCircleOutline size={28} />
                  <span>No hay paquetes aceptados</span>
                  <small style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 4 }}>
                    El repartidor debe aceptar paquetes desde la app móvil
                  </small>
                </div>
              ) : (
                paquetesFiltrados.map(p => {
                  const seleccionado = !!paquetesSeleccionados.find(s => s.id === p.id);
                  const bloqueado = !repartidorSeleccionado;
                  return (
                    <div
                      key={p.id}
                      className={`paquete-check-item ${seleccionado ? 'checked' : ''} ${bloqueado ? 'disabled' : ''}`}
                      onClick={() => !bloqueado && togglePaquete(p)}
                    >
                      <input type="checkbox" checked={seleccionado} onChange={() => {}} disabled={bloqueado} />
                      <div className="paquete-check-info">
                        <div className="paquete-check-guia">{p.numero_guia}</div>
                        <div className="paquete-check-destinatario">{p.nombre_destinatario} {p.apellido_destinatario}</div>
                        <div className="paquete-check-direccion">{p.direccion_destino || p.direccion_exacta} · {p.ciudad_destino}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Acciones */}
            <div className="logistica-actions">
              <button
                className="btn-calcular"
                onClick={calcularRuta}
                disabled={!repartidorSeleccionado || paquetesSeleccionados.length === 0 || calculando}
              >
                {calculando
                  ? <><IoReloadOutline className="spin" /> Calculando...</>
                  : <><IoMapOutline /> Calcular Ruta Óptima</>
                }
              </button>
              {rutaCalculada && (
                <button className="btn-enviar" onClick={enviarRuta} disabled={enviando}>
                  {enviando
                    ? <><IoReloadOutline className="spin" /> Enviando...</>
                    : <><IoSendOutline /> Enviar Ruta al Repartidor</>
                  }
                </button>
              )}
              <button className="btn-limpiar" onClick={limpiar}>
                <IoTrashOutline style={{ marginRight: 4 }} /> Limpiar selección
              </button>
            </div>
          </div>
        </div>

        {/* Panel derecho — Mapa */}
        <div className="logistica-right">
          {/* Resumen de ruta calculada */}
          {rutaCalculada && (
            <div className="ruta-resumen">
              <div className="ruta-stats">
                <div className="ruta-stat">
                  <div className="ruta-stat-valor">{(rutaCalculada.distancia_total_m / 1000).toFixed(1)} km</div>
                  <div className="ruta-stat-label">Distancia</div>
                </div>
                <div className="ruta-stat">
                  <div className="ruta-stat-valor">{formatearDuracion(rutaCalculada.duracion_estimada_s)}</div>
                  <div className="ruta-stat-label">Duración est.</div>
                </div>
                <div className="ruta-stat">
                  <div className="ruta-stat-valor">{rutaCalculada.paquetes_orden?.length}</div>
                  <div className="ruta-stat-label">Paradas</div>
                </div>
              </div>
              <div className="ruta-paradas">
                {rutaCalculada.paquetes_orden?.map(parada => (
                  <div key={parada.paquete_id} className="ruta-parada-item">
                    <div className="ruta-parada-num">{parada.orden}</div>
                    <div className="ruta-parada-info">
                      <div className="ruta-parada-nombre">{parada.destinatario}</div>
                      <div className="ruta-parada-dir">{parada.direccion}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mapa */}
          <div className="mapa-wrapper">
            {GOOGLE_MAPS_KEY ? (
              <RutaMapaViewer
                apiKey={GOOGLE_MAPS_KEY}
                origenLat={rutaCalculada?.origen_lat || repartidorSeleccionado?.latitud_actual}
                origenLng={rutaCalculada?.origen_lng || repartidorSeleccionado?.longitud_actual}
                polyline={rutaCalculada?.polyline}
                paquetesOrden={rutaCalculada?.paquetes_orden}
                repartidorNombre={repartidorSeleccionado?.nombre_completo}
              />
            ) : (
              <div className="mapa-placeholder">
                <IoMapOutline className="mapa-placeholder-icon" />
                <p>API Key de Google Maps no configurada</p>
                <p style={{ fontSize: '0.8rem' }}>Agrega NEXT_PUBLIC_GOOGLE_MAPS_KEY al .env</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticaPanel;
