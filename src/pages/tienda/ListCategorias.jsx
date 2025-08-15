import { useEffect, useState, useRef } from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

const API = 'http://localhost:3002/api/categorias';

const ListCategorias = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);

    const [visibleForm, setVisibleForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        idestatus: 1
    });
    const [formErrors, setFormErrors] = useState({});

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const toast = useRef(null);

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

    const handleViewDetails = (categoria) => {
        setSelectedCategoria(categoria);
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
                    onClick={() => editCategoria(rowData)}
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

    // Manejo cambios formulario
    const onInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validar formulario para categorías (sin descripción)
    const validate = () => {
        const errors = {};

        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        } else if (/^\d+$/.test(formData.nombre.trim())) {
            errors.nombre = 'El nombre no puede contener solo números.';
        } else if (formData.nombre.trim().length > 50) { // varchar(50)
            errors.nombre = 'El nombre no puede tener más de 50 caracteres.';
        }

        if (![1, 2].includes(Number(formData.idestatus))) {
            errors.idestatus = 'Estado inválido.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const saveCategoria = async () => {
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
                    idestatus: Number(formData.idestatus)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `No se pudo ${isEditing ? 'editar' : 'crear'} la categoría`);
            }

            setVisibleForm(false);
            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Categoría ${isEditing ? 'editada' : 'creada'} correctamente`,
                life: 3000
            });

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
            idestatus: 1
        });
        setFormErrors({});
        setIsEditing(false);
        setVisibleForm(true);
    };

    const editCategoria = (categoria) => {
        setFormData({
            nombre: categoria.nombre,
            idestatus: categoria.idestatus
        });
        setEditingId(categoria.idcategoria);
        setIsEditing(true);
        setFormErrors({});
        setVisibleForm(true);
    };

    const deleteCategoria = async (categoria) => {
        try {
            const response = await fetch(`${API}/${categoria.idcategoria}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar la categoría');
            }

            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Categoría eliminada correctamente',
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

    const confirmDelete = (categoria) => {
        confirmDialog({
            message: `¿Estás seguro de que deseas eliminar la categoría "${categoria.nombre}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => deleteCategoria(categoria),
            reject: () => {}
        });
    };

    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';

        return (
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    label="Nueva Categoría"
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={openNew}
                />
                <span className="p-input-icon-left mx-2">
                    <i className="pi pi-search mx-1" />
                    <InputText
                        value={value || ''}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar..."
                        className="w-100 px-4"
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
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p>Cargando Categorías...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar las Categorías</h4>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-center py-4">Lista de Categorías</h4>
            <div className="card">
                <DataTable
                    ref={dt}
                    value={datos}
                    paginator rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    dataKey="idcategoria"
                    emptyMessage="No se encontraron categorías."
                    filters={filters}
                    globalFilterFields={['nombre']}
                    header={header}
                >
                    <Column field="idcategoria" header="ID" sortable style={{ width: '10%' }} className="text-center" />
                    <Column field="nombre" header="Nombre" sortable style={{ width: '60%' }}/>
                    <Column field="idestatus" header="Estado" body={statusBodyTemplate} sortable style={{ width: '20%' }} className="text-center" />
                    <Column header="Acciones" body={actionBodyTemplate} style={{ width: '10%' }} className="text-center" />
                </DataTable>
            </div>

            <Dialog
                visible={visible}
                style={{ width: '450px' }}
                header="Detalles de la Categoría"
                modal
                footer={modalFooter}
                onHide={() => setVisible(false)}
            >
                {selectedCategoria && (
                    <div className="card p-4">
                        <div className="py-2"><h4><strong>ID: </strong>{selectedCategoria.idcategoria}</h4></div>
                        <div className="py-2"><h5><strong>Nombre: </strong>{selectedCategoria.nombre}</h5></div>
                        <div className="py-2">
                            <strong>Estado: </strong>
                            <Tag
                                value={selectedCategoria.idestatus === 1 ? 'Activo' : 'Inactivo'}
                                severity={selectedCategoria.idestatus === 1 ? 'success' : 'danger'}
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            <Dialog
                visible={visibleForm}
                style={{ width: '400px' }}
                header={isEditing ? "Editar Categoría" : "Agregar Categoría"}
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
                            onClick={saveCategoria}
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
                    {formErrors.nombre && <small className="p-error">{formErrors.nombre}</small>}
                </div>

                <div className="field">
                    <label>Estado</label>
                    <div className="form-check">
                        <input
                            type="radio"
                            id="activo"
                            name="idestatus"
                            value="1"
                            checked={formData.idestatus === 1}
                            onChange={() => setFormData(prev => ({ ...prev, idestatus: 1 }))}
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
                            onChange={() => setFormData(prev => ({ ...prev, idestatus: 2 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="inactivo" className="form-check-label mx-2">Inactivo</label>
                    </div>
                    {formErrors.idestatus && <small className="p-error">{formErrors.idestatus}</small>}
                </div>
            </Dialog>
        </div>
    )
}

export default ListCategorias;