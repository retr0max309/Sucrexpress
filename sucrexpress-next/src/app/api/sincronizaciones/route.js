import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/config/database';
import { verifyAuth } from '@/lib/auth';

function mapearTipoEventoPaquete(estado) {
  const mapeo = {
    'entregado': { tipo_evento: 'entregado', icono_fa: 'fas fa-check-circle' },
    'en_ruta': { tipo_evento: 'en_ruta', icono_fa: 'fas fa-truck' },
    'devuelto': { tipo_evento: 'devuelto', icono_fa: 'fas fa-undo' },
    'en_ruta_con_incidencia': { tipo_evento: 'con_incidencia', icono_fa: 'fas fa-exclamation-circle' }
  };
  return mapeo[estado] || { tipo_evento: estado, icono_fa: 'fas fa-box' };
}

function mapearTipoEventoIncidencia(tipo_incidencia) {
  const mapeo = {
    'accidente_transito': { tipo_evento: 'accidente', icono_fa: 'fas fa-car-crash' },
    'destinatario_ausente': { tipo_evento: 'destinatario_ausente', icono_fa: 'fas fa-user-slash' },
    'direccion_incorrecta': { tipo_evento: 'direccion_incorrecta', icono_fa: 'fas fa-map-location-dot' },
    'paquete_danado': { tipo_evento: 'danado', icono_fa: 'fas fa-box-open' },
    'falla_vehiculo': { tipo_evento: 'falla_vehiculo', icono_fa: 'fas fa-engine-warning' },
    'retencion_policial': { tipo_evento: 'retencion', icono_fa: 'fas fa-shield-halved' },
    'otra': { tipo_evento: 'otra', icono_fa: 'fas fa-circle-exclamation' }
  };
  return mapeo[tipo_incidencia] || { tipo_evento: 'otra', icono_fa: 'fas fa-circle-exclamation' };
}

export async function obtenerPaquetesRecientes(limite, desdeTimestamp = null) {
  const { admin: supabase } = await getConnection();
  let query = supabase.from('paquetes').select('id, numero_guia, nombre_destinatario, ciudad_destino, estado, updated_at').order('updated_at', { ascending: false }).limit(limite);
  if (desdeTimestamp) query = query.gt('updated_at', desdeTimestamp);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(paq => {
    const { tipo_evento, icono_fa } = mapearTipoEventoPaquete(paq.estado);
    return { id: paq.id, tipo: 'paquete', tipo_evento, icono_fa, numero_guia: paq.numero_guia, destinatario: paq.nombre_destinatario, ciudad: paq.ciudad_destino, estado: paq.estado, timestamp: paq.updated_at };
  });
}

export async function obtenerIncidenciasRecientes(limite, desdeTimestamp = null) {
  const { admin: supabase } = await getConnection();
  let query = supabase.from('incidencias').select('id, numero_guia, repartidor_id, tipo_incidencia, estado, updated_at').order('updated_at', { ascending: false }).limit(limite);
  if (desdeTimestamp) query = query.gt('updated_at', desdeTimestamp);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return await Promise.all(data.map(async (inc) => {
    const { data: rep } = await supabase.from('repartidores').select('nombre').eq('uid', inc.repartidor_id).single();
    const { tipo_evento, icono_fa } = mapearTipoEventoIncidencia(inc.tipo_incidencia);
    return { id: inc.id, tipo: 'incidencia', tipo_evento, icono_fa, numero_guia: inc.numero_guia, repartidor: rep?.nombre || 'Desconocido', tipo_incidencia: inc.tipo_incidencia, estado_incidencia: inc.estado, timestamp: inc.updated_at };
  }));
}

export async function GET(request) {
  const auth = verifyAuth(request);
  if (!auth.success) return NextResponse.json(auth, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite')) || 10;
    
    const paquetes = await obtenerPaquetesRecientes(limite);
    const incidencias = await obtenerIncidenciasRecientes(limite);
    
    const combinados = [...paquetes, ...incidencias].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limite);
    
    return NextResponse.json({ success: true, data: combinados });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al obtener sincronizaciones', error: error.message }, { status: 500 });
  }
}
