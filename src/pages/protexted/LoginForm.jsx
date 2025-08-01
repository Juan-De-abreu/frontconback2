import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext'; // Usar UserContext
import logo from '../../assets/img/logo2.png';

const LoginForm = () => {
  const navigate = useNavigate();
  const { setUser } = useUser(); // Usar setUser
  
  const [formData, setFormData] = useState({
    username: '', // correo
    password: '', // clave
  });

  const [error, setError] = useState(''); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Limpiar el error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Realizar la solicitud a TU NUEVO API en Express
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: formData.username,  // correo del usuario
          clave: formData.password,   // contraseña del usuario
        }),
      });
  
      const data = await response.json();

      // Validar la respuesta del backend
      if (!data.success) {
        throw new Error(data.message || 'Error al validar el usuario.');
      }
  
      // Guardar el usuario y el token en el contexto global
      setUser({ ...data.usuario, token: data.token });

      // Almacenar el usuario en localStorage
      localStorage.setItem('user', JSON.stringify({ ...data.usuario, token: data.token }));
   
      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      // Mostrar el mensaje de error recibido del backend
      setError(error.message);
      console.error("Error en el inicio de sesión:", error.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div className="card shadow-lg w-100" style={{ maxWidth: '400px' }}>
        <div className="card-header text-center bg-dark text-white">
          <img src={logo} alt="Logo" style={{ width: '150px' }} />
        </div>
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Iniciar Sesión</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email" // Cambiado a email para mejor UX
                className="form-control"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Ingresa tu correo"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Ingresa tu contraseña"
              />
            </div>

            {/* Mostrar mensaje de error si existe */}
            {error && (
              <div className="alert alert-danger text-center small">
                {error}
              </div>
            )}
            
            <button type="submit" className="btn btn-primary w-100">
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;