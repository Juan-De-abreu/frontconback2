import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const CompanyContext = createContext();

// Proveedor del contexto
export const CompanyProvider = ({ children }) => {

  const [company, setCompany] = useState(() => {
    const storedCompany = localStorage.getItem('company');
    return storedCompany ? JSON.parse(storedCompany) : null;
  });


  // Actualizar localStorage cuando cambie el estado
  useEffect(() => {
    if (company) {
      localStorage.setItem('company', JSON.stringify(company));
    } else {
      localStorage.removeItem('company');
    }
  }, [company]);




  return (
    <CompanyContext.Provider value={{ company, setCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe ser usado dentro de un CompanyProvider');
  }
  return context;
};