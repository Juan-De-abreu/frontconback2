import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Cambiado a UserContext

const ProtectedRoute = ({ children }) => {
  const { user } = useUser(); // Cambiado a useUser

  // Verifica si el usuario está autenticado
  if (!user) {
    console.log("Redirigiendo al login porque no hay usuario autenticado");
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;