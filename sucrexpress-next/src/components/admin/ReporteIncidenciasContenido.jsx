'use client';
import React from 'react';
import '../../assets/styles/reportes.css';

const ReporteIncidenciasContenido = ({ data }) => {
  if (!data) {
    return <div className="no-datos">No hay datos disponibles</div>;
  }

  const getBadgeClass = (estado) => {
    const clases = {
      'pendiente': 'badge-pendiente',
      'respondida': 'badge-respondida',
      'resuelta': 'badge-resuelta',
      'cancelada': 'badge-cancelada'
    };
    return clases[estado] || 'badge-pendiente';
  };

  return (
    <div className="reporte-contenido">
      <div className="resumen-stats">
        <div className="stat-card">
          <h3>Total Incidencias</h3>
          <p className="stat-valor">{data.total_incidencias}</p>
        </div>
        <div className="stat-card">
          <h3>Tiempo Promedio Respuesta</h3>
          <p className="stat-valor">
            {data.tiempo_promedio_respuesta_horas.toFixed(1)} hrs
          </p>
        </div>
      </div>

      {data.por_estado && Object.keys(data.por_estado).length > 0 && (
        <>
          <h3>Desglose por Estado</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.por_estado).map(([estado, cantidad]) => (
                <tr key={estado}>
                  <td>
                    <span className={getBadgeClass(estado)}>
                      {estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.por_tipo && Object.keys(data.por_tipo).length > 0 && (
        <>
          <h3>Desglose por Tipo</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.por_tipo).map(([tipo, cantidad]) => (
                <tr key={tipo}>
                  <td>{tipo.replace(/_/g, ' ')}</td>
                  <td>{cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.incidencias_por_repartidor && data.incidencias_por_repartidor.length > 0 && (
        <>
          <h3>Incidencias por Repartidor</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {data.incidencias_por_repartidor.map((rep) => (
                <tr key={rep.nombre}>
                  <td>{rep.nombre}</td>
                  <td>{rep.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReporteIncidenciasContenido;
