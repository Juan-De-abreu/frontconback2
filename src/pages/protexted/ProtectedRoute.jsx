// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const ProtectedRoute = ({ children, requiredRol }) => {
  const { user } = useUser();
  console.log(user)
  // 1. Verifica autenticación
  if (!user) {
    console.log("❌ No hay usuario autenticado. Redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // 2. Si se requiere un rol específico, verifica que el usuario lo tenga
  if (requiredRol && user.rol !== requiredRol) {
    console.log(
      `❌ Acceso denegado: se requiere rol '${requiredRol}', pero el usuario tiene rol '${user.rol}'`
    );
    return <Navigate to="/" replace />; // o a una página de acceso denegado
  }

  // 3. Si todo está bien, permite el acceso
  return children;
};

export default ProtectedRoute;