import apiClient from '@/lib/apiClient';

export const incidenciasService = {

  getIncidencias: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (filters.estado)       params.append('estado', filters.estado);
    if (filters.tipo)         params.append('tipo_incidencia', filters.tipo);
    if (filters.search)       params.append('search', filters.search);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin)    params.append('fecha_fin', filters.fecha_fin);
    params.append('page', page);
    params.append('limit', limit);

    const response = await apiClient.get(`/incidencias?${params}`);
    return response.data;
  },

  getIncidenciaById: async (id) => {
    const response = await apiClient.get(`/incidencias/${id}`);
    return response.data;
  },

  responderIncidencia: async (id, respuesta, tipoRespuesta, nuevoEstado = null) => {
    const payload = {
      respuesta_admin: respuesta,
      tipo_respuesta: tipoRespuesta,
      nuevo_estado_paquete: nuevoEstado,
    };
    const response = await apiClient.post(`/incidencias/${id}/responder`, payload);
    return response.data;
  },

  resolverIncidencia: async (id) => {
    const response = await apiClient.put(`/incidencias/${id}/resolver`);
    return response.data;
  },

  cancelarIncidencia: async (id) => {
    const response = await apiClient.delete(`/incidencias/${id}`);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await apiClient.get('/incidencias/estadisticas/resumen');
    return response.data;
  },
};
