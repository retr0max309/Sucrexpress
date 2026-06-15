const { getConnection } = require('../config/database');

class Repartidor {
  constructor(data) {
    this.id = data.id;
    this.uid = data.uid;
    this.nombre_completo = data.nombre_completo;
    this.email = data.email;
    this.telefono = data.telefono;
    this.numero_ci = data.numero_ci;
    this.tipo_vehiculo = data.tipo_vehiculo;
    this.ciudad = data.ciudad;
    this.estado = data.estado;
    this.verificado = data.verificado;
    this.cantidad_entregas = data.cantidad_entregas;
    this.calificacion = data.calificacion;
    this.foto_perfil_url = data.foto_perfil_url;
    this.foto_ci_url = data.foto_ci_url;
    this.created_at = data.created_at;
    // Campos de ubicación GPS (actualizados por la app móvil)
    this.latitud_actual = data.latitud_actual ?? null;
    this.longitud_actual = data.longitud_actual ?? null;
    this.ultima_ubicacion_at = data.ultima_ubicacion_at ?? null;
  }

  static async getAll() {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(r => new Repartidor(r));
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new Repartidor(data) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new Repartidor(data) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findByCI(numero_ci) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .eq('numero_ci', numero_ci)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? new Repartidor(data) : null;
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    try {
      const { admin } = await getConnection();

      const repartidorData = {
        uid: data.uid,
        nombre_completo: data.nombre_completo,
        email: data.email.toLowerCase(),
        telefono: data.telefono,
        numero_ci: data.numero_ci,
        tipo_vehiculo: data.tipo_vehiculo,
        ciudad: data.ciudad,
        estado: data.estado || 'Activo',
        verificado: data.verificado || false,
        cantidad_entregas: 0,
        calificacion: 0.0,
        foto_perfil_url: data.foto_perfil_url || null,
        foto_ci_url: data.foto_ci_url || null
      };

      const { data: newRepartidor, error } = await admin
        .from('repartidores')
        .insert([repartidorData])
        .select()
        .single();

      if (error) throw error;
      return new Repartidor(newRepartidor);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? new Repartidor(data) : null;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .update({ estado: 'Inactivo' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? new Repartidor(data) : null;
    } catch (error) {
      throw error;
    }
  }

  static async getByEstado(estado) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .eq('estado', estado)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(r => new Repartidor(r));
    } catch (error) {
      throw error;
    }
  }

  static async getByCiudad(ciudad) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('repartidores')
        .select('*')
        .eq('ciudad', ciudad)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(r => new Repartidor(r));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Repartidor;
