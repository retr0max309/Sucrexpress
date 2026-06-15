'use client';
import React, { useState, useEffect } from 'react';
import { reportesService } from '../../services/reportesService';
import ReportePaquetesContenido from './ReportePaquetesContenido';
import ReporteIncidenciasContenido from './ReporteIncidenciasContenido';
import '../../assets/styles/reportes.css';

const Reportes = () => {
  const [periodoPaquetes, setPeriodoPaquetes] = useState('mes');
  const [periodoIncidencias, setPeriodoIncidencias] = useState('mes');
  const [reportePaquetes, setReportePaquetes] = useState(null);
  const [reporteIncidencias, setReporteIncidencias] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    await Promise.all([
      fetchReportePaquetes('mes'),
      fetchReporteIncidencias('mes')
    ]);
  };

  const fetchReportePaquetes = async (periodo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportesService.getReportePaquetes(periodo);
      if (response.success) {
        setReportePaquetes(response.data);
      } else {
        setError(response.message || 'Error al cargar reporte de paquetes');
      }
    } catch (error) {
      console.error('Error al cargar reporte de paquetes:', error);
      setError('Error al cargar reporte de paquetes');
    } finally {
      setLoading(false);
    }
  };

  const fetchReporteIncidencias = async (periodo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportesService.getReporteIncidencias(periodo);
      if (response.success) {
        setReporteIncidencias(response.data);
      } else {
        setError(response.message || 'Error al cargar reporte de incidencias');
      }
    } catch (error) {
      console.error('Error al cargar reporte de incidencias:', error);
      setError('Error al cargar reporte de incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPeriodoPaquetes = async (periodo) => {
    setPeriodoPaquetes(periodo);
    await fetchReportePaquetes(periodo);
  };

  const handleCambiarPeriodoIncidencias = async (periodo) => {
    setPeriodoIncidencias(periodo);
    await fetchReporteIncidencias(periodo);
  };

  const generarPDF = async () => {
    if (!reportePaquetes || !reporteIncidencias) {
      setError('Debe cargar ambos reportes antes de generar el PDF');
      return;
    }

    setGenerandoPDF(true);
    setError(null);

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 30;

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SUCREEXPRESS 2.0', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('REPORTE DE GESTIÓN', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      const fechaHoy = new Date().toLocaleDateString('es-ES');
      doc.text(`Generado: ${fechaHoy}`, 20, yPosition);
      yPosition += 15;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE PAQUETES', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${reportePaquetes.periodo} (${reportePaquetes.fecha_inicio} - ${reportePaquetes.fecha_fin})`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`Total Paquetes: ${reportePaquetes.total_paquetes}`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`Entregados: ${reportePaquetes.entregados_exitosos} (${reportePaquetes.tasa_exito}%)`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`No Entregados: ${reportePaquetes.no_entregados}`, 20, yPosition);
      yPosition += 15;

      if (reportePaquetes.detalle?.por_dia && reportePaquetes.detalle.por_dia.length > 0) {
        if (yPosition > pageHeight - marginBottom - 50) {
          doc.addPage();
          yPosition = 20;
        }

        const columnasP = ['Fecha', 'Total', 'Exitosos', 'No Exitosos', '% Éxito'];
        const datosP = reportePaquetes.detalle.por_dia.map(d => [
          d.fecha,
          d.total.toString(),
          d.exitosos.toString(),
          d.no_exitosos.toString(),
          d.tasa_exito + '%'
        ]);

        doc.autoTable({
          head: [columnasP],
          body: datosP,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (reportePaquetes.detalle?.por_estado && Object.keys(reportePaquetes.detalle.por_estado).length > 0) {
        if (yPosition > pageHeight - marginBottom - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Desglose por Estado', 20, yPosition);
        yPosition += 8;

        const columnasEstado = ['Estado', 'Cantidad'];
        const datosEstado = Object.entries(reportePaquetes.detalle.por_estado).map(([estado, cantidad]) => [
          estado.replace(/_/g, ' '),
          cantidad.toString()
        ]);

        doc.autoTable({
          head: [columnasEstado],
          body: datosEstado,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [59, 130, 246] },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (yPosition > pageHeight - marginBottom - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE INCIDENCIAS', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${reporteIncidencias.periodo} (${reporteIncidencias.fecha_inicio} - ${reporteIncidencias.fecha_fin})`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`Total Incidencias: ${reporteIncidencias.total_incidencias}`, 20, yPosition);
      yPosition += lineHeight;
      doc.text(`Tiempo Promedio Respuesta: ${reporteIncidencias.tiempo_promedio_respuesta_horas.toFixed(1)} horas`, 20, yPosition);
      yPosition += 15;

      if (reporteIncidencias.por_estado && Object.keys(reporteIncidencias.por_estado).length > 0) {
        if (yPosition > pageHeight - marginBottom - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Desglose por Estado', 20, yPosition);
        yPosition += 8;

        const columnasI = ['Estado', 'Cantidad'];
        const datosI = Object.entries(reporteIncidencias.por_estado).map(([estado, cantidad]) => [
          estado.replace(/_/g, ' '),
          cantidad.toString()
        ]);

        doc.autoTable({
          head: [columnasI],
          body: datosI,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (reporteIncidencias.por_tipo && Object.keys(reporteIncidencias.por_tipo).length > 0) {
        if (yPosition > pageHeight - marginBottom - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Desglose por Tipo', 20, yPosition);
        yPosition += 8;

        const columnasTipo = ['Tipo', 'Cantidad'];
        const datosTipo = Object.entries(reporteIncidencias.por_tipo).map(([tipo, cantidad]) => [
          tipo.replace(/_/g, ' '),
          cantidad.toString()
        ]);

        doc.autoTable({
          head: [columnasTipo],
          body: datosTipo,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 20, right: 20 }
        });
      }

      const nombre = `Reporte_SucreExpress_${fechaHoy.replace(/\//g, '_')}.pdf`;
      doc.save(nombre);

    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar PDF. Asegúrate de que jsPDF esté cargado correctamente.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="reportes-container">
      <header className="header-reportes">
        <div>
          <h1>Reportes</h1>
          <p>Estadísticas de paquetes e incidencias</p>
        </div>
        <button
          className="btn-descargar-pdf"
          onClick={generarPDF}
          disabled={loading || generandoPDF || !reportePaquetes || !reporteIncidencias}
        >
          {generandoPDF ? 'Generando PDF...' : 'Descargar Reporte PDF'}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="reportes-grid">
        <section className="reporte-seccion">
          <h2>Paquetes</h2>
          <div className="periodo-selector">
            <button
              className={periodoPaquetes === 'hoy' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoPaquetes('hoy')}
              disabled={loading}
            >
              Hoy
            </button>
            <button
              className={periodoPaquetes === 'semana' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoPaquetes('semana')}
              disabled={loading}
            >
              Últimos 7 días
            </button>
            <button
              className={periodoPaquetes === 'mes' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoPaquetes('mes')}
              disabled={loading}
            >
              Mes actual
            </button>
          </div>
          {loading ? (
            <p className="loading-text">Cargando...</p>
          ) : (
            <ReportePaquetesContenido data={reportePaquetes} />
          )}
        </section>

        <section className="reporte-seccion">
          <h2>Incidencias</h2>
          <div className="periodo-selector">
            <button
              className={periodoIncidencias === 'hoy' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoIncidencias('hoy')}
              disabled={loading}
            >
              Hoy
            </button>
            <button
              className={periodoIncidencias === 'semana' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoIncidencias('semana')}
              disabled={loading}
            >
              Últimos 7 días
            </button>
            <button
              className={periodoIncidencias === 'mes' ? 'active' : ''}
              onClick={() => handleCambiarPeriodoIncidencias('mes')}
              disabled={loading}
            >
              Mes actual
            </button>
          </div>
          {loading ? (
            <p className="loading-text">Cargando...</p>
          ) : (
            <ReporteIncidenciasContenido data={reporteIncidencias} />
          )}
        </section>
      </div>
    </div>
  );
};

export default Reportes;
