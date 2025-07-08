import React from 'react';
import { Link } from 'react-router-dom';
import './Accueil.css';


function Accueil() {
  return (
    <div className="accueil-container">
      {/* En-tête */}
      <header className="header">
        <div className="logo">UQO</div>
        <nav className="nav">
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/gererCours">GererCours</Link></li>
            <li><Link to="/grapheCours">Graphe</Link></li>
            <li><Link to="/outilsCheminement">Outils de cheminement</Link></li>
          </ul>
        </nav>
        <div className="menu-icon">☰</div>
      </header>

      {/* Section verte */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>PLANIFICATION DU<br />CHEMINEMENT ÉTUDIANT</h1>
          <p> Cet outil permet aux administrateurs de planifier et gérer<br />
              le cheminement académique des étudiants. </p>
          <button className="cta-button">Consulter les programmes</button>
        <div className="semi-circle-bleu"></div>
        </div>
        <div className="hero-right">
          <div className="semi-circle">
           <div className="point" style={{ top: '30px', left: '30px' }}></div>
           <div className="point" style={{ top: '60px', left: '70px' }}></div>
           <div className="point" style={{ top: '100px', left: '50px' }}></div>
           <div className="point" style={{ top: '130px', left: '90px' }}></div>
  </div>
          <div className="dots"></div>
           </div>
      </section>

      {/* Blocs */}
      <section className="features-section">
        <Link to="/gererCours" className="feature">
          <div className="feature-title">📊 Programmes</div>
          <div className="feature-desc">Liste et gestion des programmes d’études offerts.</div>
        </Link>
        <Link to="/graphe" className="feature blue">
          <div className="feature-title">🔗 Graphe</div>
          <div className="feature-desc">Visualisation des dépendances entre les cours.</div>
        </Link>
        <Link to="/cours" className="feature red">
          <div className="feature-title">📋 Liste des cours</div>
          <div className="feature-desc">Gestion des cours disponibles dans les programmes.</div>
        </Link>
        <Link to="/outilsCheminement" className="feature dark">
          <div className="feature-title">🛠️ Outils de cheminement</div>
          <div className="feature-desc">Création de plans de cheminement individuels.</div>
        </Link>
      </section>

      {/* Pied de page */}
      <footer className="footer">
        UQO | Université du Québec en Outaouais, 2025. Tous droits réservés.
      </footer>
    </div>
  );
}

export default Accueil;
