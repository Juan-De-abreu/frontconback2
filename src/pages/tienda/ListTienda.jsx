import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const API = 'http://localhost:3002/api/productos';

const ListTienda = () => {

    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Cargando Productos...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center py-5 text-danger">
                <h4>Error al cargar los Productos</h4>
                <p>{error}</p>
            </div>
        );
    }

  return (
        <div className="container" >
            <h2 className="text-center py-4 mt-4 mb-4 text-black">Productos</h2>
            <div className="row">
                {datos.map((item) => (
                    <div className="col-md-4 col-xl-3 mb-4">
            <div className="card h-100">
                <div className="card-header p-0">
                    
                    <img className='img-fluid' src={`http://localhost:3002/uploads/productos/img/${item.imagen}`} alt="" />

                </div>
                <div className="card-body text-center">
                    <p className="fs-5">{item.nombre}</p>
                    <p className="fs-5 text-danger fw-bold">Precio: {item.precio}$</p>
                </div>
                <div className="card-footer text-center">
                    <a href="#" className="btn btn-primary btn-sm me-3" data-bs-toggle="modal" data-bs-target={`#${item.id}`}>Modal</a>
                    <Link to={`/detalle/${item.id}/${item.nombre}/${item.categoria}`} href="#" className="btn btn-primary btn-sm" >Detalle</Link>
                    <hr />
                    <button className="btn btn-success" onClick={() => agregar(item)}>+ Agregar</button>
                    
                </div>
            </div>

            <div className="modal fade" id={item.id} tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">{item.title}</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-4">
                                    <img className='img-fluid' src={`http://localhost:3002/uploads/productos/img/${item.imagen}`} alt="" />
                                </div>
                                <div className="col-md-8">
                                    <p className="fs-3">{item.nombre}</p>
                                    <p className="fs-3">Categoria: {item.categoria}</p>
                                    <p className="fs-3">Stock: {item.stock}</p>
                                    <p className="fs-6">{item.descripcion}</p>
                                    <p className="fs-5 text-danger fw-bold">Precio: {item.precio}$</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>

                        </div>
                    </div>
                </div>
            </div>

        </div>
                ))}

            </div>
        </div>
    )
}

export default ListTienda