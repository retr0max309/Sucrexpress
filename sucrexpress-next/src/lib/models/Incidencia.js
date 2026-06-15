const validarTipoRespuesta = (tipo) => {
  const tiposValidos = ['comentario', 'agendar_reentrega', 'investigar', 'compensar', 'rechazar', 'otra'];
  return tiposValidos.includes(tipo);
};

const validarEstadoPaquete = (estado) => {
  const estadosValidos = ['pendiente', 'en_ruta', 'devuelto', 'en_investigacion', 'entregado', 'rechazado'];
  return estadosValidos.includes(estado);
};

const validarEstadoIncidencia = (estado) => {
  const estadosValidos = ['pendiente', 'respondida', 'resuelta', 'cancelada'];
  return estadosValidos.includes(estado);
};

const validarTipoIncidencia = (tipo) => {
  const tiposValidos = ['falla_vehiculo', 'accidente_transito', 'retencion_policial', 'destinatario_ausente', 'direccion_incorrecta', 'paquete_danado', 'otra'];
  return tiposValidos.includes(tipo);
};

const validarFiltros = (filtros) => {
  const errores = [];

  if (filtros.page && (isNaN(filtros.page) || filtros.page < 1)) {
    errores.push('page debe ser un número positivo');
  }

  if (filtros.limit && (isNaN(filtros.limit) || filtros.limit < 1 || filtros.limit > 100)) {
    errores.push('limit debe estar entre 1 y 100');
  }

  if (filtros.estado_incidencia && !validarEstadoIncidencia(filtros.estado_incidencia)) {
    errores.push('estado_incidencia inválido');
  }

  if (filtros.tipo_incidencia && !validarTipoIncidencia(filtros.tipo_incidencia)) {
    errores.push('tipo_incidencia inválido');
  }

  if (filtros.fecha_inicio && isNaN(Date.parse(filtros.fecha_inicio))) {
    errores.push('fecha_inicio debe ser una fecha válida en formato ISO');
  }

  if (filtros.fecha_fin && isNaN(Date.parse(filtros.fecha_fin))) {
    errores.push('fecha_fin debe ser una fecha válida en formato ISO');
  }

  return errores;
};

module.exports = {
  validarTipoRespuesta,
  validarEstadoPaquete,
  validarEstadoIncidencia,
  validarTipoIncidencia,
  validarFiltros
};
