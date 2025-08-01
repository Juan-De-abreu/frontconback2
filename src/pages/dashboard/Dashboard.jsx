import { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { format } from 'date-fns';
import { FaDollarSign, FaGamepad, FaUsers, FaClock } from 'react-icons/fa';
import { formatNumber } from '../../utils/utils';
const API = 'http://localhost:3002/api/dashboard/resumen';

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  const getDatos = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Error al cargar el resumen');
      const data = await response.json();
      setDatos(data.resumen);
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el dashboard',
        life: 5000
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getDatos();
  }, []);

  if (loading) {
    return (
      <div className="p-d-flex p-jc-center p-ai-center" style={{ height: '80vh' }}>
        <ProgressSpinner />
      </div>
    );
  }

  // Datos para gráficos
  const juegosChart = {
    labels: datos.juegosMasVendidos.map(j => j.nombre),
    datasets: [
      {
        label: 'Unidades Vendidas',
        backgroundColor: '#4CAF50',
        data: datos.juegosMasVendidos.map(j => parseInt(j.unidades_vendidas))
      }
    ]
  };

  const generosChart = {
    labels: datos.generosPopulares.map(g => g.genero),
    datasets: [
      {
        label: 'Ventas por Género',
        backgroundColor: '#2196F3',
        data: datos.generosPopulares.map(g => parseInt(g.total_vendido))
      }
    ]
  };

  return (
    <div className="p-fluid">
      <Toast ref={toast} />

      <h3 className="text-center my-5">Dashboard de Ventas</h3>

      {/* Info Boxes */}
      <div className="row">
        {/* Ventas Totales */}
        <div className="col-lg-6 col-xl-3">
          <div className="info-box bg-primary">
            <span className="info-box-icon">
              <FaDollarSign size={40} color="white" />
            </span>
            <div className="info-box-content">
              <span className="fs-2">Ventas Totales</span>
              <span className="fs-3">{formatNumber(parseFloat(datos.ventasTotales).toFixed(2))} <span className='fs-6'>Dolares</span></span>
            </div>
          </div>
        </div>

        {/* Juegos Vendidos */}
        <div className="col-lg-6 col-xl-3">
          <div className="info-box bg-success">
            <span className="info-box-icon">
              <FaGamepad size={40} color="white" />
            </span>
            <div className="info-box-content">
              <span className="fs-2">Juegos Vendidos</span>
              <span className="fs-3">{datos.juegosVendidos} <span className='fs-6'>Unidades</span></span>
            </div>
          </div>
        </div>

        {/* Nuevos Usuarios */}
        <div className="col-lg-6 col-xl-3">
          <div className="info-box bg-warning text-black">
            <span className="info-box-icon">
              <FaUsers size={40} color="black" />
            </span>
            <div className="info-box-content">
              <span className="fs-2">Nuevos Usuarios</span>
              <span className="fs-3">{datos.nuevosUsuarios} <span className='fs-6'>Nuevos usuarios</span></span>
            </div>
          </div>
        </div>

        {/* Juegos Pendientes (o Pedidos Pendientes) */}
        <div className="col-lg-6 col-xl-3">
          <div className="info-box bg-danger">
            <span className="info-box-icon">
              <FaClock size={40} color="white" />
            </span>
            <div className="info-box-content">
              <span className="fs-2">Pedidos Pendientes</span>
              <span className="fs-3">{datos.juegosPendientes}<span className='fs-6'>Unidades</span></span>
            </div>
          </div>
        </div>
      </div>







      <div className='my-4'>
        <div className="row">
          <div className="col-lg-6">
            <Card title="Juegos Más Vendidos">
              <Chart type="bar" data={juegosChart} options={{ responsive: true }} />
            </Card>
          </div>

          <div className="col-lg-6">
            <Card title="Géneros Más Populares">
              <Chart type="bar" data={generosChart} options={{ responsive: true }} />
            </Card>
          </div>
        </div>
      </div>

      <div className="py-4">
        <Card title="Pedidos Recientes">
          <DataTable value={datos.pedidosRecientes}  >
            <Column field="idpedido" header="ID" sortable className='text-center fs-5' />
            <Column field="nombre" header="Cliente" className='text-center fs-5' />
            <Column field="total" header="Total" body={(row) => `$${row.total}`} className='text-center fs-5' />
            <Column
              field="fecha"
              header="Fecha"
              body={(row) => format(new Date(row.fecha), 'dd/MM/yyyy')}
              sortable
              className='text-center fs-5'
            />
          </DataTable>
        </Card>
      </div>


    </div>
  );
};

export default Dashboard;