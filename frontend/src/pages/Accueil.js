import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './Accueil.css';


function Accueil() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  return (
    <div className="accueil-container">
      {/* En-tête */}
      <header className="header">
        <div className="logo">UQO</div>
        <button className="menu-toggle" onClick={() => setMenuOuvert(!menuOuvert)}>☰</button>

        <nav className={`nav ${menuOuvert ? 'open' : ''}`}>
          <ul>
            <li><Link to="/" onClick={() => setMenuOuvert(false)}>Accueil</Link></li>
            <li><Link to="/gererCours" onClick={() => setMenuOuvert(false)}>GererCours</Link></li>
            <li><Link to="/grapheCours" onClick={() => setMenuOuvert(false)}>Graphe</Link></li>
            <li><Link to="/outilsCheminement" onClick={() => setMenuOuvert(false)}>Outils de cheminement</Link></li>
          </ul>
        </nav>
      </header>

      {/* Bannière verte */}
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
        <Link to="/gererCours" className="feature teal">
          <div className="feature-title">📊 Gestion des cours</div>
          <div className="feature-desc">Gestion des cours offerts.</div>
        </Link>
        <Link to="/grapheCours" className="feature blue">
          <div className="feature-title">🔗 Graphe</div>
          <div className="feature-desc">Visualisation des dépendances entre les cours.</div>
        </Link>
        <Link to="/cours" className="feature red">
          <div className="feature-title">📋 Liste des cours</div>
          <div className="feature-desc">Liste des cours disponibles dans les programmes.</div>
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
