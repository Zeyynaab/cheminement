import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';
import './GrapheCours.css';

const GrapheCours = () => {
  const containerRef = useRef(null);
  const [programmes, setProgrammes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [programmeId, setProgrammeId] = useState('');
  const [etudiantId, setEtudiantId] = useState('');
  const [message, setMessage] = useState("Veuillez sélectionner un programme ou un étudiant");

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/programmes/')
      .then(res => res.json())
      .then(data => setProgrammes(data));

    fetch('http://127.0.0.1:8000/api/etudiants/')
      .then(res => res.json())
      .then(data => setEtudiants(data));
  }, []);

  const genererGraphe = () => {
    if (!programmeId || !etudiantId) {
      setMessage("Veuillez sélectionner un programme ET un étudiant.");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/graphe_cours/?programme_id=${programmeId}&etudiant_id=${etudiantId}`)
      .then(res => res.json())
      .then(data => {
        setMessage("");
        const idsPrerequis = new Set(data.edges.map(edge => edge.from));

        // 1. Regrouper les cours par session
        const coursParSession = {};
        data.nodes.forEach(node => {
          const s = parseInt(node.session); //fleche meme si le cours na pas de préalables
          if (!coursParSession[node.session]) coursParSession[node.session] = [];
          coursParSession[node.session].push(node.id);
        });

        // 2. Ajouter flèches logiques entre sessions
        /* for (let i = 1; i <= 5; i++) {
          if (coursParSession[i] && coursParSession[i + 1]) {
            coursParSession[i].forEach(fromId => {
              coursParSession[i + 1].forEach(toId => {
                data.edges.push({ from: fromId, to: toId, arrows: 'to', dashes: true });
              });
            });
          }
        } */
        // Ajouter des flèches logiques UNIQUEMENT depuis les cours sans sortie vers la session suivante
for (let i = 1; i <= 5; i++) {
  const coursActuels = coursParSession[i] || [];
  const coursSuivants = coursParSession[i + 1] || [];

  coursActuels.forEach(fromId => {
    const aDejaUneSortie = data.edges.some(e => e.from === fromId);
    
    if (!aDejaUneSortie) {
      coursSuivants.forEach(toId => {
        data.edges.push({
          from: fromId,
          to: toId,
          arrows: 'to',
          dashes: true,
          color: { color: '#999' } // couleur grise par défaut
        });
      });
    }
  });
}

        // 3. Trier les nodes par session
        const sortedNodes = [...data.nodes].sort((a, b) => a.session - b.session);

        // 4. Générer les nœuds
        const nodes = sortedNodes.map(node => ({
          id: node.id,
          label: node.label,
          title: node.nom,
          level: node.session || 1,
          //level : node.session ? parseInt(node.session):1,
          color: idsPrerequis.has(node.id) ? '#f44336' : '#4caf50'
        }));

        // 5. Générer les arêtes
        const edges = data.edges.map(edge => ({
          from: edge.from,
          to: edge.to,
          arrows: 'to',
          dashes: false
        }));

        // Options vis-network
        const options = {
          layout: {
            hierarchical: {
              enabled: true,
              direction: 'UD',
              sortMethod: 'directed',
              nodeSpacing: 150, //avant 200
              levelSeparation: 150 //avant 200
            }
          },
          physics: false,
          interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: false
          },
          nodes: {
            shape: 'dot',
            size: 20,
            font: { color: '#000', size: 14 },
            borderWidth: 2
          },
          edges: {
            color: '#aaa',
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            smooth: {
              type: 'cubicBezier',
              forceDirection: 'vertical',
              roundness: 0.3
            }
          }
        };

        // Créer le graphe
        new Network(containerRef.current, { nodes, edges }, options);
      });
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <ul>
          <li><a href="/">🏠 Accueil</a></li>
          <li><a href="/gererCours">📚 Cours et Programmes</a></li>
          <li><a href="/etudiants">👤 Étudiants</a></li>
          <li className="active"><a href="/grapheCours">📚 Graphe</a></li>
          <li><a href="/outilsCheminement">⚙️ Outils de cheminement</a></li>
        </ul>
      </nav>

      <div className="content-wrapper">
        <header className="topbar">
          <button id="toggleSidebar" className="barreDeroulante" onClick={() => document.body.classList.toggle("collapsed")}>☰</button>
          <h1>UQO</h1>
        </header>

        <main>
          <h2>Graphe des cours et préalables</h2>

          <div id="graphBox">
            <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              <div>
                <label htmlFor="programme">Programme :</label>
                <select id="programme" onChange={e => setProgrammeId(e.target.value)} value={programmeId}>
                  <option value="">Sélectionner...</option>
                  {programmes.map(p => <option key={p.id} value={p.id}>{p.nom_programme}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="etudiant">Étudiant :</label>
                <select id="etudiant" onChange={e => setEtudiantId(e.target.value)} value={etudiantId}>
                  <option value="">Sélectionner...</option>
                  {etudiants.map(e => <option key={e.id} value={e.id}>{e.nom_etudiant}</option>)}
                </select>
              </div>
              <button onClick={genererGraphe}>Générer le graphe</button>
            </div>

            {message && <div className="message">{message}</div>}

            <div ref={containerRef} style={{ width: '100%', height: '600px', border: '1px solid #ccc' }} />

            <div className="info">
              <p><span className="completed"></span> Cours principaux</p>
              <p><span className="pending"></span> Cours préalables</p>
            </div>
          </div>
        </main>

        <footer>
          <p>UQO | Université du Québec en Outaouais, 2025. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default GrapheCours;
