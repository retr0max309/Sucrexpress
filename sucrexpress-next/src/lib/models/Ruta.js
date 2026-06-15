const { getConnection } = require('../config/database');

class Ruta {
  constructor(data) {
    this.id = data.id;
    this.repartidor_id = data.repartidor_id;
    this.estado = data.estado;
    this.origen_lat = data.origen_lat;
    this.origen_lng = data.origen_lng;
    this.polyline = data.polyline;
    this.distancia_total_m = data.distancia_total_m;
    this.duracion_estimada_s = data.duracion_estimada_s;
    this.paquetes_orden = data.paquetes_orden || [];
    this.calculada_at = data.calculada_at;
    this.enviada_at = data.enviada_at;
    this.iniciada_at = data.iniciada_at;
    this.completada_at = data.completada_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // campos join
    this.repartidor_nombre = data.repartidor_nombre;
  }

  static async getAll({ repartidor_id, estado } = {}) {
    try {
      const { admin } = await getConnection();
      let query = admin
        .from('rutas')
        .select(`*, repartidores(nombre_completo, foto_perfil_url, ciudad)`)
        .order('created_at', { ascending: false });

      if (repartidor_id) query = query.eq('repartidor_id', repartidor_id);
      if (estado) query = query.eq('estado', estado);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('rutas')
        .select(`*, repartidores(nombre_completo, foto_perfil_url, ciudad, telefono)`)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { admin } = await getConnection();
      const { data: nueva, error } = await admin
        .from('rutas')
        .insert([{
          repartidor_id: data.repartidor_id,
          estado: 'pendiente',
          origen_lat: data.origen_lat,
          origen_lng: data.origen_lng,
          polyline: data.polyline,
          distancia_total_m: data.distancia_total_m,
          duracion_estimada_s: data.duracion_estimada_s,
          paquetes_orden: data.paquetes_orden,
          calculada_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return nueva;
    } catch (error) {
      throw error;
    }
  }

  static async updateEstado(id, estado) {
    try {
      const { admin } = await getConnection();
      const timestampField = {
        en_progreso: { iniciada_at: new Date().toISOString() },
        completada:  { completada_at: new Date().toISOString() },
        enviada:     { enviada_at: new Date().toISOString() },
      }[estado] || {};

      const { data, error } = await admin
        .from('rutas')
        .update({ estado, ...timestampField })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { admin } = await getConnection();
      const { error } = await admin.from('rutas').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Ruta;
