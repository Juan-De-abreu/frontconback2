import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Aside from './components/Aside';
import Content from './components/Content';
import Footer from './components/Footer';
import Header from './components/Header';

import { UserProvider } from './contexts/UserContext'; // Cambiado a UserProvider
import LoginForm from './pages/protexted/LoginForm';

import ProtectedRoute from './pages/protexted/ProtectedRoute';

import ListGeneros from './pages/generos/ListGeneros';
import ListUsuarios from './pages/usuarios/ListUsuarios';
import ListPlataformas from './pages/plataformas/ListPlataformas';
import ListJuegos from './pages/juegos/ListJuegos';

import ListCategorias from './pages/tienda/ListCategorias';
import ListProductos from './pages/tienda/ListProductos';
import ListTienda from './pages/tienda/ListTienda';

// Importación dinámica de los componentes
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));


const ProtectedLayout = () => (

  <div className="wrapper">
    <div className="content-wrapper">
      <Aside />
      <div className="content">
        <Header />
        <Suspense fallback={<div>Cargando...</div>}>
          <Content />
        </Suspense>
        <Footer />
      </div>
    </div>
  </div>
);
const App = () => {
  return (
    <UserProvider> {/* Cambiado de CompanyProvider a UserProvider */}
      <BrowserRouter>
       <Routes>
           {/* Ruta pública */}
          <Route path="/login" element={<LoginForm />} />

          {/* Rutas protegidas: solo para usuarios autenticados */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
              {/* Todas las rutas hijas están dentro del layout */}
              <Route path="/" element={<Content />}>

              {/* Solo admin  */}
              <Route path="dashboard"    element={<ProtectedRoute requiredRol="admin"> <Dashboard />  </ProtectedRoute>}/>
              <Route path="listusuarios" element={<ProtectedRoute requiredRol="admin"> <ListUsuarios /></ProtectedRoute>}/>
            

              {/* Solo operador */}
              <Route path="listcategorias" element={<ProtectedRoute requiredRol="operador"> <ListCategorias /></ProtectedRoute>}/>
              <Route path="listproductos" element={<ProtectedRoute requiredRol="operador"> <ListProductos /></ProtectedRoute>}/>
              <Route path="listtienda" element={<ProtectedRoute requiredRol="operador"> <ListTienda /></ProtectedRoute>}/>


              {/* Estas rutas las ven todos los autenticados (admin y operador) */}
              <Route path="listgeneros" element={<ListGeneros />} />
              <Route path="listplataformas" element={<ListPlataformas />} />
              <Route path="listjuegos" element={<ListJuegos />} />

                

              </Route>
          </Route>
          {/* Cualquier otra ruta → login */}
          <Route path="*" element={<Navigate to="/login" />} />
       </Routes>   
      </BrowserRouter>
    </UserProvider> 
  );
};

export default App;



                             
  
