// 1. IMPORTACIONES
import { useEffect, useState, useRef } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { FilterMatchMode } from 'primereact/api';
import { formatearFecha } from "../../utils/utils";
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

// 2. CONSTANTES DE API
const API = 'http://localhost:3002/api/juegos';
const API_GENEROS = 'http://localhost:3002/api/generos';

// 3. COMPONENTE PRINCIPAL
const ListJuegos = () => {
    // 4. ESTADOS
    const [datos, setDatos] = useState([]);
    const [generos, setGeneros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingGeneros, setLoadingGeneros] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editId, setEditId] = useState(null); // ID del juego que se edita
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const [visibleForm, setVisibleForm] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        fechapublicacion: '',
        precio: '',
        valoracion: '',
        idgenero: '',
        idestatus: 1,
        imagen: '',           // nombre del archivo en BD
        imagenFile: null      // archivo seleccionado (no se guarda en BD)
    });
    const [formErrors, setFormErrors] = useState({});
    const toast = useRef(null);
    const dt = useRef(null);

    // 5. CARGA DE DATOS
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

    const getGeneros = async () => {
        try {
            const response = await fetch(API_GENEROS);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setGeneros(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingGeneros(false);
        }
    };

    useEffect(() => {
        getDatos();
        getGeneros();
    }, []);

    const openNew = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            fechapublicacion: '',
            precio: '',
            valoracion: '',
            idgenero: '',
            idestatus: 1,
            imagen: '',
            imagenFile: null
        });
        setEditId(null);
        setFormErrors({});
        setVisibleForm(true);
    };
    // 6. INTERFAZ DE TABLA
    const handleViewDetails = (juego) => {
        setSelectedItem(juego);
        setVisible(true);
    };
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex gap-2">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-info"
                    onClick={() => handleViewDetails(rowData)} tooltip="Ver detalles" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger"
                    onClick={() => deleteJuego(rowData)} tooltip="Eliminar" />
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning"
                    onClick={() => editJuego(rowData)} tooltip="Editar" />
            </div>
        );
    };
    const statusBodyTemplate = (rowData) => {
        return (
            <Tag value={rowData.idestatus === 1 ? 'Activo' : 'Inactivo'}
                severity={rowData.idestatus === 1 ? 'success' : 'danger'} />
        );
    };
    const imageBodyTemplate = (rowData) => {
        const src = rowData.imagen
            ? `http://localhost:3002/uploads/juegos/img/${rowData.imagen}`
            : 'http://localhost:3002/uploads/juegos/img/noexiste.png';
        return (
            <img src={src} alt="Juego" width="50"
                style={{ borderRadius: '6px', border: '1px solid #ddd' }}
                onError={(e) => { e.target.src = 'http://localhost:3002/uploads/juegos/img/noexiste.png'; }} />
        );
    };

    // 7. CABECERA Y FILTRO
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
    };
    const renderHeader = () => {
        const value = filters['global'] ? filters['global'].value : '';
        return (
            <div className="d-flex justify-content-between align-items-center">
                <Button label="Nuevo Juego" icon="pi pi-plus"
                    className="p-button-success" onClick={openNew} />
                <span className="p-input-icon-left mx-2">
                    <i className="pi pi-search" />
                    <InputText value={value || ''} onChange={onGlobalFilterChange}
                        placeholder="Buscar..." className="w-100 px-4" />
                </span>
            </div>
        );
    };
    const header = renderHeader();

    // 8. GESTIÓN DEL FORMULARIO
    
    const onInputChange = (e, field) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // 9. VALIDACIÓN DE FORMULARIO
    const validate = () => {
        const errors = {};

        if (!formData.nombre || formData.nombre.trim() === '') {
            errors.nombre = 'El nombre es obligatorio.';
        }

        if (!formData.precio && formData.precio !== 0) {
            errors.precio = 'El precio es obligatorio.';
        } else {
            const precio = Number(formData.precio);
            if (isNaN(precio)) errors.precio = 'Debe ser un número.';
            else if (precio < 0) errors.precio = 'No puede ser negativo.';
            else if (precio > 500) errors.precio = 'No puede ser mayor a 500.';
        }

        if (!formData.valoracion && formData.valoracion !== 0) {
            errors.valoracion = 'La valoración es obligatoria.';
        } else {
            const valoracion = Number(formData.valoracion);
            if (isNaN(valoracion)) errors.valoracion = 'Debe ser un número.';
            else if (valoracion < 1 || valoracion > 10) errors.valoracion = 'Entre 1 y 10.';
        }

        if (!formData.fechapublicacion || formData.fechapublicacion.trim() === '') {
            errors.fechapublicacion = 'La fecha es obligatoria.';
        }

        if (!formData.idgenero && formData.idgenero !== 0) {
            errors.idgenero = 'Debe seleccionar un género.';
        } else if (isNaN(Number(formData.idgenero)) || Number(formData.idgenero) <= 0) {
            errors.idgenero = 'Debe ser un género válido.';
        }

        if (![1, 2].includes(Number(formData.idestatus))) {
            errors.idestatus = 'Debe seleccionar un estado válido.';
        }

        // Imagen: obligatoria solo al crear
        if (!editId && !formData.imagenFile) {
            errors.imagen = 'Debe seleccionar una imagen.';
        } else if (editId && !formData.imagenFile && !formData.imagen) {
            errors.imagen = 'El juego no tiene imagen.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 10. CRUD: GUARDAR JUEGO
    const saveJuego = async () => {
        if (!validate()) return;

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('nombre', formData.nombre.trim());
            if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
            if (formData.fechapublicacion) formDataToSend.append('fechapublicacion', formData.fechapublicacion);
            if (formData.precio) formDataToSend.append('precio', formData.precio);
            if (formData.valoracion) formDataToSend.append('valoracion', formData.valoracion);
            formDataToSend.append('idgenero', formData.idgenero);
            formDataToSend.append('idestatus', formData.idestatus);
            if (formData.imagenFile) {
                formDataToSend.append('imagen', formData.imagenFile);
            }

            const isEdit = editId !== null;
            const url = isEdit ? `${API}/${editId}` : API;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, { method, body: formDataToSend });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || `No se pudo ${isEdit ? 'actualizar' : 'crear'}`);

            setVisibleForm(false);
            getDatos();
            setEditId(null);
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Juego ${isEdit ? 'actualizado' : 'creado'} correctamente`,
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

    // 11. EDITAR JUEGO
    const editJuego = (juego) => {
        setFormData({
            nombre: juego.njuego,
            descripcion: juego.djuego || '',
            fechapublicacion: juego.fechapublicacion ? juego.fechapublicacion.split('T')[0] : '',
            precio: juego.precio !== null ? juego.precio : '',
            valoracion: juego.valoracion !== null ? juego.valoracion : '',
            idgenero: juego.idgenero,
            idestatus: Number(juego.idestatus),
            imagen: juego.imagen || '',
            imagenFile: null
        });
        setEditId(juego.idjuego);
        setFormErrors({});
        setVisibleForm(true);
    };

    // 12. ELIMINAR JUEGO
    const deleteJuego = (juego) => {
        confirmDialog({
            message: `¿Eliminar el juego "${juego.njuego}"? Esta acción no se puede deshacer.`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                try {
                    const response = await fetch(`${API}/${juego.idjuego}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('No se pudo eliminar');
                    getDatos();
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Eliminado correctamente', life: 3000 });
                } catch (err) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 5000 });
                }
            },
            reject: () => {
                toast.current.show({ severity: 'info', summary: 'Cancelado', detail: 'No se eliminó', life: 3000 });
            }
        });
    };


    // 13. DIÁLOGOS
    const modalFooter = (
        <Button label="Cerrar" icon="pi pi-times"
            onClick={() => setVisible(false)} className="p-button-text" />
    );

    // 14. RENDER FINAL
    if (loading || loadingGeneros) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error</h4>
                <p>{error}</p>
            </div>
        );
    }

