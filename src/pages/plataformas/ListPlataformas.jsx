import { useEffect, useState, useRef } from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast'; // agregar para notificaciones

const API = 'http://localhost:3002/api/plataformas';
const ListPlataformas = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedPlataforma, setSelectedPlataforma] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);
    // agregar para el manejo del los datos del formulario
    const toast = useRef(null); // Para notificaciones
    const [visibleForm, setVisibleForm] = useState(false); // Para crear/editar
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        idestatus: 1
    });
    const [formErrors, setFormErrors] = useState({});

    // para editar
    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const getDatos = async () => {
        try {
            const response = await fetch(API);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setDatos(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        getDatos();
    }, []);

    const handleViewDetails = (genero) => {
        setSelectedPlataforma(genero);
        setVisible(true);
    };

    const actionBodyTemplate = (rowData) => {
        return (
             <div className="d-flex gap-2 justify-content-center">
                <Button 
                    icon="pi pi-eye" 
                    className="p-button-rounded p-button-info" 
                    onClick={() => handleViewDetails(rowData)}
                    tooltip="Ver detalles"
                />
                 <Button 
                    icon="pi pi-pencil" 
                    className="p-button-rounded p-button-warning" 
                    onClick={() => editPlataforma(rowData)}
                    tooltip="Editar"
                    aria-label="Editar"
                />
                 <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-danger" 
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Eliminar"
                    aria-label="Eliminar"
                />

            </div>
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <Tag 
                value={rowData.idestatus === 1 ? 'Activo' : 'Inactivo'} 
                severity={rowData.idestatus === 1 ? 'success' : 'danger'} 
            />
        );
    };

    const modalFooter = (
        <Button 
            label="Cerrar" 
            icon="pi pi-times" 
            onClick={() => setVisible(false)} 
            className="p-button-text" 
        />
    );

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
    };

     //******************* funciones para permitir modificar el Playaforma **************
        // Función para abrir el modal de creación
           //Manejar cambios en el formulario
    const onInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error si existe
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };
        //Validar formulario
    const validate = () => {
        const errors = {};
        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        }
        if (![1, 2].includes(Number(formData.idestatus))) {
            errors.idestatus = 'Estado inválido.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const savePlataforma = async () => {
        if (!validate()) return;

        const method = isEditing ? 'PUT' : 'POST';
          const url = isEditing ? `${API}/${editingId}` : API; 

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    descripcion: formData.descripcion.trim() || null,
                    idestatus: Number(formData.idestatus)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `No se pudo ${isEditing ? 'editar' : 'crear'} el género`);
            }

            setVisibleForm(false);
            getDatos(); // Refrescar lista
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Registro ${isEditing ? 'editado' : 'creado'} correctamente`,
                life: 3000
            });

            // Resetear estado de edición
            if (isEditing) setIsEditing(false);
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
                life: 5000
            });
        }
    };
    const openNew = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            idestatus: 1
        });
        setFormErrors({});
        setVisibleForm(true);
    };
     const editPlataforma = (item) => {
        setFormData({
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            idestatus: item.idestatus
        });
        setEditingId(item.idplataforma); // ← Guardamos el ID aquí
        setIsEditing(true);
        setFormErrors({});
        setVisibleForm(true);
    };
    const deletePlataforma = async (item) => {
        try {
            const response = await fetch(`${API}/${item.idplataforma}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar el Dato');
            }

            // Cerrar diálogo y refrescar
            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Registro eliminado correctamente',
                life: 3000
            });
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
                life: 5000
            });
        }
    };

    const confirmDelete = (item) => {
      

        confirmDialog({
            message: `¿Estás seguro de que deseas eliminar el Registro "${item.nombre}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => deletePlataforma(item),
            reject: () => {
                // No hacer nada
            }
        });
    };





    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';

        return (
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    label="Nueva Plataforma"
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={openNew}
                />
                <span className="p-input-icon-left mx-2">
                    <i className="pi pi-search mx-1" />
                    <InputText 
                        value={value || ''} 
                        onChange={onGlobalFilterChange} 
                        placeholder="Buscar... " 
                        className="w-100 px-4 "
                    />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Cargando PLataformas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los Plataformas</h4>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <Toast ref={toast} />
            <ConfirmDialog /> 
            <h4 className="text-center py-4">Lista de Plataformas</h4>
            <div className="card">
                <DataTable 
                    ref={dt}
                    value={datos} 
                    paginator rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    dataKey="idplataforma"
                    emptyMessage="No se encontraron plataformas."
                    filters={filters}
                    globalFilterFields={['nombre', 'descripcion']}
                    header={header}
                >
                    <Column field="idplataforma" header="ID" sortable style={{ width: '10%' }} className="text-center"></Column>
                    <Column field="nombre" header="Nombre" sortable style={{ width: '30%' }}></Column>
                    <Column field="descripcion" header="Descripción" style={{ width: '45%' }}></Column>
                    <Column field="idestatus" header="Estado" body={statusBodyTemplate} sortable style={{ width: '10%' }} className="text-center"></Column>
                    <Column header="Acciones" body={actionBodyTemplate} style={{ width: '5%' }} className="text-center"></Column>
                </DataTable>
            </div>

            <Dialog 
                visible={visible} 
                style={{ width: '500px' }} 
                header="Detalles del la Plataforma" 
                modal 
                footer={modalFooter} 
                onHide={() => setVisible(false)}
            >
                {selectedPlataforma && (
                    <div className="card p-4">
                        <div className="card-header">
                            <div className="py-2">
                                <h4><strong>ID: </strong>{selectedPlataforma.idgenero}</h4>
                            </div>
                            <div className="py-2">
                                <h5><strong>Nombre: </strong>{selectedPlataforma.nombre}</h5>
                            </div>
                            <div className="py-2">
                                <h5><strong>Descripción: </strong>{selectedPlataforma.descripcion}</h5>
                            </div>
                            <div className="py-2">
                                <div>
                                    <strong>Estado: </strong>
                                    <Tag 
                                        value={selectedPlataforma.idestatus === 1 ? 'Activo' : 'Inactivo'} 
                                        severity={selectedPlataforma.idestatus === 1 ? 'success' : 'danger'} 
                                    />
                                </div>
                            </div>
                        
                        </div>
                    </div>
                )}
            </Dialog>
                        <Dialog
                visible={visibleForm}
                style={{ width: '450px' }}
                header={isEditing ? "Editar Género" : "Agregar Género"}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            onClick={() => setVisibleForm(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            onClick={savePlataforma}
                        />
                    </div>
                }
                onHide={() => setVisibleForm(false)}
            >
                <div className="field">
                    <label htmlFor="nombre">Nombre *</label>
                    <InputText
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => onInputChange(e, 'nombre')}
                        autoFocus
                        className={formErrors.nombre ? 'p-invalid' : ''}
                    />
                    {formErrors.nombre && (
                        <small className="p-error">{formErrors.nombre}</small>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="descripcion">Descripción</label>
                    <InputText
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => onInputChange(e, 'descripcion')}
                    />
                </div>

                <div className="field">
                    <label htmlFor="idestatus">Estado</label>
                    <div className="form-check">
                        <input
                            type="radio"
                            id="activo"
                            name="idestatus"
                            value="1"
                            checked={formData.idestatus === 1}
                            onChange={(e) => setFormData(prev => ({ ...prev, idestatus: 1 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="activo" className="form-check-label mx-2">Activo</label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            id="inactivo"
                            name="idestatus"
                            value="2"
                            checked={formData.idestatus === 2}
                            onChange={(e) => setFormData(prev => ({ ...prev, idestatus: 2 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="inactivo" className="form-check-label mx-2">Inactivo</label>
                    </div>
                    {formErrors.idestatus && (
                        <small className="p-error">{formErrors.idestatus}</small>
                    )}
                </div>
            </Dialog>
        </div>
    )
}

export default ListPlataformas;