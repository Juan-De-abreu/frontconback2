// utils.js
export const formatNumber = (value) => {
    return (value == null ? "0" : parseFloat(value).toLocaleString('es-VE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).replace(',', '.'));
};

export const formatCurrency = (value) => {
    if (value == null) {
        return "0,00";
    }
    const numberValue = parseFloat(value);
    const formattedValue = numberValue.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formattedValue; // Ya no se reemplaza la coma
};

export const formatDate = (dateString) => {
    // Si no es una cadena válida, retorna una fecha por defecto o un mensaje
    if (typeof dateString !== 'string' || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return 'Fecha inválida';
    }

    // Extraer componentes de la fecha
    const [year, month, day] = dateString.split('-');
    
    // Crear objeto Date en la zona horaria local
    const date = new Date(year, month - 1, day);
    
    // Formatear a dd/mm/yyyy
    return date.toLocaleDateString('es-ES');
};


export const formatearFecha = (fechaISO) => {
  if (!fechaISO) return 'No especificada';

  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  const fecha = new Date(fechaISO);

  // Formato: "25 de octubre de 2019"
  return fecha.toLocaleDateString('es-ES', opciones).replace(' de ', ' de ');
};



/*
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES'); // Format dd/mm/yyyy
};
/*
export const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // Crear la fecha en la zona horaria local
    return date.toLocaleDateString('es-ES'); // Formato dd/mm/yyyy
};*/
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Formato HH:mm:ss
};