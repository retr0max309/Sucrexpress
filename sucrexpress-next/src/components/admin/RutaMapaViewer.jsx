'use client';
import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/utils/googleMapsLoader';

// Decodifica un encoded polyline de Google a array de coordenadas LatLng
function decodificarPolyline(encoded) {
  const coords = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    coords.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coords;
}

// Distancia euclidiana aproximada entre dos puntos lat/lng
function distancia(a, b) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

/**
 * Divide el polyline completo en segmentos, uno por parada.
 * Cada segmento va desde la parada anterior hasta la actual.
 * Devuelve array de { coords, color }
 */
function dividirPolylinePorParadas(coords, paradas, colores) {
  if (!paradas.length || !coords.length) {
    return [{ coords, color: '#3b82f6' }];
  }

  const segmentos = [];
  let idxInicio = 0;

  paradas.forEach((parada, i) => {
    const destino = { lat: parseFloat(parada.lat), lng: parseFloat(parada.lng) };
    const color = colores[i % colores.length];

    // Encontrar el punto más cercano al destino desde idxInicio en adelante
    let minDist = Infinity;
    let idxDestino = idxInicio;
    for (let j = idxInicio; j < coords.length; j++) {
      const d = distancia(coords[j], destino);
      if (d < minDist) { minDist = d; idxDestino = j; }
      // Detener la búsqueda si ya pasamos el punto y la distancia crece
      if (d > minDist * 3 && j > idxInicio + 5) break;
    }

    // Incluir el punto del destino en el segmento
    const slice = coords.slice(idxInicio, idxDestino + 1);
    if (slice.length >= 2) {
      segmentos.push({ coords: slice, color });
    }
    idxInicio = idxDestino;
  });

  // Segmento restante al final (por si el polyline tiene puntos después del último destino)
  if (idxInicio < coords.length - 1) {
    const lastColor = colores[(paradas.length - 1) % colores.length];
    segmentos.push({ coords: coords.slice(idxInicio), color: lastColor });
  }

  return segmentos;
}

// Paleta de colores por ruta — cada repartidor tiene su propio color
const RUTAS_PALETA = [
  { marker: '#1d4ed8', nombre: 'Azul'    },
  { marker: '#b91c1c', nombre: 'Rojo'    },
  { marker: '#15803d', nombre: 'Verde'   },
  { marker: '#c2410c', nombre: 'Naranja' },
  { marker: '#6d28d9', nombre: 'Violeta' },
  { marker: '#0e7490', nombre: 'Cian'    },
];

// Colores para los pins numerados Y los tramos del polyline
const MARCADORES_COLORES = [
  '#ef4444', // rojo
  '#f97316', // naranja
  '#eab308', // amarillo
  '#22c55e', // verde
  '#06b6d4', // cian
  '#8b5cf6', // violeta
  '#ec4899', // rosa
  '#14b8a6', // teal
];

