// components/Content.jsx
import { Outlet } from 'react-router-dom';

const Content = () => {
  return (
    <div>
      {/* Aquí puedes agregar contenido adicional si lo deseas */}
      <Outlet /> {/* Este es el lugar donde se renderizarán las rutas secundarias */}
    </div>
  );
};

export default Content;