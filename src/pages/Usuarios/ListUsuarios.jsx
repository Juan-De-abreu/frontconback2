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
import { Dropdown } from 'primereact/dropdown';

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
    const toast = useRef(null);

    // Estado para el formulario (crear/editar)
    const [visibleForm, setVisibleForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'Operador',
        activo: 1
    });
    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Opciones para rol
    const roles = [
        { label: 'Operador', value: 'operador' },
        { label: 'Admin', value: 'admin' },
        { label: 'Vendedor', value: 'vendedor' }
    ];

    // Obtener datos
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

    // Ver detalles
    const handleViewDetails = (usuario) => {
        setSelectedUsuario(usuario);
        setVisible(true);
    };

    // Plantilla de acciones
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
                    onClick={() => editUsuario(rowData)}
                    tooltip="Editar"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Eliminar"
                />
            </div>
        );
    };

    // Estado activo/inactivo
    const activoBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.activo ? 'Activo' : 'Inactivo'}
                severity={rowData.activo ? 'success' : 'danger'}
            />
        );
    };

    // Rol con color
const rolBodyTemplate = (rowData) => {
    let label, severity;
    
    switch (rowData.rol) {
        case 'admin':
            label = 'Admin';
            severity = 'warning';
            break;
        case 'operador':
            label = 'Operador';
            severity = 'info';
            break;
        case 'vendedor':
            label = 'Vendedor';
            severity = 'success';
            break;
        default:
            label = 'Desconocido';
            severity = 'secondary';
    }

    return <Tag value={label} severity={severity} />;
};

    // Footer del modal de detalles
    const modalFooter = (
        <Button
            label="Cerrar"
            icon="pi pi-times"
            onClick={() => setVisible(false)}
            className="p-button-text"
        />
    );

    // Filtro global
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
    };

    // Manejar cambios en el formulario
    const onInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error si existe
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validar formulario
    const validate = () => {
        const errors = {};

        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Debe ser un correo válido.';
        }

        if (!isEditing && (!formData.password || formData.password.length < 6)) {
            errors.password = 'La contraseña es obligatoria y debe tener al menos 6 caracteres.';
        }

        if (!['operador', 'admin', 'vendedor'].includes(formData.rol)) {
            errors.rol = 'Rol inválido.';
        }

        if (![0, 1].includes(Number(formData.activo))) {
            errors.activo = 'Estado inválido.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Guardar (crear o editar)
    const saveUsuario = async () => {
        if (!validate()) return;

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API}/${editingId}` : API;

        try {
            const body = {
                nombre: formData.nombre.trim(),
                email: formData.email.trim().toLowerCase(),
                rol: formData.rol,
                activo: Number(formData.activo)
            };

            // Solo incluir password al crear
            if (!isEditing) {
                body.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

        console.log(JSON.stringify(body));

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `No se pudo ${isEditing ? 'editar' : 'crear'} el usuario`);
            }

            setVisibleForm(false);
            getDatos();
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Usuario ${isEditing ? 'actualizado' : 'creado'} correctamente`,
                life: 3000
            });

            // Resetear estado
            if (isEditing) {
                setIsEditing(false);
                setEditingId(null);
            }
        } catch (err) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: err.message,
                life: 5000
            });
        }
    };

    // Abrir modal para nuevo usuario
    const openNew = () => {
        setFormData({
            nombre: '',
            email: '',
            password: '',
            rol: 'Operador',
            activo: 1
        });
        setFormErrors({});
        setIsEditing(false);
        setVisibleForm(true);
    };

    // Editar usuario
    const editUsuario = (usuario) => {
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '', // No se envía la contraseña actual
            rol: usuario.rol,
            activo: usuario.activo ? 1 : 0
        });
        setEditingId(usuario.idusuario);
        setIsEditing(true);
        setFormErrors({});
        setVisibleForm(true);
    };

    // Eliminar usuario
    const deleteUsuario = async (usuario) => {
        try {
            const response = await fetch(`${API}/${usuario.idusuario}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
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
            message: `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre}" (${usuario.email})?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'No, cancelar',
            acceptClassName: 'p-button-danger',
            accept: () => deleteUsuario(usuario),
            reject: () => {}
        });
    };

    // Encabezado con botón y filtro
    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';

        return (
            <div className="d-flex justify-content-between align-items-center">
                <Button
                    label="Nuevo Usuario"
                    icon="pi pi-plus"
                    className="p-button-success"
                    onClick={openNew}
                />
                <span className="p-input-icon-left mx-2">
                    <i className="pi pi-search mx-1" />
                    <InputText
                        value={value || ''}
                        onChange={onGlobalFilterChange}
                        placeholder="Buscar por nombre o email..."
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

            <h4 className="text-center py-4">Gestión de Usuarios</h4>

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
                    <Column field="idusuario" header="ID" sortable style={{ width: '8%' }} className="text-center"></Column>
                    <Column field="nombre" header="Nombre" sortable style={{ width: '20%' }}></Column>
                    <Column field="email" header="Email" sortable style={{ width: '25%' }}></Column>
                    <Column field="rol" header="Rol" body={rolBodyTemplate} sortable style={{ width: '12%' }} className="text-center"></Column>
                    <Column field="activo" header="Estado" body={activoBodyTemplate} sortable style={{ width: '10%' }} className="text-center"></Column>
                    <Column field="fechacreacion" header="Fecha de Creación" sortable style={{ width: '15%' }}></Column>
                    <Column header="Acciones" body={actionBodyTemplate} style={{ width: '10%' }} className="text-center"></Column>
                </DataTable>
            </div>

            {/* Modal: Detalles del Usuario */}
            <Dialog
                visible={visible}
                style={{ width: '500px' }}
                header="Detalles del Usuario"
                modal
                footer={modalFooter}
                onHide={() => setVisible(false)}
            >
                {selectedUsuario && (
                    <div className="card p-4">
                        <div className="py-2"><strong>ID:</strong> {selectedUsuario.idusuario}</div>
                        <div className="py-2"><strong>Nombre:</strong> {selectedUsuario.nombre}</div>
                        <div className="py-2"><strong>Email:</strong> {selectedUsuario.email}</div>
                        <div className="py-2">
                            <strong>Rol:</strong>
                            <Tag value={rolBodyTemplate({ rol: selectedUsuario.rol }).props.value} 
                                severity={rolBodyTemplate({ rol: selectedUsuario.rol }).props.severity.className.split(' ')[0].replace('p-tag-', '')} 
                                className="ms-2" />
                        </div>
                        <div className="py-2">
                            <strong>Estado:</strong>
                            <Tag
                                value={selectedUsuario.activo ? 'Activo' : 'Inactivo'}
                                severity={selectedUsuario.activo ? 'success' : 'danger'}
                                className="ms-2"
                            />
                        </div>
                        <div className="py-2"><strong>Fecha de Creación:</strong> {new Date(selectedUsuario.fechacreacion).toLocaleString()}</div>
                    </div>
                )}
            </Dialog>

            {/* Modal: Crear/Editar Usuario */}
            <Dialog
                visible={visibleForm}
                style={{ width: '450px' }}
                header={isEditing ? "Editar Usuario" : "Agregar Usuario"}
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
                            onClick={saveUsuario}
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
                    <label htmlFor="email">Email *</label>
                    <InputText
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => onInputChange(e, 'email')}
                        className={formErrors.email ? 'p-invalid' : ''}
                    />
                    {formErrors.email && (
                        <small className="p-error">{formErrors.email}</small>
                    )}
                </div>

                {!isEditing && (
                    <div className="field">
                        <label htmlFor="password">Contraseña *</label>
                        <InputText
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => onInputChange(e, 'password')}
                            className={formErrors.password ? 'p-invalid' : ''}
                        />
                        {formErrors.password && (
                            <small className="p-error">{formErrors.password}</small>
                        )}
                        <small>La contraseña debe tener al menos 6 caracteres.</small>
                    </div>
                )}

                <div className="field">
                    <label htmlFor="rol">Rol</label>
                    <Dropdown
                        id="rol"
                        value={formData.rol}
                        options={roles}
                        onChange={(e) => setFormData(prev => ({ ...prev, rol: e.value }))}
                        placeholder="Selecciona un rol"
                        className={formErrors.rol ? 'p-invalid' : ''}
                    />
                    {formErrors.rol && (
                        <small className="p-error">{formErrors.rol}</small>
                    )}
                </div>

                <div className="field">
                    <label htmlFor="activo">Estado</label>
                    <div className="form-check">
                        <input
                            type="radio"
                            id="activo"
                            name="activo"
                            value="1"
                            checked={formData.activo === 1}
                            onChange={() => setFormData(prev => ({ ...prev, activo: 1 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="activo" className="form-check-label mx-2">Activo</label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            id="inactivo"
                            name="activo"
                            value="0"
                            checked={formData.activo === 0}
                            onChange={() => setFormData(prev => ({ ...prev, activo: 0 }))}
                            className="form-check-input"
                        />
                        <label htmlFor="inactivo" className="form-check-label mx-2">Inactivo</label>
                    </div>
                    {formErrors.activo && (
                        <small className="p-error">{formErrors.activo}</small>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default ListUsuarios;