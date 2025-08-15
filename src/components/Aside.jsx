import { useState } from 'react';
import logo from '../assets/img/logo2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // Cambiado a UserContext
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiLogOut,
  FiChevronRight,
  FiList,
} from 'react-icons/fi';

import { CiShop } from "react-icons/ci";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";

import { MdDevices } from 'react-icons/md';
import { FaTag, FaGamepad } from 'react-icons/fa';
import { BiCategory } from "react-icons/bi";

const Aside = () => {
    const [openMenus, setOpenMenus] = useState({});
    const { user } = useUser(); // Cambiado a useUser
    const navigate = useNavigate();

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <aside className="app-sidebar bg-menu shadow-sm" style={{ minWidth: '250px' }}>
            {/* Logo y marca */}
            <div className="sidebar-brand p-3 text-center d-flex flex-column align-items-center mb-3 mt-2">
                <img 
                    src={logo} 
                    alt="Up Sales Enterprise" 
                    className="brand-image img-fluid mb-2" 
                    style={{ maxHeight: '70px' }}
                />
                <p className='small' style={{ fontSize: '10px' }}>GESTION DE VIDEOJUEGOS</p>
            </div>
            
            {/* Información del usuario */}
            <div className='text-center text-white my-2'>
                {user ? (
                    <div>
                        <h6 className="text-white-50 mt-2 mb-0 small">
                            {user.nombre || user.correo || 'Usuario'}
                        </h6>
                        {user.rol && (
                            <p className="text-white-50 small mb-0" style={{ fontSize: '12px' }}>
                                {user.rol}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-white-50 small mb-0">No hay usuario autenticado</p>
                )}
            </div>

            {/* Menú principal */}
            <div className="sidebar-wrapper">
                <nav className="mt-2">
                    <ul className="nav nav-pills flex-column">
                         {user.rol === 'admin' && (
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-link d-flex align-items-center">
                                    <FiHome className="nav-icon me-3" />
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                        )}
                        
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('alumnos'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <FaTag className="nav-icon me-3" />
                                    <span>Géneros</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['alumnos'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['alumnos'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/listgeneros" className="nav-link d-flex align-items-center">
                                        <FiList className="nav-icon me-3" />
                                        <span>Listado</span>
                                    </Link>
                                </li> 
                            </ul>
                        </li>
                        
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('inventarios'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <MdDevices className="nav-icon me-3" />
                                    <span>Plataformas</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['inventarios'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['inventarios'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/listplataformas" className="nav-link d-flex align-items-center">
                                        <FiList className="nav-icon me-3" />
                                        <span>Listado</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('becarios'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <FaGamepad className="nav-icon me-3" />
                                    <span>Juegos</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['becarios'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['becarios'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/listjuegos" className="nav-link d-flex align-items-center">
                                        <FiList className="nav-icon me-3" />
                                        <span>Listado</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('talleres'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <FiUsers className="nav-icon me-3" />
                                    <span>Usuarios</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['talleres'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['talleres'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/listusuarios" className="nav-link d-flex align-items-center">
                                        <FiList className="nav-icon me-3" />
                                        <span>Listado</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                         {user.rol === 'operador' && (
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('tienda'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <CiShop className="nav-icon me-3"/>
                                    <span>Tienda</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['tienda'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['tienda'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/listcategorias" className="nav-link d-flex align-items-center">
                                        <BiCategory className="nav-icon me-3" />
                                        <span>Categorias</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/listproductos" className="nav-link d-flex align-items-center">
                                        <MdOutlineProductionQuantityLimits className="nav-icon me-3" />
                                        <span>Productos</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/listtienda" className="nav-link d-flex align-items-center">
                                        <MdOutlineProductionQuantityLimits className="nav-icon me-3" />
                                        <span>Tienda</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        )}
                        <li className="nav-item">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center justify-content-between"
                                onClick={(e) => { e.preventDefault(); toggleMenu('administrar'); }}
                            >
                                <div className="d-flex align-items-center">
                                    <FiSettings className="nav-icon me-3" />
                                    <span>Administrar</span>
                                </div>
                                <FiChevronRight className={`transition-all ${openMenus['administrar'] ? 'rotate-90' : ''}`} />
                            </a>
                            <ul className={`nav flex-column ps-4 ${openMenus['administrar'] ? 'd-block' : 'd-none'}`}>
                                <li className="nav-item">
                                    <Link to="/subirtablas" className="nav-link d-flex align-items-center">
                                        <FiList className="nav-icon me-3" />
                                        <span>Subir Tablas</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>

                        {/* Opción Salir */}
                        <li className="nav-item mt-3 border-top pt-2">
                            <a 
                                href="#" 
                                className="nav-link d-flex align-items-center text-danger"
                                onClick={handleLogout}
                            >
                                <FiLogOut className="nav-icon me-3" />
                                <span>Salir</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Aside;