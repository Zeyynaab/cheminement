import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  return (
    <nav className="sidebar">
      <ul>
        <li className={location.pathname === '/outils' ? 'active' : ''}>
          <Link to="/outils">⚙️ Outils de cheminement</Link>
        </li>
        <li className={location.pathname === '/etudiants' ? 'active' : ''}>
          <Link to="/etudiants">👤 Étudiants</Link>
        </li>
        <li className={location.pathname === '/cours' ? 'active' : ''}>
          <Link to="/cours">📚 Cours et Programmes</Link>
        </li>
        <li className={location.pathname === '/graphe' ? 'active' : ''}>
          <Link to="/graphe">🗺️ Graphe des cours</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