const RutaMapaViewer = ({ apiKey, origenLat, origenLng, polyline, paquetesOrden, repartidorNombre, routeIndex = 0 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const elementosRef = useRef([]);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;
    loadGoogleMaps(apiKey).then(() => inicializarMapa()).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    actualizarMapa();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polyline, paquetesOrden, origenLat, origenLng]);

  const inicializarMapa = () => {
    if (!mapRef.current || !window.google?.maps) return;
    const centro = origenLat && origenLng
      ? { lat: parseFloat(origenLat), lng: parseFloat(origenLng) }
      : { lat: -19.0452, lng: -65.2595 };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: centro,
      mapTypeId: 'roadmap',
      mapTypeControl: false,
      streetViewControl: false,
      mapId: 'DEMO_MAP_ID'
    });
    actualizarMapa();
  };

  const limpiarElementos = () => {
    elementosRef.current.forEach(({ marker, infoWindow, polyline: pl }) => {
      if (infoWindow) infoWindow.close();
      if (marker) marker.map = null;
      if (pl) pl.setMap(null);
    });
    elementosRef.current = [];
  };

  const actualizarMapa = async () => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    limpiarElementos();

    const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
    const bounds = new window.google.maps.LatLngBounds();
    const paleta = RUTAS_PALETA[routeIndex % RUTAS_PALETA.length];

    // ── Marcador de origen (repartidor) ─────────────────────────────────────
    if (origenLat && origenLng) {
      const pos = { lat: parseFloat(origenLat), lng: parseFloat(origenLng) };
      const el = document.createElement('div');
      el.style.cssText = `width:22px;height:22px;background:${paleta.marker};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);`;
      const marker = new AdvancedMarkerElement({
        position: pos, map: mapInstanceRef.current,
        title: repartidorNombre || 'Repartidor', content: el
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="font-weight:600;color:${paleta.marker};padding:4px 2px">📍 ${repartidorNombre || 'Repartidor'}<br><small style="font-weight:400;color:#64748b">Punto de partida</small></div>`
      });
      infoWindow.open({ anchor: marker, map: mapInstanceRef.current });
      elementosRef.current.push({ marker, infoWindow });
      bounds.extend(pos);
    }

    // ── Polyline dividido por paradas — cada tramo con su propio color ───────
    if (polyline) {
      const coords = decodificarPolyline(polyline);
      const paradasConCoords = (paquetesOrden || []).filter(p => p.lat && p.lng);

      if (paradasConCoords.length > 0) {
        // Dividir el polyline en un tramo por parada
        const segmentos = dividirPolylinePorParadas(coords, paradasConCoords, MARCADORES_COLORES);
        segmentos.forEach(({ coords: segCoords, color }) => {
          if (segCoords.length < 2) return;
          const rutaLine = new window.google.maps.Polyline({
            path: segCoords,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.92,
            strokeWeight: 5,
            map: mapInstanceRef.current
          });
          elementosRef.current.push({ polyline: rutaLine });
          segCoords.forEach(c => bounds.extend(c));
        });
      } else {
        // Sin paradas con coordenadas — dibujar el polyline completo en color de paleta
        const rutaLine = new window.google.maps.Polyline({
          path: coords, geodesic: true,
          strokeColor: paleta.marker, strokeOpacity: 0.92, strokeWeight: 5,
          map: mapInstanceRef.current
        });
        elementosRef.current.push({ polyline: rutaLine });
        coords.forEach(c => bounds.extend(c));
      }
    }

    // ── Marcadores numerados de paradas ──────────────────────────────────────
    if (paquetesOrden?.length) {
      paquetesOrden.forEach((parada) => {
        if (!parada.lat || !parada.lng) return;
        const pos = { lat: parseFloat(parada.lat), lng: parseFloat(parada.lng) };
        // El pin usa el MISMO color que el tramo del polyline que lleva a esa parada
        const color = MARCADORES_COLORES[(parada.orden - 1) % MARCADORES_COLORES.length];

        const pinEl = document.createElement('div');
        pinEl.style.cssText = 'position:relative;width:32px;height:40px;cursor:pointer;';
        pinEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
            <circle cx="16" cy="16" r="10" fill="white"/>
            <text x="16" y="20.5" text-anchor="middle" font-size="11" font-weight="bold" fill="${color}">${parada.orden}</text>
          </svg>`;

        const marker = new AdvancedMarkerElement({
          position: pos, map: mapInstanceRef.current,
          title: parada.destinatario, content: pinEl
        });
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="max-width:180px;padding:2px 0"><strong style="color:${color}">Parada ${parada.orden}</strong><br><b>${parada.destinatario}</b><br><small style="color:#64748b">${parada.direccion}</small></div>`
        });
        marker.addListener('click', () => infoWindow.open({ anchor: marker, map: mapInstanceRef.current }));
        elementosRef.current.push({ marker, infoWindow });
        bounds.extend(pos);
      });
    }

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  };

  useEffect(() => () => limpiarElementos(), []);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '12px' }}
    />
  );
};

export default RutaMapaViewer;
