'use client';
export default function ConfirmDeleteIncidenciaModal({ isOpen, incidencia, onClose, onConfirm, loading }) {
  if (!isOpen || !incidencia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-confirm-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cancelar Incidencia</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">
            ¿Estás seguro de que deseas cancelar esta incidencia?
          </p>

          <div className="incidencia-info">
            <div className="info-item">
              <span className="label">Número Guía:</span>
              <span className="value">{incidencia.numero_guia}</span>
            </div>
            <div className="info-item">
              <span className="label">Tipo:</span>
              <span className="value">{incidencia.tipo_incidencia}</span>
            </div>
          </div>

          <p className="warning-message">
            ⚠️ Esta acción NO se puede deshacer.
          </p>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            No, volver atrás
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
