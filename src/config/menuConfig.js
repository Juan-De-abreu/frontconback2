

const menuConfig = [
  {
    label: 'Dashboard',
    icon: 'FiHome',
    route: '/',
    roles: ['admin']
  },
  {
    label: 'Géneros',
    icon: 'FaTag',
    submenu: [
      { label: 'Listado', route: '/listgeneros' }
    ],
    roles: ['admin', 'operador', 'vendedor']
  },
  {
    label: 'Plataformas',
    icon: 'MdDevices',
    submenu: [
      { label: 'Listado', route: '/listplataformas' }
    ],
    roles: ['admin', 'operador', 'vendedor']
  },
  {
    label: 'Juegos',
    icon: 'FaGamepad',
    submenu: [
      { label: 'Listado', route: '/listjuegos' }
    ],
    roles: ['admin', 'operador', 'vendedor']
  },
  {
    label: 'Usuarios',
    icon: 'FiUsers',
    submenu: [
      { label: 'Listado', route: '/listusuarios' }
    ],
    roles: ['admin']
  },
  {
    label: 'Vendedores',
    icon: 'FaGamepad', 
    submenu: [
      { label: 'Listado', route: '/listvendedores' }
    ],
    roles: ['vendedor']
  },
  {
    label: 'Administrar',
    icon: 'FiSettings',
    submenu: [
      { label: 'Subir Tablas', route: '/subirtablas' }
    ],
    roles: ['admin', 'operador', 'vendedor']
  }
];

export default menuConfig;