return (
    <div className="container">
        <Toast ref={toast} />
        <ConfirmDialog />

        <h4 className="text-center py-4">Lista de Juegos</h4>
        <div className="card">
            <DataTable
                ref={dt}
                value={datos}
                paginator rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                dataKey="idjuego"
                emptyMessage="No se encontraron juegos."
                filters={filters}
                globalFilterFields={['njuego', 'ngenero']}
                header={header}
            >
                <Column field="idjuego" header="ID" sortable className="text-center" />
                <Column header="Imagen" body={imageBodyTemplate} style={{ width: '8%' }} className="text-center" />
                <Column field="ngenero" header="Género" sortable className="text-center" />
                <Column field="njuego" header="Nombre" sortable />
                <Column field="precio" header="Precio" sortable className="text-center" />
                <Column field="valoracion" header="Valoración" sortable className="text-center" />
                <Column field="idestatus" header="Estado" body={statusBodyTemplate} sortable className="text-center" />
                <Column header="Acciones" body={actionBodyTemplate} className="text-center" />
            </DataTable>
        </div>

        {/* Diálogo de detalles */}
        <Dialog visible={visible} style={{ width: '900px' }}
            breakpoints={{ '1199px': '90%', '767px': '95%' }}
            header="Detalles del Juego" modal footer={modalFooter}
            onHide={() => setVisible(false)}>
            {selectedItem && (
                <div className="card p-4">
                    <div className="row">
                        <div className="col-md-4">
                            <img src={selectedItem.imagen
                                ? `http://localhost:3002/uploads/juegos/img/${selectedItem.imagen}`
                                : 'http://localhost:3002/uploads/juegos/img/noexiste.png'}
                                alt={selectedItem.njuego} width="100%"
                                style={{ borderRadius: '6px', objectFit: 'cover', border: '1px solid #ddd' }}
                                onError={(e) => { e.target.src = 'http://localhost:3002/uploads/juegos/img/noexiste.png'; }} />
                        </div>
                        <div className="col-md-8">
                            <h4><strong>ID:</strong> {selectedItem.idjuego}</h4>
                            <h5><strong>Género:</strong> {selectedItem.ngenero}</h5>
                            <h5><strong>Juego:</strong> {selectedItem.njuego}</h5>
                            <h5><strong>Precio:</strong> {selectedItem.precio}</h5>
                            <h5><strong>Lanzamiento:</strong> {formatearFecha(selectedItem.fechapublicacion)}</h5>
                            <h6><strong>Descripción:</strong> {selectedItem.djuego}</h6>
                            <div><strong>Estado:</strong> <Tag value={selectedItem.idestatus === 1 ? 'Activo' : 'Inactivo'}
                                severity={selectedItem.idestatus === 1 ? 'success' : 'danger'} /></div>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>

        {/* Diálogo de formulario */}
        <Dialog visible={visibleForm} style={{ width: '500px' }}
            header={editId ? 'Editar Juego' : 'Agregar Juego'}
            modal className="p-fluid"
            footer={
                <div>
                    <Button label="Cancelar" icon="pi pi-times"
                        onClick={() => setVisibleForm(false)} className="p-button-text" />
                    <Button label="Guardar" icon="pi pi-check" onClick={saveJuego} />
                </div>
            }
            onHide={() => setVisibleForm(false)}
        >
            <div className="field">
                <label htmlFor="nombre">Nombre *</label>
                <InputText id="nombre" value={formData.nombre} onChange={(e) => onInputChange(e, 'nombre')}
                    autoFocus className={formErrors.nombre ? 'p-invalid' : ''} />
                {formErrors.nombre && <small className="p-error">{formErrors.nombre}</small>}
            </div>
            <div className="field">
                <label htmlFor="descripcion">Descripción</label>
                <InputText id="descripcion" value={formData.descripcion}
                    onChange={(e) => onInputChange(e, 'descripcion')} />
            </div>
            <div className="field">
                <label htmlFor="fechapublicacion">Fecha de Publicación *</label>
                <InputText id="fechapublicacion" type="date" value={formData.fechapublicacion}
                    onChange={(e) => onInputChange(e, 'fechapublicacion')}
                    className={formErrors.fechapublicacion ? 'p-invalid' : ''} />
                {formErrors.fechapublicacion && <small className="p-error">{formErrors.fechapublicacion}</small>}
            </div>
            <div className="field">
                <label htmlFor="precio">Precio *</label>
                <InputText id="precio" type="number" step="0.01" value={formData.precio}
                    onChange={(e) => onInputChange(e, 'precio')}
                    className={formErrors.precio ? 'p-invalid' : ''} />
                {formErrors.precio && <small className="p-error">{formErrors.precio}</small>}
            </div>
            <div className="field">
                <label htmlFor="valoracion">Valoración (1-10) *</label>
                <InputText id="valoracion" type="number" min="1" max="10" value={formData.valoracion}
                    onChange={(e) => onInputChange(e, 'valoracion')}
                    className={formErrors.valoracion ? 'p-invalid' : ''} />
                {formErrors.valoracion && <small className="p-error">{formErrors.valoracion}</small>}
            </div>
            <div className="field">
                <label htmlFor="idgenero">Género *</label>
                <Dropdown id="idgenero" value={formData.idgenero} options={generos}
                    optionValue="idgenero" optionLabel="nombre"
                    placeholder="Selecciona un género"
                    onChange={(e) => setFormData(prev => ({ ...prev, idgenero: e.value }))}
                    className={formErrors.idgenero ? 'p-invalid' : ''} />
                {formErrors.idgenero && <small className="p-error">{formErrors.idgenero}</small>}
            </div>
            <div className="field">
                <label htmlFor="imagenFile">Imagen del Juego *</label>
                <input type="file" accept="image/*" className={`form-control ${formErrors.imagen ? 'is-invalid' : ''}`}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        setFormData(prev => ({ ...prev, imagenFile: file }));
                        if (formErrors.imagen) setFormErrors(prev => ({ ...prev, imagen: null }));
                    }} />
                {formErrors.imagen && <small className="p-error">{formErrors.imagen}</small>}
                {editId && formData.imagen && (
                    <div className="mt-2">
                        <label>Imagen Actual</label>
                        <img src={`http://localhost:3002/uploads/juegos/img/${formData.imagen}`}
                            alt="Actual" width="100" style={{ borderRadius: '6px' }} />
                    </div>
                )}
            </div>
            <div className="field">
                <label>Estado</label>
                <div className="form-check">
                    <input type="radio" id="activo" name="idestatus" value="1"
                        checked={formData.idestatus === 1}
                        onChange={() => setFormData(prev => ({ ...prev, idestatus: 1 }))}
                        className="form-check-input" />
                    <label htmlFor="activo" className="form-check-label mx-2">Activo</label>
                </div>
                <div className="form-check">
                    <input type="radio" id="inactivo" name="idestatus" value="2"
                        checked={formData.idestatus === 2}
                        onChange={() => setFormData(prev => ({ ...prev, idestatus: 2 }))}
                        className="form-check-input" />
                    <label htmlFor="inactivo" className="form-check-label mx-2">Inactivo</label>
                </div>
                {formErrors.idestatus && <small className="p-error">{formErrors.idestatus}</small>}
            </div>
        </Dialog>
    </div>
    );
};

export default ListJuegos;