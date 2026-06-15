'use client';
import React from 'react';
import '../../assets/styles/reportes.css';

const ReportePaquetesContenido = ({ data }) => {
  if (!data) {
    return <div className="no-datos">No hay datos disponibles</div>;
  }

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="reporte-contenido">
      <div className="resumen-stats">
        <div className="stat-card">
          <h3>Total Paquetes</h3>
          <p className="stat-valor">{data.total_paquetes}</p>
        </div>
        <div className="stat-card">
          <h3>Entregados</h3>
          <p className="stat-valor exito">
            {data.entregados_exitosos} ({data.tasa_exito}%)
          </p>
        </div>
        <div className="stat-card">
          <h3>No Entregados</h3>
          <p className="stat-valor error">{data.no_entregados}</p>
        </div>
      </div>

      {data.detalle?.por_dia && data.detalle.por_dia.length > 0 && (
        <>
          <h3>Detalle Diario</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Total</th>
                <th>Exitosos</th>
                <th>No Exitosos</th>
                <th>% Éxito</th>
              </tr>
            </thead>
            <tbody>
              {data.detalle.por_dia.map((dia) => (
                <tr key={dia.fecha}>
                  <td>{formatearFecha(dia.fecha)}</td>
                  <td>{dia.total}</td>
                  <td className="exito">{dia.exitosos}</td>
                  <td className="error">{dia.no_exitosos}</td>
                  <td>{dia.tasa_exito}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.detalle?.por_estado && Object.keys(data.detalle.por_estado).length > 0 && (
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
              {Object.entries(data.detalle.por_estado).map(([estado, cantidad]) => (
                <tr key={estado}>
                  <td>{estado.replace(/_/g, ' ')}</td>
                  <td>{cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {data.detalle?.por_ciudad && Object.keys(data.detalle.por_ciudad).length > 0 && (
        <>
          <h3>Desglose por Ciudad</h3>
          <table className="tabla-reporte">
            <thead>
              <tr>
                <th>Ciudad</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.detalle.por_ciudad).map(([ciudad, cantidad]) => (
                <tr key={ciudad}>
                  <td>{ciudad}</td>
                  <td>{cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReportePaquetesContenido;
