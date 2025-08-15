import { useEffect, useState, useRef } from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { FilterMatchMode } from 'primereact/api';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';

const API = 'http://localhost:3002/api/productos';
const API_CATEGORIAS = 'http://localhost:3002/api/categorias';

const ListProductos = () => {
  const [datos, setDatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [visibleForm, setVisibleForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    idcategoria: '',
    precio: '',
    stock: '',
    idestatus: 1,
    imagen: '',      // nombre archivo en BD
    imagenFile: null // archivo seleccionado (no guardado en BD)
  });
  const [formErrors, setFormErrors] = useState({});
  const toast = useRef(null);
  const dt = useRef(null);

  // Carga datos de productos
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

  // Carga datos de categorías
  const getCategorias = async () => {
    try {
      const response = await fetch(API_CATEGORIAS);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    getDatos();
    getCategorias();
  }, []);

  // Abrir formulario nuevo producto
  const openNew = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      idcategoria: '',
      precio: '',
      stock: '',
      idestatus: 1,
      imagen: '',
      imagenFile: null
    });
    setEditId(null);
    setFormErrors({});
    setVisibleForm(true);
  };

  // Mostrar detalles producto
  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    setVisible(true);
  };

  // Botones de acción para cada fila
  const actionBodyTemplate = (rowData) => (
    <div className="d-flex gap-2">
      <Button icon="pi pi-eye" className="p-button-rounded p-button-info"
        onClick={() => handleViewDetails(rowData)} tooltip="Ver detalles" />
      <Button icon="pi pi-trash" className="p-button-rounded p-button-danger"
        onClick={() => confirmDelete(rowData)} tooltip="Eliminar" />
      <Button icon="pi pi-pencil" className="p-button-rounded p-button-warning"
        onClick={() => editProducto(rowData)} tooltip="Editar" />
    </div>
  );

  // Etiqueta para estado
  const statusBodyTemplate = (rowData) => (
    <Tag value={rowData.idestatus === 1 ? 'Activo' : 'Inactivo'}
      severity={rowData.idestatus === 1 ? 'success' : 'danger'} />
  );

  // Imagen de producto en la tabla
  const imageBodyTemplate = (rowData) => {
    const src = rowData.imagen
      ? `http://localhost:3002/uploads/productos/img/${rowData.imagen}`
      : 'http://localhost:3002/uploads/productos/img/noexiste.png';
    return (
      <img src={src} alt="Producto" width="50"
        style={{ borderRadius: '6px', border: '1px solid #ddd' }}
        onError={e => { e.target.src = 'http://localhost:3002/uploads/productos/img/noexiste.png'; }} />
    );
  };

  // Filtro global
  const onGlobalFilterChange = (e) => {
    let _filters = { ...filters };
    _filters['global'].value = e.target.value;
    setFilters(_filters);
  };

  // Encabezado tabla con botón crear y filtro búsqueda
  const renderHeader = () => {
    const value = filters['global'] ? filters['global'].value : '';
    return (
      <div className="d-flex justify-content-between align-items-center">
        <Button label="Nuevo Producto" icon="pi pi-plus"
          className="p-button-success" onClick={openNew} />
        <span className="p-input-icon-left mx-2" style={{ flexGrow: 1 }}>
          <i className="pi pi-search mx-1" />
          <InputText value={value || ''} onChange={onGlobalFilterChange}
            placeholder="Buscar..." className="w-100 px-4" />
        </span>
      </div>
    );
  };
  const header = renderHeader();

  // Manejo cambios en formulario
  const onInputChange = (e, field) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
  };

  // Validación del formulario
  const validate = () => {
    const errors = {};

    if (!formData.nombre || formData.nombre.trim() === '') {
      errors.nombre = 'El nombre es obligatorio.';
    } else if (formData.nombre.trim().length > 150) {
      errors.nombre = 'El nombre no puede exceder 150 caracteres.';
    }

    if (!formData.idcategoria || isNaN(Number(formData.idcategoria))) {
      errors.idcategoria = 'Debe seleccionar una categoría válida.';
    }

    if (!formData.precio && formData.precio !== 0) {
      errors.precio = 'El precio es obligatorio.';
    } else if (isNaN(Number(formData.precio))) {
      errors.precio = 'El precio debe ser un número válido.';
    } else if (Number(formData.precio) < 0) {
      errors.precio = 'El precio no puede ser negativo.';
    }

    if (formData.stock !== '' && formData.stock !== null && formData.stock !== undefined) {
      if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
        errors.stock = 'El stock debe ser un entero mayor o igual a cero.';
      }
    }

    if (![1, 2].includes(Number(formData.idestatus))) {
      errors.idestatus = 'Debe seleccionar un estado válido.';
    }

    // Imagen obligatoria solo al crear
    if (!editId && !formData.imagenFile) {
      errors.imagen = 'Debe seleccionar una imagen.';
    } else if (editId && !formData.imagenFile && !formData.imagen) {
      errors.imagen = 'El producto no tiene imagen.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar producto (crear o actualizar)
  const saveProducto = async () => {
    if (!validate()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre.trim());
      formDataToSend.append('idcategoria', formData.idcategoria);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock || '0');
      formDataToSend.append('idestatus', formData.idestatus);
      if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
      if (formData.imagenFile) formDataToSend.append('imagen', formData.imagenFile);

      const isEdit = editId !== null;
      const url = isEdit ? `${API}/${editId}` : API;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, { method, body: formDataToSend });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || `No se pudo ${isEdit ? 'actualizar' : 'crear'} el producto`);

      setVisibleForm(false);
      getDatos();
      setEditId(null);
      toast.current.show({
        severity: 'success',
        summary: 'Éxito',
        detail: `Producto ${isEdit ? 'actualizado' : 'creado'} correctamente`,
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

  // Editar producto (llenar formulario)
  const editProducto = (producto) => {
    setFormData({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      idcategoria: producto.idcategoria?.toString() || '',
      precio: producto.precio !== null ? producto.precio.toString() : '',
      stock: producto.stock !== null ? producto.stock.toString() : '',
      idestatus: Number(producto.idestatus),
      imagen: producto.imagen || '',
      imagenFile: null
    });
    setEditId(producto.idproducto);
    setFormErrors({});
    setVisibleForm(true);
  };

  // Confirmación y eliminación de producto
  const deleteProducto = (producto) => {
    confirmDialog({
      message: `¿Eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          const response = await fetch(`${API}/${producto.idproducto}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('No se pudo eliminar');
          getDatos();
          toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado correctamente', life: 3000 });
        } catch (err) {
          toast.current.show({ severity: 'error', summary: 'Error', detail: err.message, life: 5000 });
        }
      },
      reject: () => {
        toast.current.show({ severity: 'info', summary: 'Cancelado', detail: 'No se eliminó', life: 3000 });
      }
    });
  };

  const modalFooter = (
    <Button label="Cerrar" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
  );

  if (loading || loadingCategorias) {
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

      <h4 className="text-center py-4">Lista de Productos</h4>
      <div className="card">
        <DataTable
          ref={dt}
          value={datos}
          paginator rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          dataKey="idproducto"
          emptyMessage="No se encontraron productos."
          filters={filters}
          globalFilterFields={['nombre', 'descripcion']}
          header={header}
        >
          <Column field="idproducto" header="ID" sortable className="text-center" style={{ width: '7%' }} />
          <Column header="Imagen" body={imageBodyTemplate} style={{ width: '8%' }} className="text-center" />
          <Column field="nombre" header="Nombre" sortable style={{ width: '25%' }} />
          <Column field="idcategoria" header="Categoría (ID)" sortable className="text-center" style={{ width: '10%' }} />
          <Column field="precio" header="Precio" sortable className="text-center" style={{ width: '10%' }} />
          <Column field="stock" header="Stock" sortable className="text-center" style={{ width: '10%' }} />
          <Column field="idestatus" header="Estado" body={statusBodyTemplate} sortable className="text-center" style={{ width: '10%' }} />
          <Column header="Acciones" body={actionBodyTemplate} className="text-center" style={{ width: '15%' }} />
        </DataTable>
      </div>

      {/* Detalles */}
      <Dialog visible={visible} style={{ width: '600px' }}
        header="Detalles del Producto" modal footer={modalFooter} onHide={() => setVisible(false)}>
        {selectedProducto && (
          <div className="card p-4">
            <div><strong>ID:</strong> {selectedProducto.idproducto}</div>
            <div><strong>Nombre:</strong> {selectedProducto.nombre}</div>
            <div><strong>Categoría (ID):</strong> {selectedProducto.idcategoria}</div>
            <div><strong>Precio:</strong> {selectedProducto.precio !== null ? selectedProducto.precio : '-'}</div>
            <div><strong>Stock:</strong> {selectedProducto.stock !== null ? selectedProducto.stock : '-'}</div>
            <div><strong>Descripción:</strong> {selectedProducto.descripcion || '-'}</div>
            <div className="my-2">
              <img src={selectedProducto.imagen
                ? `http://localhost:3002/uploads/productos/img/${selectedProducto.imagen}`
                : 'http://localhost:3002/uploads/productos/img/noexiste.png'}
                alt={selectedProducto.nombre} width="150"
                style={{ borderRadius: '6px', border: '1px solid #ddd' }}
                onError={e => e.target.src = 'http://localhost:3002/uploads/productos/img/noexiste.png'}
              />
            </div>
            <div><strong>Estado:</strong> <Tag
              value={selectedProducto.idestatus === 1 ? 'Activo' : 'Inactivo'}
              severity={selectedProducto.idestatus === 1 ? 'success' : 'danger'} /></div>
          </div>
        )}
      </Dialog>

      {/* Formulario crear/editar */}
      <Dialog visible={visibleForm} style={{ width: '500px' }}
        header={editId ? "Editar Producto" : "Agregar Producto"} modal className="p-fluid"
        footer={
          <div>
            <Button label="Cancelar" icon="pi pi-times" onClick={() => setVisibleForm(false)} className="p-button-text" />
            <Button label="Guardar" icon="pi pi-check" onClick={saveProducto} />
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
          <label htmlFor="idcategoria">Categoría *</label>
          <Dropdown id="idcategoria" value={formData.idcategoria} options={categorias}
            optionValue="idcategoria" optionLabel="nombre"
            placeholder="Selecciona una categoría"
            onChange={(e) => setFormData(prev => ({ ...prev, idcategoria: e.value }))}
            className={formErrors.idcategoria ? 'p-invalid' : ''}
          />
          {formErrors.idcategoria && <small className="p-error">{formErrors.idcategoria}</small>}
        </div>

        <div className="field">
          <label htmlFor="precio">Precio *</label>
          <InputText id="precio" type="number" step="0.01" value={formData.precio} onChange={(e) => onInputChange(e, 'precio')}
            className={formErrors.precio ? 'p-invalid' : ''} />
          {formErrors.precio && <small className="p-error">{formErrors.precio}</small>}
        </div>

        <div className="field">
          <label htmlFor="stock">Stock</label>
          <InputText id="stock" type="number" value={formData.stock} onChange={(e) => onInputChange(e, 'stock')}
            className={formErrors.stock ? 'p-invalid' : ''} />
          {formErrors.stock && <small className="p-error">{formErrors.stock}</small>}
        </div>

        <div className="field">
          <label htmlFor="descripcion">Descripción</label>
          <InputTextarea id="descripcion" rows={4} value={formData.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} />
        </div>

        <div className="field">
          <label htmlFor="imagenFile">Imagen del Producto {editId ? '(dejar vacío para no cambiar)' : '*'}</label>
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
              <img src={`http://localhost:3002/uploads/productos/img/${formData.imagen}`} alt="Actual" width="100" style={{ borderRadius: '6px' }} />
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

export default ListProductos;