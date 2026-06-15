'use client';
import React from 'react';
import StatusBadge from './StatusBadge';

const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="no-data">No hay datos disponibles</p>;
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Remitente</th>
            <th>Destinatario</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.codigo}</strong></td>
              <td>{row.remitente}</td>
              <td>{row.destinatario}</td>
              <td>
                <StatusBadge status={row.estado} />
              </td>
              <td>{row.fecha}</td>
              <td>
                <button className="btn-action btn-view">Ver</button>
                <button className="btn-action btn-edit">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
