// Aside.js (refactorizado)
import { useState } from 'react';
import logo from '../assets/img/logo2.png';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import menuConfig from '../config/menuConfig'; 

// Importa íconos
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiList,
} from 'react-icons/fi';
import { MdDevices } from 'react-icons/md';
import { FaTag, FaGamepad } from 'react-icons/fa';

// Mapeo de íconos por nombre
const iconComponents = {
  FiHome,
  FaTag,
  MdDevices,
  FaGamepad,
  FiUsers,
  FiSettings,
  FiList,
  FiLogOut,
  FiChevronRight
};

const AsideMejorado = () => {
  const [openMenus, setOpenMenus] = useState({});
  const { user } = useUser();
  const navigate = useNavigate();

  const toggleMenu = (menuLabel) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuLabel]: !prev[menuLabel],
    }));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Filtra el menú según el rol del usuario
  const filteredMenu = menuConfig.filter((item) =>
    user && item.roles.includes(user.rol)
  );

  return (
    <aside className="app-sidebar bg-menu shadow-sm" style={{ minWidth: '250px' }}>
      {/* Logo */}
      <div className="sidebar-brand p-3 text-center d-flex flex-column align-items-center mb-3 mt-2">
        <img src={logo} alt="Logo" className="brand-image img-fluid mb-2" style={{ maxHeight: '70px' }} />
        <p className="small" style={{ fontSize: '10px' }}>GESTION DE VIDEOJUEGOS</p>
      </div>

      {/* Información del usuario */}
      <div className="text-center text-white my-2">
        {user ? (
          <>
            <h6 className="text-white-50 mt-2 mb-0 small">{user.nombre || 'Usuario'}</h6>
            <p className="text-white-50 small mb-0" style={{ fontSize: '12px' }}>{user.rol}</p>
          </>
        ) : (
          <p className="text-white-50 small mb-0">No autenticado</p>
        )}
      </div>

      {/* Menú */}
      <div className="sidebar-wrapper">
        <nav className="mt-2">
          <ul className="nav nav-pills flex-column">
            {filteredMenu.map((item) => {
              const Icon = iconComponents[item.icon];
              const isSubmenu = !!item.submenu;

              return (
                <li key={item.label} className="nav-item">
                  {isSubmenu ? (
                    <>
                      <a
                        href="#"
                        className="nav-link d-flex align-items-center justify-content-between"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleMenu(item.label);
                        }}
                      >
                        <div className="d-flex align-items-center">
                          {Icon && <Icon className="nav-icon me-3" />}
                          <span>{item.label}</span>
                        </div>
                        <FiChevronRight
                          className={`transition-all ${openMenus[item.label] ? 'rotate-90' : ''}`}
                        />
                      </a>
                      <ul
                        className={`nav flex-column ps-4 ${openMenus[item.label] ? 'd-block' : 'd-none'}`}
                      >
                        {item.submenu.map((subItem) => (
                          <li key={subItem.label} className="nav-item">
                            <Link
                              to={subItem.route}
                              className="nav-link d-flex align-items-center"
                            >
                              <FiList className="nav-icon me-3" />
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link to={item.route} className="nav-link d-flex align-items-center">
                      {Icon && <Icon className="nav-icon me-3" />}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}

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

export default AsideMejorado;