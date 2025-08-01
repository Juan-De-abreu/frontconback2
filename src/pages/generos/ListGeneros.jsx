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
import { Toast } from 'primereact/toast';

const API = 'http://localhost:3002/api/generos';
const ListGeneros = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedGenero, setSelectedGenero] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);

    // agregar para el manejo del los datos del formulario
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

    const toast = useRef(null); // Para notificaciones
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
        setSelectedGenero(genero);
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
                    onClick={() => editGenero(rowData)}
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
    //************************************ funciones para crear un nuevo genero *****************************************/
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
        const numericRegex = /^\d+$/;
        const startsWithNumberRegex = /^\d/;
    
        // Validar que el nombre no esté vacío, no empiece con un número y no sea solo números
        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        } else if (startsWithNumberRegex.test(formData.nombre.trim())) {
            errors.nombre = 'El nombre no puede empezar con un número.';
        } else if (numericRegex.test(formData.nombre.trim())) {
            errors.nombre = 'El nombre no puede ser solo números.';
        }
    
        // Validar que la descripción, si existe, no empiece con un número y no sea solo números
        if (!formData.descripcion || formData.descripcion.trim() === '') {
             errors.descripcion = 'La descripción es obligatoria.';
        } else if (startsWithNumberRegex.test(formData.descripcion.trim())) {
            errors.descripcion = 'La descripción no puede empezar con un número.';
        } else if (numericRegex.test(formData.descripcion.trim())) {
            errors.descripcion = 'La descripción no puede ser solo números.';
        }
    
        // Validar el estado, igual que antes
        if (![1, 2].includes(Number(formData.idestatus))) {
            errors.idestatus = 'Estado inválido.';
        }
    
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    //funcion para crear y modificar el genero 
    const saveGenero = async () => {
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
                    descripcion: formData.descripcion.trim(), // Elimina la validación de nulo para enviarla obligatoriamente
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
                detail: `Género ${isEditing ? 'editado' : 'creado'} correctamente`,
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
    // Función para abrir el modal de creación
    const openNew = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            idestatus: 1
        });
        setFormErrors({});
        setVisibleForm(true);
    };


    //******************* funciones para permitir modificar el genero **************
    const editGenero = (genero) => {
        setFormData({
            nombre: genero.nombre,
            descripcion: genero.descripcion || '',
            idestatus: genero.idestatus
        });
        setEditingId(genero.idgenero); // ← Guardamos el ID aquí
        setIsEditing(true);
        setFormErrors({});
        setVisibleForm(true);
    };

    const deleteGenero = async (genero) => {
        try {
            const response = await fetch(`${API}/${genero.idgenero}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar el género');
            }

            // Cerrar diálogo y refrescar
            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Género eliminado correctamente',
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
    const confirmDelete = (genero) => {
        

        confirmDialog({
            message: `¿Estás seguro de que deseas eliminar el género "${genero.nombre}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => deleteGenero(genero),
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
                    label="Nuevo Género"
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
                <p>Cargando Géneros...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los Géneros</h4>
                <p>{error}</p>
            </div>
        );
    }

    

    return (
        <div className="container">
            <Toast ref={toast} />
            <ConfirmDialog /> 
            <h4 className="text-center py-4">Lista de Géneros</h4>
            <div className="card">
                <DataTable 
                    ref={dt}
                    value={datos} 
                    paginator rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    dataKey="idgenero"
                    emptyMessage="No se encontraron géneros."
                    filters={filters}
                    globalFilterFields={['nombre', 'descripcion']}
                    header={header}
                >
                    <Column field="idgenero" header="ID" sortable style={{ width: '10%' }} className="text-center"></Column>
                    <Column field="nombre" header="Nombre" sortable style={{ width: '30%' }}></Column>
                    <Column field="descripcion" header="Descripción" style={{ width: '45%' }}></Column>
                    <Column field="idestatus" header="Estado" body={statusBodyTemplate} sortable style={{ width: '10%' }} className="text-center"></Column>
                    <Column header="Acciones" body={actionBodyTemplate} style={{ width: '5%' }} className="text-center"></Column>
                </DataTable>
            </div>

            <Dialog 
                visible={visible} 
                style={{ width: '500px' }} 
                header="Detalles del Género" 
                modal 
                footer={modalFooter} 
                onHide={() => setVisible(false)}
            >
                {selectedGenero && (
                    <div className="card p-4">
                        <div className="card-header">
                            <div className="py-2">
                                <h4><strong>ID: </strong>{selectedGenero.idgenero}</h4>
                            </div>
                            <div className="py-2">
                                <h5><strong>Nombre: </strong>{selectedGenero.nombre}</h5>
                            </div>
                            <div className="py-2">
                                <h5><strong>Descripción: </strong>{selectedGenero.descripcion}</h5>
                            </div>
                            <div className="py-2">
                                <div>
                                    <strong>Estado: </strong>
                                    <Tag 
                                        value={selectedGenero.idestatus === 1 ? 'Activo' : 'Inactivo'} 
                                        severity={selectedGenero.idestatus === 1 ? 'success' : 'danger'} 
                                    />
                                </div>
                            </div>
                        
                        </div>
                    </div>
                )}
            </Dialog>
            {/* Modal para Crear/Editar */}
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
                            onClick={saveGenero}
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
                    <label htmlFor="descripcion">Descripción *</label> {/* Cambiar aquí */}
                    <InputText
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => onInputChange(e, 'descripcion')}
                        className={formErrors.descripcion ? 'p-invalid' : ''} // Agregar clase de error
                    />
                    {formErrors.descripcion && (
                        <small className="p-error">{formErrors.descripcion}</small>
                    )}
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

export default ListGeneros;