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

const API = 'http://localhost:3002/api/usuarios';

const ListUsuarios = () => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);

    // Estados para formulario
    const [visibleForm, setVisibleForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rol: 'cliente',
        activo: 1,
    });
    const [formErrors, setFormErrors] = useState({});

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef(null);

    // Obtener datos de usuarios
    const getDatos = async () => {
        try {
            const response = await fetch(API);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setDatos(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDatos();
    }, []);

    // Ver detalles
    const handleViewDetails = (usuario) => {
        setSelectedUsuario(usuario);
        setVisible(true);
    };

    // Acción: editar
    const editUsuario = (usuario) => {
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
        });
        setEditingId(usuario.idusuario);
        setIsEditing(true);
        setFormErrors({});
        setVisibleForm(true);
    };

    // Acción: eliminar usuario
    const deleteUsuario = async (usuario) => {
        try {
            const response = await fetch(`${API}/${usuario.idusuario}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'}
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar el usuario');
            }
            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Usuario eliminado correctamente',
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

    // Confirmar eliminación
    const confirmDelete = (usuario) => {
        confirmDialog({
            message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => deleteUsuario(usuario),
            reject: () => { /* no hace nada */ }
        });
    };

    // Validar formulario (nombre, email, rol, activo)
    const validate = () => {
        const errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        }
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'El email es obligatorio y debe ser válido.';
        }
        if (!['cliente', 'admin'].includes(formData.rol)) {
            errors.rol = 'El rol debe ser "cliente" o "admin".';
        }
        if (![0, 1].includes(Number(formData.activo))) {
            errors.activo = 'El estado debe ser 0 (Inactivo) o 1 (Activo).';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejar cambios en formulario
    const onInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Guardar usuario (crear o actualizar)
    const saveUsuario = async () => {
        if (!validate()) return;

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API}/${editingId}` : API;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre.trim(),
                    email: formData.email.trim(),
                    rol: formData.rol,
                    activo: Number(formData.activo),
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `No se pudo ${isEditing ? 'editar' : 'crear'} el usuario`);
            }

            setVisibleForm(false);
            getDatos();

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Usuario ${isEditing ? 'editado' : 'creado'} correctamente`,
                life: 3000
            });

            if (isEditing) {
                setIsEditing(false);
                setEditingId(null);
            }
            setFormData({
                nombre: '',
                email: '',
                rol: 'cliente',
                activo: 1,
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

    // Abrir modal nuevo usuario
    const openNew = () => {
        setFormData({
            nombre: '',
            email: '',
            rol: 'cliente',
            activo: 1,
        });
        setFormErrors({});
        setIsEditing(false);
        setEditingId(null);
        setVisibleForm(true);
    };

    const actionBodyTemplate = (rowData) => (
        <div className="d-flex gap-2 justify-content-center">
            <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-info"
                onClick={() => handleViewDetails(rowData)}
                tooltip="Ver detalles"
                aria-label="Ver detalles"
            />
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning"
                onClick={() => editUsuario(rowData)}
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

    const statusBodyTemplate = (rowData) => (
        <Tag
            value={rowData.activo === 1 ? 'Activo' : 'Inactivo'}
            severity={rowData.activo === 1 ? 'success' : 'danger'}
        />
    );

    const renderHeader = () => {
        const value = filters.global ? filters.global.value : '';

        return (
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    label="Nuevo Usuario"
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={openNew}
                />
                <span className="p-input-icon-left mx-2" style={{ flex: 1 }}>
                    <InputText
                        value={value || ''}
                        onChange={(e) => {
                            let _filters = { ...filters };
                            _filters.global.value = e.target.value;
                            setFilters(_filters);
                        }}
                        placeholder="Buscar..."
                        className="w-25 float-end px-4"
                    />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const modalFooter = (
        <Button
            label="Cerrar"
            icon="pi pi-times"
            onClick={() => setVisible(false)}
            className="p-button-text"
        />
    );

    const modalFormFooter = (
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
                onClick={saveUsuario}
            />
        </div>
    );

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p>Cargando Usuarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los Usuarios</h4>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="text-center py-4">Lista de Usuarios</h4>

            <div className="card">
                <DataTable
                    ref={dt}
                    value={datos}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    dataKey="idusuario"
                    emptyMessage="No se encontraron usuarios."
                    filters={filters}
                    globalFilterFields={['nombre', 'email', 'rol']}
                    header={header}
                >
                    <Column field="idusuario" header="ID" sortable style={{ width: '10%' }} className="text-center" />
                    <Column field="nombre" header="Nombre" sortable style={{ width: '30%' }}/>
                    <Column field="email" header="Email" sortable style={{ width: '30%' }}/>
                    <Column field="rol" header="Rol" sortable style={{ width: '15%' }}/>
                    <Column field="activo" header="Estado" body={statusBodyTemplate} sortable style={{ width: '10%' }} className="text-center" />
                    <Column header="Acciones" body={actionBodyTemplate} style={{ width: '15%' }} className="text-center" />
                </DataTable>
            </div>

            {/* Diálogo detalles usuario */}
            <Dialog 
                visible={visible} 
                style={{ width: '450px' }} 
                header="Detalles del Usuario" 
                modal 
                footer={modalFooter} 
                onHide={() => setVisible(false)}
            >
                {selectedUsuario && (
                    <div className="card p-4">
                        <p><strong>ID:</strong> {selectedUsuario.idusuario}</p>
                        <p><strong>Nombre:</strong> {selectedUsuario.nombre}</p>
                        <p><strong>Email:</strong> {selectedUsuario.email}</p>
                        <p><strong>Rol:</strong> {selectedUsuario.rol.charAt(0).toUpperCase() + selectedUsuario.rol.slice(1)}</p>
                        <p><strong>Estado:</strong> {selectedUsuario.activo === 1 ? 'Activo' : 'Inactivo'}</p>
                        <p><strong>Fecha creación:</strong> {new Date(selectedUsuario.fechacreacion).toLocaleString()}</p>
                    </div>
                )}
            </Dialog>

            {/* Modal formulario crear/editar usuario */}
            <Dialog
                visible={visibleForm}
                style={{ width: '450px' }}
                header={isEditing ? "Editar Usuario" : "Agregar Usuario"}
                modal
                className="p-fluid"
                footer={modalFormFooter}
                onHide={() => setVisibleForm(false)}
            >
                <div className="field">
                    <label htmlFor="nombre">Nombre *</label>
                    <InputText
                        id="nombre"
                        value={formData.nombre}
                        onChange={e => onInputChange(e, 'nombre')}
                        autoFocus
                        className={formErrors.nombre ? 'p-invalid' : ''}
                    />
                    {formErrors.nombre && <small className="p-error">{formErrors.nombre}</small>}
                </div>

                <div className="field">
                    <label htmlFor="email">Email *</label>
                    <InputText
                        id="email"
                        value={formData.email}
                        onChange={e => onInputChange(e, 'email')}
                        className={formErrors.email ? 'p-invalid' : ''}
                    />
                    {formErrors.email && <small className="p-error">{formErrors.email}</small>}
                </div>

                <div className="field">
                    <label htmlFor="rol">Rol *</label>
                    <select
                        id="rol"
                        value={formData.rol}
                        onChange={e => onInputChange(e, 'rol')}
                        className={`form-select ${formErrors.rol ? 'is-invalid' : ''}`}
                    >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                    </select>
                    {formErrors.rol && <small className="p-error">{formErrors.rol}</small>}
                </div>

                <div className="field">
                    <label>Estado *</label>
                    <div className="form-check form-check-inline">
                        <input
                            type="radio"
                            id="activo"
                            name="activo"
                            value="1"
                            checked={Number(formData.activo) === 1}
                            onChange={() => setFormData(prev => ({ ...prev, activo: 1 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="activo" className="form-check-label ms-1">Activo</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            type="radio"
                            id="inactivo"
                            name="activo"
                            value="0"
                            checked={Number(formData.activo) === 0}
                            onChange={() => setFormData(prev => ({ ...prev, activo: 0 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="inactivo" className="form-check-label ms-1">Inactivo</label>
                    </div>
                    {formErrors.activo && <small className="p-error">{formErrors.activo}</small>}
                </div>
            </Dialog>
        </div>
    );
};

export default ListUsuarios;
