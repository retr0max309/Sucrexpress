const { getConnection } = require('../config/database');

class Paquete {
  static async create(data) {
    try {
      console.log('Iniciando creación de paquete con datos:', data);
      const { admin } = await getConnection();
      console.log('Conexión a Supabase obtenida');

      const insertData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('Datos a insertar en Supabase:', insertData);

      const { data: result, error } = await admin
        .from('paquetes')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (create):', JSON.stringify(error, null, 2));
        throw new Error(`Error al crear paquete en Supabase: ${error.message} - ${error.details || ''}`);
      }
      
      console.log('Paquete creado exitosamente con ID:', result?.id);
      return result;
    } catch (error) {
      console.error('Error en create:', error.message);
      throw error;
    }
  }

  static async findAll(where = {}) {
    try {
      const { admin } = await getConnection();
      let query = admin.from('paquetes').select('*');

      // Add filters if they exist
      Object.entries(where).forEach(([key, value]) => {
        if (value) {
          if (key === 'fecha') {
            // Filtrar por fecha usando created_at
            const startDate = new Date(value);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            query = query
              .gte('created_at', startDate.toISOString())
              .lt('created_at', endDate.toISOString());
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) {
        console.error('Error Supabase (findAll):', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  static async findByPk(id) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('paquetes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error Supabase (findByPk):', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en findByPk:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const { admin } = await getConnection();
      const { data, error } = await admin
        .from('paquetes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error Supabase (update):', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async destroy(id) {
    try {
      const { admin } = await getConnection();
      const { error } = await admin
        .from('paquetes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error Supabase (destroy):', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Error en destroy:', error);
      throw error;
    }
  }

  static async findOne(where) {
    try {
      const { admin } = await getConnection();
      let query = admin.from('paquetes').select('*');

      // Add filters
      Object.entries(where).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query.single();
      if (error) {
        // Si no se encuentra el registro, retornamos null en lugar de lanzar error
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error Supabase (findOne):', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error en findOne:', error);
      throw error;
    }
  }

  // Obtener el siguiente número de pedido para un cliente
  static async getProximoNroPedidoCliente(ciDestinatario) {
    try {
      const { admin } = await getConnection();
      
      const { data, error } = await admin
        .from('paquetes')
        .select('nro_pedido_cliente')
        .eq('ci_destinatario', ciDestinatario)
        .order('nro_pedido_cliente', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no hay registros previos, retornamos 1
        if (error.code === 'PGRST116') {
          return 1;
        }
        console.error('Error Supabase (getProximoNroPedidoCliente):', error);
        throw error;
      }

      return (data?.nro_pedido_cliente || 0) + 1;
    } catch (error) {
      console.error('Error en getProximoNroPedidoCliente:', error);
      throw error;
    }
  }

  // Obtener estadísticas de pedidos por cliente
  static async getEstadisticasCliente(ciDestinatario) {
    try {
      const { admin } = await getConnection();
      
      const { data, error } = await admin
        .from('paquetes')
        .select('nro_pedido_cliente, estado, created_at')
        .eq('ci_destinatario', ciDestinatario)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error Supabase (getEstadisticasCliente):', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalPedidos: 0,
          ultimoPedido: null,
          pedidosEntregados: 0,
          pedidosPendientes: 0,
          historial: []
        };
      }

      const totalPedidos = data.length;
      const pedidosEntregados = data.filter(p => p.estado === 'entregado').length;
      const pedidosPendientes = data.filter(p => p.estado === 'pendiente').length;
      const ultimoPedido = data[data.length - 1]?.nro_pedido_cliente;

      return {
        totalPedidos,
        ultimoPedido,
        pedidosEntregados,
        pedidosPendientes,
        historial: data
      };
    } catch (error) {
      console.error('Error en getEstadisticasCliente:', error);
      throw error;
    }
  }
}

module.exports = Paquete;
