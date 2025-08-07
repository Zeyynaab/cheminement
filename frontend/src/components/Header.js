/* import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

function Header() {
  const location = useLocation();

  // Ne pas afficher Header + Sidebar sur la page d'accueil
  if (location.pathname === '/') return null;

  return (
    <>
      <header className="topbar">
        <button id="toggleSidebar" className="barreDeroulante">☰</button>
        <h1>UQO</h1>
      </header>
      <Sidebar />
    </>
  );
}

export default Header;
 */