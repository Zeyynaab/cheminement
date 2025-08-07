import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import "vis-network/styles/vis-network.css";
import "./GrapheCours.css";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";

const GrapheCours = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [programmes, setProgrammes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [programmeId, setProgrammeId] = useState("");
  const [etudiantId, setEtudiantId] = useState("");
  const [message, setMessage] = useState(
    "Veuillez sélectionner un programme ou un étudiant"
  );

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/programmes/")
      .then((res) => res.json())
      .then((data) => setProgrammes(data));
    fetch("http://127.0.0.1:8000/api/etudiants/")
      .then((res) => res.json())
      .then((data) => setEtudiants(data));
  }, []);

  const genererGraphe = () => {
    if (!programmeId || !etudiantId) {
      setMessage("Veuillez sélectionner un programme ET un étudiant.");
      return;
    }

    fetch(
      `http://127.0.0.1:8000/api/graphe_cours/?programme_id=${programmeId}&etudiant_id=${etudiantId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMessage("");

        // repérage des prérequis
        const idsPrerequis = new Set(data.edges.map((e) => e.from));

        // tri par session
        const sorted = [...data.nodes].sort((a, b) => a.session - b.session);

        // regrouper par session
        const mapBySession = {};
        sorted.forEach((n) => {
          if (!mapBySession[n.session]) mapBySession[n.session] = [];
          mapBySession[n.session].push(n);
        });

        // espacements
        const H_SPACING = 120;
        const V_SPACING = 120;
        const X_OFFSET = 20;

        // Calcul largeur minimale
        const maxCount = Math.max(
          ...Object.values(mapBySession).map((arr) => arr.length)
        );
        const totalWidth = X_OFFSET * 2 + (maxCount - 1) * H_SPACING + 120;
        containerRef.current.style.minWidth = `${totalWidth}px`;

        // construction des nœuds
        const nodes = sorted.map((node) => {
          const idx = mapBySession[node.session].findIndex(
            (m) => m.id === node.id
          );
          return {
            id: node.id,
            label: node.label,
            title: `${node.label} – ${node.nom}`,
            x: X_OFFSET + idx * H_SPACING,
            y: (node.session - 1) * V_SPACING,
            fixed: { y: true },
            color: idsPrerequis.has(node.id) ? "#f44336" : "#4caf50",
            shape: "box",
            margin: 8,
            widthConstraint: { minimum: 80, maximum: 120 },
            heightConstraint: { minimum: 40 },
            font: {
              color: "#000000",
              size: 14,
              face: "Arial",
              bold: true,
              align: "center",
              vadjust: -10,
            },
          };
        });

        // construction des arêtes
        const edges = data.edges.map((e, i) => ({
          id: `edge-${i}`,
          from: e.from,
          to: e.to,
          arrows: { to: { enabled: true, scaleFactor: 0.3 } },
          color: { color: "#000000", highlight: "#ff0000", hover: "#ff0000" },
          width: 1,
          smooth: { type: "cubicBezier", forceDirection: "vertical", roundness: 0.4 },
        }));

        const options = {
          layout: { hierarchical: false },
          physics: false,
          interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: false,
            hover: true,
          },
          autoResize: true,
        };

        // création ou mise à jour du réseau
        if (!networkRef.current) {
          networkRef.current = new Network(
            containerRef.current,
            { nodes, edges },
            options
          );
        } else {
          networkRef.current.setData({ nodes, edges });
        }

        // recentrage
        networkRef.current.fit({ animation: false });
      });
  };

  // Fonction d'export PDF
  const exportPdf = () => {
    if (!containerRef.current || !networkRef.current) return;

    const progIdNum = parseInt(programmeId, 10);
    const etuIdNum = parseInt(etudiantId, 10);

    const progObj = programmes.find((p) => p.id === progIdNum);
    const progName = progObj ? progObj.nom_programme : "Programme inconnu";

    const etuObj = etudiants.find((e) => e.id === etuIdNum);
    const etuName = etuObj
      ? `${etuObj.prenom_etudiant} ${etuObj.nom_etudiant}`
      : "Étudiant inconnu";

    const HEADER_HEIGHT = 200;

    html2canvas(containerRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const LEGEND_HEIGHT = 200;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height + HEADER_HEIGHT + LEGEND_HEIGHT],
      });
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(80);
      pdf.text("Graphe des préalables", pageWidth / 2, 60, { align: "center" });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(32);
      pdf.text(`Programme: ${progName}`, pageWidth / 2, 110, { align: "center" });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(32);
      pdf.text(`Étudiant: ${etuName}`, pageWidth / 2, 150, { align: "center" });

      pdf.addImage(imgData, "PNG", 0, HEADER_HEIGHT, canvas.width, canvas.height);

      // Légende
      const legendX = 40;
      const legendY = HEADER_HEIGHT + canvas.height + 20;
      const squareSize = 40;
      const textOffsetX = squareSize + 10;
      const lineSpacing = squareSize + 16;
      const legendFontSize = 32;
      const textYinSquare = (y) => y + squareSize / 2 + legendFontSize / 2 - 2;

      pdf.setFillColor(76, 175, 80);
      pdf.rect(legendX, legendY, squareSize, squareSize, "F");
      pdf.setFontSize(legendFontSize);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Cours principaux", legendX + textOffsetX, textYinSquare(legendY));

      const secondLineY = legendY + lineSpacing;
      pdf.setFillColor(244, 67, 54);
      pdf.rect(legendX, secondLineY, squareSize, squareSize, "F");
      pdf.text("Cours préalables", legendX + textOffsetX, textYinSquare(secondLineY));

      pdf.save(`graphe_préalables_${progName}_${etuName}.pdf`);
    });
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <ul>
          <li><a href="/">🏠 Accueil</a></li>
          <li><a href="/gererCours">📚 Gestion des cours</a></li>
          <li><a href="/etudiants">👤 Étudiants</a></li>
          <li className="active"><a href="/grapheCours">📚 Graphe</a></li>
          <li><a href="/outilsCheminement">⚙️ Outils de cheminement</a></li>
        </ul>
      </nav>

      <div className="content-wrapper">
        <header className="topbar">
          <button
            id="toggleSidebar"
            className="barreDeroulante"
            onClick={() => document.body.classList.toggle("collapsed")}
          >
            ☰
          </button>
          <h1>UQO</h1>
        </header>

        <main>
          <h2>Graphe des cours et préalables</h2>

          <div id="graphBox">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <label htmlFor="programme">Programme :</label>
                <select id="programme" value={programmeId} onChange={e => setProgrammeId(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {programmes.map(p => (
                    <option key={p.id} value={p.id}>{p.nom_programme}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="etudiant">Étudiant :</label>
                <select id="etudiant" value={etudiantId} onChange={e => setEtudiantId(e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {etudiants.map(e => (
                    <option key={e.id} value={e.id}>{e.nom_etudiant}</option>
                  ))}
                </select>
              </div>
              <button onClick={genererGraphe}>Générer le graphe</button>
            </div>

            {message && <div className="message">{message}</div>}

            <div
              id="graph"
              ref={containerRef}
              style={{ width: '100%', height: '600px', border: '1px solid #ccc', minHeight: '400px' }}
            />

            {networkRef.current && (
              <>
                <button onClick={exportPdf} style={{ marginTop: 12, marginRight: 8 }}>
                  📄 Exporter en PDF
                </button>
                <button
                  className="btn-lien-cheminement"
                  style={{ marginTop: 12 }}
                  onClick={() => navigate(`/outilsCheminement?etudiant=${etudiantId}&programme=${programmeId}`)}
                  disabled={!etudiantId || !programmeId}
                >
                  ➡️ Voir le cheminement
                </button>
              </>
            )}

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
