import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaBolt, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="sidebar">Cargando...</div>;

  return (
    <aside className="sidebar">
      <h2>Sistema Energético</h2>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <FaHome /> Inicio
            </NavLink>
          </li>

          {user && (
            <>
              <li>
                <NavLink
                  to="/registros"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaBolt /> Registros
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/registros/nuevo"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <FaPlusCircle /> Nuevo Registro
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {user && (
        <div className="logout">
          <button onClick={logout}>
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
