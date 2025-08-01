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
import ListUsuarios from './pages/Usuarios/ListUsuarios';
import ListPlataformas from './pages/plataformas/ListPlataformas';
import ListJuegos from './pages/juegos/ListJuegos';

// Importación dinámica de los componentes
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));

const App = () => {
  return (
    <UserProvider> {/* Cambiado de CompanyProvider a UserProvider */}
      <BrowserRouter>
        <Routes>
        
          <Route
            path="*"
            element={
             
                <div className="wrapper">
                  <div className="content-wrapper">
                    <Aside />
                    <div className="content">
                      <Header />
                      <Suspense fallback={<div>Cargando...</div>}>
                        <div className='app'>
                          <Routes>
                            <Route path="/" element={<Content />}>
                              <Route index element={<Dashboard />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/listgeneros" element={<ListGeneros />} />
                              <Route path="/listplataformas" element={<ListPlataformas />} />
                              <Route path="/listjuegos" element={<ListJuegos />} />
                              <Route path="/listusuarios" element={<ListUsuarios />} />
                              {/* Agrega aquí más rutas según necesites */}
                            </Route>
                          </Routes>
                        </div>
                      </Suspense>
                      <Footer />
                    </div>
                  </div>
                </div>
             
            }
          />


        </Routes>
      </BrowserRouter>
    </UserProvider> 
  );
};

export default App;