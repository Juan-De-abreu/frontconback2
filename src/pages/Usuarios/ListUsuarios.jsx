import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const API = "http://localhost:3002/api/usuarios";

const ListUsuarios = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getDatos = async () => {
        setLoading(true);
        setError(null);
        
        try {
           
            
            // Verificar localStorage
            const userDataString = localStorage.getItem('user');
          
            
            if (!userDataString) {
                throw new Error('No hay sesión activa. Por favor inicia sesión.');
            }

            let userData;
            try {
                userData = JSON.parse(userDataString);
               
            } catch (parseError) {
                throw new Error('Sesión inválida. Por favor inicia sesión nuevamente.');
            }

            const token = userData?.token;
          
            
            if (!token) {
                throw new Error('Token no encontrado. Por favor inicia sesión nuevamente.');
            }

            // Hacer la petición con el token
            const response = await fetch(API, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

  
            
            if (!response.ok) {
                const errorText = await response.text();
                
                
                if (response.status === 401) {
                    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
                }
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
           
            setDatos(data);
        } catch (error) {
            console.error('Error detallado:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDatos();
    }, []);

    if (loading) return <p className="p-4">Cargando usuarios...</p>;
    
    if (error) return (
        <div className="p-4">
            <div className="alert alert-warning">
                <h5>Error al cargar usuarios</h5>
                <p>{error.message}</p>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => window.location.href = '/login'}
                >
                    Ir al Login
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-4">
            <h4 className="text-center py-4 text-secondary">Listado de Usuarios ({datos.length})</h4>
            <DataTable 
                value={datos} 
                showGridlines
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                className="p-datatable-sm"
                emptyMessage="No se encontraron usuarios">
                <Column field="id" header="ID" />
                <Column field="idrol" header="Rol" />
                <Column field="nombre" header="Nombre" />
                <Column field="correo" header="Correo" />
                <Column field="idestatus" header="Estatus" />
            </DataTable>
        </div>
    );
}

export default ListUsuarios;