'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { 
  IoCubeOutline, 
  IoLocationOutline, 
  IoScaleOutline, 
  IoCashOutline, 
  IoDocumentTextOutline, 
  IoSaveOutline, 
  IoRefreshOutline, 
  IoPersonOutline,
  IoWarningOutline,
  IoMapOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { paquetesService } from '../../services/paquetesService';
import { useAdminFormValidation } from '../../hooks/useAdminFormValidation';
import { loadGoogleMaps } from '../../lib/utils/googleMapsLoader';
import toast from 'react-hot-toast';
import '../../assets/styles/nuevoPaquete.css';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
const SUCRE_CENTER = { lat: -19.0452, lng: -65.2595 };


const NuevoPaquete = () => {
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
    observaciones: ''
  };

  const { 
    formData, 
    errors, 
    updateField, 
    validateForm, 
    resetForm, 
    sanitizeFormData,
    hasErrors 
  } = useAdminFormValidation(initialData, 'paquete');

  const [loading, setLoading] = useState(false);
  // Estado para coordenadas del punto de entrega
  const [coords, setCoords] = useState({ lat: null, lng: null, confirmado: false });
  const [showMapa, setShowMapa] = useState(false);
  // Sugerencias de Places API (New)
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Refs para Google Maps
  const inputDireccionRef = useRef(null);
  const mapaRef = useRef(null);
  const mapaInstanceRef = useRef(null);
  const marcadorRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);

  // Cargar Google Maps SDK usando el loader singleton compartido
  const cargarGoogleMaps = useCallback(() => {
    if (!GOOGLE_MAPS_KEY) return;
    loadGoogleMaps(GOOGLE_MAPS_KEY).catch(console.error);
  }, []);

  // ── Places API (New): AutocompleteSuggestion ────────────────────────────
  const buscarSugerencias = useCallback(async (texto) => {
    if (!texto || texto.length < 3 || !window.google?.maps) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    try {
      const { AutocompleteSuggestion, AutocompleteSessionToken } =
        await window.google.maps.importLibrary('places');
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }
      const { suggestions: sugs } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: texto,
        sessionToken: sessionTokenRef.current,
        componentRestrictions: { country: 'bo' },
        locationBias: {
          center: new window.google.maps.LatLng(SUCRE_CENTER.lat, SUCRE_CENTER.lng),
          radius: 15000
        }
      });
      setSuggestions(sugs || []);
      setShowSuggestions(true);
    } catch (err) {
      console.warn('Places suggestion error:', err);
      setSuggestions([]);
    }
  }, []);

  const seleccionarSugerencia = async (sug) => {
    try {
      const place = sug.placePrediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });
      const lat = place.location.lat();
      const lng = place.location.lng();
      const main = sug.placePrediction.mainText?.text;
      const secondary = sug.placePrediction.secondaryText?.text;
      const dir = main ? (secondary ? `${main}, ${secondary}` : main) : place.formattedAddress;
      updateField('direccion_destino', dir);
      setCoords({ lat, lng, confirmado: false });
      setSuggestions([]); setShowSuggestions(false);
      sessionTokenRef.current = null;
      if (mapaInstanceRef.current && marcadorRef.current) {
        marcadorRef.current.position = { lat, lng };
        mapaInstanceRef.current.panTo({ lat, lng });
        mapaInstanceRef.current.setZoom(17);
      }
    } catch (err) { console.error('Error seleccionando lugar:', err); }
  };

  // Geocodificación inversa — usa endpoint server-side con GOOGLE_ROUTES_API_KEY
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('jwt_token'))
        : null;
      const res = await apiClient.get(`/geocode/reverse?lat=${lat}&lng=${lng}`);
      const data = res.data;
      if (data.success && data.address) {
        updateField('direccion_destino', data.address);
      } else {
        // Fallback silencioso con coordenadas
        updateField('direccion_destino', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      // Falla silenciosamente
      updateField('direccion_destino', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, [updateField]);

  const abrirMapa = async () => {
    setShowMapa(true);
    setTimeout(async () => {
      if (!mapaRef.current || !window.google?.maps) return;
      if (mapaInstanceRef.current) {
        if (coords.lat && marcadorRef.current) {
          marcadorRef.current.position = { lat: coords.lat, lng: coords.lng };
          mapaInstanceRef.current.panTo({ lat: coords.lat, lng: coords.lng });
        }
        return;
      }
      const centro = coords.lat ? { lat: coords.lat, lng: coords.lng } : SUCRE_CENTER;
      const map = new window.google.maps.Map(mapaRef.current, {
        zoom: coords.lat ? 17 : 14,
        center: centro,
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        mapId: 'DEMO_MAP_ID'
      });
      // Marcador draggable con AdvancedMarkerElement (API nueva, no legacy)
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
      const pinEl = document.createElement('div');
      pinEl.style.cssText = 'width:32px;height:32px;background:#4f46e5;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(79,70,229,0.5);cursor:grab';
      const marcador = new AdvancedMarkerElement({
        position: centro, map,
        title: 'Arrastra para ajustar el punto de entrega',
        content: pinEl,
        gmpDraggable: true
      });
      marcador.addListener('dragend', () => {
        const pos = marcador.position;
        const lat = pos.lat, lng = pos.lng;
        setCoords({ lat, lng, confirmado: false });
        reverseGeocode(lat, lng);
      });
      map.addListener('click', (e) => {
        marcador.position = e.latLng;
        const lat = e.latLng.lat(), lng = e.latLng.lng();
        setCoords({ lat, lng, confirmado: false });
        reverseGeocode(lat, lng);
      });
      mapaInstanceRef.current = map;
      marcadorRef.current = marcador;
    }, 100);
  };

  const confirmarUbicacion = () => {
    if (!coords.lat) return;
    setCoords(prev => ({ ...prev, confirmado: true }));
    setShowMapa(false);
    toast.success('📍 Punto de entrega confirmado');
  };


  // Tarifa fija para Sucre (ciudad de operación actual)
  const CIUDAD_OPERACION = 'Sucre';
  const TARIFA_SUCRE = 12;

  // Calcular recargo por peso
  const calcularRecargoPorPeso = (peso) => {
    const pesoNum = parseFloat(peso) || 0;
    
    if (pesoNum <= 2) return 0;
    if (pesoNum <= 5) return 10;
    if (pesoNum <= 10) return 20;
    if (pesoNum <= 20) return 35;
    return 50 + Math.ceil((pesoNum - 20) * 2.5);
  };

  // Calcular precio automáticamente (siempre Sucre)
  const calcularPrecio = (peso) => {
    if (!peso) return 0;
    const recargoPeso = calcularRecargoPorPeso(peso);
    return TARIFA_SUCRE + recargoPeso;
  };

  // Recalcular precio cuando cambia el peso (ciudad siempre es Sucre)
  useEffect(() => {
    if (formData.peso) {
      const precioCalculado = calcularPrecio(formData.peso);
      updateField('precio_envio', precioCalculado.toFixed(2));
    }
  }, [formData.peso, updateField]);

  // Cargar Google Maps SDK al montar el componente
  useEffect(() => {
    cargarGoogleMaps();
    return () => clearTimeout(debounceRef.current);
  }, [cargarGoogleMaps]);

  // Prefijar ciudad al montar
  useEffect(() => {
    updateField('ciudad_destino', CIUDAD_OPERACION);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  // Limpiar formulario
  const handleReset = () => {
    resetForm();
    setCoords({ lat: null, lng: null, confirmado: false });
    setSuggestions([]); setShowSuggestions(false);
    setShowMapa(false);
    mapaInstanceRef.current = null;
    marcadorRef.current = null;
    sessionTokenRef.current = null;
  };

  const handleAutoFill = () => {
    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Pedro', 'Rosa', 'Luis', 'Carmen', 'José', 'Patricia', 'Miguel', 'Isabel'];
    const apellidos = ['García', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'Sánchez', 'Fernández', 'Torres', 'Ramírez', 'Flores', 'Morales', 'Gutierrez'];

    // Direcciones reales de Sucre, Bolivia
    const direccionesSucre = [
      'Calle Junín',
      'Avenida Hernando Siles',
      'Calle España',
      'Avenida Ostria Gutiérrez',
      'Calle Bolívar',
      'Avenida Venezuela',
      'Calle Ravelo',
      'Calle Arenales',
      'Avenida del Maestro',
      'Calle Dalence',
      'Calle Potosí',
      'Avenida Juana Azurduy de Padilla',
      'Calle Loa',
      'Calle Grau',
      'Avenida de las Américas'
    ];

    const contenidos = [
      'Paquete de ropa y accesorios',
      'Libros y material de lectura',
      'Electrónica y accesorios',
      'Productos de higiene personal',
      'Artículos para el hogar',
      'Ropa deportiva',
      'Complementos y accesorios varios',
      'Material escolar y oficina',
    ];

    const nombAleatorio = nombres[Math.floor(Math.random() * nombres.length)];
    const apellidoAleatorio = apellidos[Math.floor(Math.random() * apellidos.length)];
    const ciAleatorio = String(Math.floor(Math.random() * 8000000 + 1000000));
    const pesoAleatorio = (Math.random() * 10 + 0.5).toFixed(1);
    const direccionAleatoria = direccionesSucre[Math.floor(Math.random() * direccionesSucre.length)];
    const contenidoAleatorio = contenidos[Math.floor(Math.random() * contenidos.length)];
    const numeroAleatorio = String(Math.floor(Math.random() * 999 + 1));
    const precioCalculado = calcularPrecio(pesoAleatorio);

    const datosAleatorios = {
      nombre_destinatario: nombAleatorio,
      apellido_destinatario: apellidoAleatorio,
      ci_destinatario: ciAleatorio,
      email_destinatario: `${nombAleatorio.toLowerCase()}.${apellidoAleatorio.toLowerCase().replace(' ', '')}@email.com`,
      telefono_destinatario: `+591 ${Math.floor(Math.random() * 9000000 + 1000000)}`,
      direccion_destino: direccionAleatoria,
      numero_casa: numeroAleatorio,
      numero_departamento: Math.random() > 0.6 ? String(Math.floor(Math.random() * 10 + 1)) : '',
      ciudad_destino: CIUDAD_OPERACION,
      contenido: contenidoAleatorio,
      peso: pesoAleatorio,
      precio_envio: precioCalculado.toFixed(2),
      observaciones: ''
    };

    Object.keys(datosAleatorios).forEach(field => updateField(field, datosAleatorios[field]));
    toast.success(`Datos de prueba cargados: ${nombAleatorio} ${apellidoAleatorio} — Sucre`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar y sanitizar
    if (!validateForm()) {
      toast.error('Por favor corrija los errores del formulario');
      return;
    }

    setLoading(true);

    try {
      // Sanitizar datos antes de enviar
      const datosLimpios = sanitizeFormData();
      
      const numero_guia = `GS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const paqueteData = {
        numero_guia,
        nombre_destinatario: datosLimpios.nombre_destinatario,
        apellido_destinatario: datosLimpios.apellido_destinatario,
        ci_destinatario: datosLimpios.ci_destinatario,
        email_destinatario: datosLimpios.email_destinatario,
        telefono_destinatario: datosLimpios.telefono_destinatario,
        direccion_destino: datosLimpios.direccion_destino,
        numero_casa: datosLimpios.numero_casa,
        numero_departamento: datosLimpios.numero_departamento || null,
        ciudad_destino: datosLimpios.ciudad_destino,
        contenido: datosLimpios.contenido,
        peso: parseFloat(datosLimpios.peso),
        precio_envio: parseFloat(datosLimpios.precio_envio),
        observaciones: datosLimpios.observaciones || null,
        // Coordenadas del punto de entrega (autocomplete o marcador manual)
        ...(coords.lat && coords.lng && {
          latitud_destino: coords.lat,
          longitud_destino: coords.lng
        })
      };

      const response = await paquetesService.crear(paqueteData);

      if (response.success) {
        toast.success(`Paquete creado exitosamente. Nro. Guía: ${response.data.numero_guia}`);
        handleReset();
      }
    } catch (error) {
      console.error('Error al crear paquete:', error);
      toast.error(error.response?.data?.message || 'Error al crear el paquete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nuevo-paquete-container">
      <div className="nuevo-paquete-header">
        <div className="header-icon">
          <IoCubeOutline size={32} />
        </div>
        <div className="header-text">
          <h2>Crear Nuevo Paquete</h2>
          <p>Ingrese los datos del paquete para crear una nueva guía de envío</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="nuevo-paquete-form">
        {/* Información del Destinatario */}
        <div className="form-section">
          <div className="section-header">
            <IoPersonOutline size={24} />
            <h3>Información del Destinatario</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre_destinatario">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nombre_destinatario"
                name="nombre_destinatario"
                value={formData.nombre_destinatario}
                onChange={handleChange}
                placeholder="Ej: Juan"
                className={errors.nombre_destinatario ? 'error' : ''}
              />
              {errors.nombre_destinatario && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.nombre_destinatario}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="apellido_destinatario">
                Apellido <span className="required">*</span>
              </label>
              <input
                type="text"
                id="apellido_destinatario"
                name="apellido_destinatario"
                value={formData.apellido_destinatario}
                onChange={handleChange}
                placeholder="Ej: Pérez López"
                className={errors.apellido_destinatario ? 'error' : ''}
              />
              {errors.apellido_destinatario && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.apellido_destinatario}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ci_destinatario">
                Cédula de Identidad <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ci_destinatario"
                name="ci_destinatario"
                value={formData.ci_destinatario}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                className={errors.ci_destinatario ? 'error' : ''}
              />
              {errors.ci_destinatario && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.ci_destinatario}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email_destinatario">
                Correo Electrónico <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email_destinatario"
                name="email_destinatario"
                value={formData.email_destinatario}
                onChange={handleChange}
                placeholder="Ej: juan@email.com"
                className={errors.email_destinatario ? 'error' : ''}
              />
              {errors.email_destinatario && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.email_destinatario}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono_destinatario">
                Teléfono <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="telefono_destinatario"
                name="telefono_destinatario"
                value={formData.telefono_destinatario}
                onChange={handleChange}
                placeholder="Ej: +591 76123456"
                className={errors.telefono_destinatario ? 'error' : ''}
              />
              {errors.telefono_destinatario && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.telefono_destinatario}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ciudad_destino">
                Ciudad de Destino <span className="required">*</span>
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.875rem 1rem',
                background: '#f1f5f9',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                color: '#334155',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'not-allowed'
              }}>
                <IoLocationOutline size={18} color="#3b82f6" />
                Sucre, Bolivia
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>
                  Zona de cobertura
                </span>
              </div>
              <input type="hidden" name="ciudad_destino" value="Sucre" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group direccion-group">
              <label htmlFor="direccion_destino">
                <IoLocationOutline size={16} /> Dirección <span className="required">*</span>
                {!GOOGLE_MAPS_KEY && <span className="badge-nokey">Sin API Key</span>}
              </label>
              <div className="direccion-input-wrapper">
                <input
                  ref={inputDireccionRef}
                  type="text"
                  id="direccion_destino"
                  name="direccion_destino"
                  value={formData.direccion_destino}
                  onChange={(e) => {
                    handleChange(e);
                    clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => buscarSugerencias(e.target.value), 350);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Busca negocios, restaurantes, plazas, calles..."
                  className={errors.direccion_destino ? 'error' : ''}
                  autoComplete="off"
                />
                {/* Dropdown de sugerencias (Places API New) */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="places-dropdown">
                    {suggestions.map((sug, idx) => (
                      <button key={idx} type="button" className="places-dropdown-item"
                        onMouseDown={() => seleccionarSugerencia(sug)}>
                        <IoLocationOutline size={15} />
                        <div className="places-texts">
                          <span className="places-main">{sug.placePrediction?.mainText?.text}</span>
                          <span className="places-secondary">{sug.placePrediction?.secondaryText?.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Badge de coordenadas */}
                {coords.lat && (
                  <div className={`coords-badge ${coords.confirmado ? 'confirmado' : 'pendiente'}`}>
                    {coords.confirmado
                      ? <><IoCheckmarkCircleOutline size={13} /> Ubicación confirmada</>
                      : <><IoMapOutline size={13} /> Ubicación detectada</>
                    }
                  </div>
                )}
              </div>
              {/* Botón para abrir mini-mapa */}
              {GOOGLE_MAPS_KEY && (
                <button
                  type="button"
                  className={`btn-mapa-toggle ${showMapa ? 'activo' : ''}`}
                  onClick={() => {
                    if (showMapa) {
                      setShowMapa(false);
                    } else {
                      abrirMapa();
                    }
                  }}
                >
                  <IoMapOutline size={16} />
                  {showMapa ? 'Cerrar mapa' : coords.lat ? 'Ajustar punto en mapa' : 'Fijar punto en mapa'}
                </button>
              )}
              {errors.direccion_destino && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.direccion_destino}
                </span>
              )}

              {/* Mini-mapa draggable */}
              {showMapa && (
                <div className="mini-mapa-container">
                  <div className="mini-mapa-hint">
                    <IoMapOutline size={14} />
                    <span>Arrastra el marcador o haz clic en el mapa para ajustar el punto exacto de entrega</span>
                    <button type="button" className="mini-mapa-close" onClick={() => setShowMapa(false)}>
                      <IoCloseOutline size={18} />
                    </button>
                  </div>
                  <div ref={mapaRef} className="mini-mapa" />
                  {coords.lat && (
                    <div className="mini-mapa-footer">
                      <span className="mini-mapa-coords">
                        📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                      </span>
                      <button type="button" className="btn-confirmar-ubicacion" onClick={confirmarUbicacion}>
                        <IoCheckmarkCircleOutline size={16} /> Confirmar esta ubicación
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="numero_casa">
                Número de Casa <span className="required">*</span>
              </label>
              <input
                type="text"
                id="numero_casa"
                name="numero_casa"
                value={formData.numero_casa}
                onChange={handleChange}
                placeholder="Ej: 123"
                className={errors.numero_casa ? 'error' : ''}
              />
              {errors.numero_casa && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.numero_casa}
                </span>
              )}
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="numero_departamento">
              Número de Departamento (Opcional)
            </label>
            <input
              type="text"
              id="numero_departamento"
              name="numero_departamento"
              value={formData.numero_departamento}
              onChange={handleChange}
              placeholder="Ej: 4B"
            />
          </div>
        </div>

        {/* Detalles del Paquete */}
        <div className="form-section">
          <div className="section-header">
            <IoCubeOutline size={24} />
            <h3>Detalles del Paquete</h3>
          </div>

          <div className="form-group">
            <label htmlFor="contenido">
              Contenido del Paquete <span className="required">*</span>
            </label>
            <textarea
              id="contenido"
              name="contenido"
              value={formData.contenido}
              onChange={handleChange}
              placeholder="Describa qué contiene el paquete (Ej: Ropa, Libros, etc.)"
              rows="3"
              className={errors.contenido ? 'error' : ''}
            />
            {errors.contenido && (
              <span className="error-message">
                <IoWarningOutline size={14} />
                {errors.contenido}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peso">
                <IoScaleOutline /> Peso (kg) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="peso"
                name="peso"
                value={formData.peso}
                onChange={handleChange}
                placeholder="Ej: 2.5"
                step="0.01"
                min="0.1"
                max="1000"
                className={errors.peso ? 'error' : ''}
              />
              {errors.peso && (
                <span className="error-message">
                  <IoWarningOutline size={14} />
                  {errors.peso}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="precio_envio">
                <IoCashOutline /> Precio de Envío (Bs) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="precio_envio"
                name="precio_envio"
                value={formData.precio_envio}
                placeholder="Se calcula automáticamente"
                step="0.01"
                disabled
                className="readonly-field"
              />
              {formData.peso && (
                <span className="info-message">
                  Tarifa base Sucre: Bs. {TARIFA_SUCRE} + Recargo por peso: Bs. {calcularRecargoPorPeso(formData.peso)}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">
              <IoDocumentTextOutline /> Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Información adicional sobre el paquete (opcional)"
              rows="3"
            />
          </div>
        </div>

        {/* Aviso de validación */}
        {hasErrors && (
          <div className="validation-alert">
            <IoWarningOutline size={20} />
            <span>Hay errores de validación. Por favor revise los campos marcados.</span>
          </div>
        )}

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleAutoFill}
            className="btn-autofill"
            disabled={loading}
            title="Cargar datos de prueba automáticamente"
          >
            <IoRefreshOutline size={20} />
            Auto-llenar (Pruebas)
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-reset"
            disabled={loading}
          >
            <IoRefreshOutline size={20} />
            Limpiar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading || hasErrors}
            title={hasErrors ? 'Corrija los errores para continuar' : 'Guardar nuevo paquete'}
          >
            <IoSaveOutline size={20} />
            {loading ? 'Guardando...' : 'Guardar Paquete'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoPaquete;
