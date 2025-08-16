import './OutilsCheminement.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaProjectDiagram, FaCog, FaFilePdf } from "react-icons/fa";
import PopUp from "../components/PopUp.js";


function OutilsCheminement() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initEtu  = params.get('etudiant')   || '';
  const initProg = params.get('programme')  || '';
  const [etudiantId,   setEtudiantId]   = useState(initEtu);
  const [programmeId,  setProgrammeId]  = useState(initProg);
  const [etudiants, setEtudiants] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [cheminement, setCheminement] = useState([]);
  const [creditsProg, setCreditsProg] = useState(0);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [popupEtudiants, setPopupEtudiants] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/etudiants/')
      .then(res => res.json())
      .then(data => setEtudiants(data))
      .catch(err => console.error("Erreur étudiants :", err));

    fetch('http://127.0.0.1:8000/api/programmes/')
      .then(res => res.json())
      .then(data => setProgrammes(data))
      .catch(err => console.error("Erreur programmes :", err));
  }, []);

  //Preselection des noms etudiants et programmes 
     useEffect(() => {
    if (etudiants.length > 0 && etudiantId) {
      const etu = etudiants.find(e => e.id === parseInt(etudiantId, 10));
      setSelectedEtudiant(etu || null);
    }
    if (programmes.length > 0 && programmeId) {
      const prog = programmes.find(p => p.id === parseInt(programmeId, 10));
      setSelectedProgramme(prog || null);
    }
  }, [etudiants, programmes, etudiantId, programmeId]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const etu = etudiants.find(x => x.id === parseInt(etudiantId));
    const prog = programmes.find(x => x.id === parseInt(programmeId));
    setSelectedEtudiant(etu || null);
    setSelectedProgramme(prog || null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/generer_cheminement/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_etudiant: etudiantId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCheminement(data.cours_par_session || []);
      setCreditsProg(data.credits_totaux || 0);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération");
    }
  };


  const exporterPDF = () => {

    //export LOGO UQO
    const logo = new Image();
    logo.src = '/UQO3.png';
    logo.onload = () => {

    const input = document.getElementById('cheminement-pdf');
    // Capture le tableau
    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgTable = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p','mm','a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = (canvas.height * W) / canvas.width;

      // Bande de header bleu
      pdf.setFillColor(180,180,180); // 0,70,122
      pdf.rect(0, 0, W, 30, 'F');

      // Logo à gauche
      pdf.addImage(logo, 'PNG', 10, 5, 20, 12);

      // Titre centré en blanc
      pdf.setTextColor(255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Cheminement régulier', W/2, 18, { align: 'center' });

      
      // Info en dessus
      pdf.setTextColor(0);
      pdf.setFontSize(12);
      // Bloc de gauche
      pdf.text(`Nom : ${selectedEtudiant?.prenom_etudiant || ''} ${selectedEtudiant?.nom_etudiant || ''}`, 10, 40);
      pdf.text(`Programme : ${selectedProgramme?.nom_programme || ''}`, 10, 48);
      // Bloc de droite
      pdf.text(`Version : ${selectedProgramme?.version || 'N/A'}`, W - 70, 40);
      pdf.text(`Crédits totaux : ${creditsProg}`, W - 70, 48);

      // Séparation
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.5);
      pdf.line(10, 52, W - 10, 52);

      // Inserer le tableau
      pdf.addImage(imgTable, 'PNG', 10, 55, W - 20, H);

      // Sauvegarde
      pdf.save('cheminement_etudiant.pdf');
    });
  };
};

  return (
    <div className="layout">
      <nav className="sidebar">
        <ul>
          <li><a href="/"><FaHome /> Accueil</a></li>
          <li><a href="/gererCours"><FaBook /> Gestion des cours</a></li>
          <li>
            <a
              href="/etudiants"
              onClick={(e) => { e.preventDefault(); setPopupEtudiants(true); }}
            >
              <FaUser />Étudiants
            </a>
          </li>
          <li><a href="/grapheCours"><FaProjectDiagram /> Graphe</a></li>
          <li className="active"><a href="/outilsCheminement"><FaCog /> Outils de cheminement</a></li>
        </ul>
      </nav>

      <div className="content-wrapper">
        <header className="topbar">
          <button
            id="toggleSidebar"
            className="barreDeroulante"
            onClick={() => document.body.classList.toggle("collapsed")}
          >☰</button>
          <h1>UQO</h1>
        </header>

        <main>
          <h2>Générer un cheminement</h2>
          <div className="cheminement-container">
            {/* Formulaire*/}
            <form onSubmit={handleSubmit} className="form-cheminement">
              <label>Étudiant :</label>
              <select
                value={etudiantId}
                onChange={e => setEtudiantId(e.target.value)}
              >
                <option value="">Sélectionner...</option>
                {etudiants.map(e => (
                  <option key={e.id} value={e.id}>{e.nom_etudiant}</option>
                ))}
              </select>

              <label>Programme :</label>
              <select
                value={programmeId}
                onChange={e => setProgrammeId(e.target.value)}
              >
                <option value="">Sélectionner...</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>{p.nom_programme}</option>
                ))}
              </select>

              <button type="submit">Générer le cheminement</button>
            </form>
            {cheminement.length > 0 && (
              <>
                <div id="cheminement-pdf" className="resultat-cheminement">
                  <div className="tableau-wrapper">
                    <table className="tableau-cheminement">
                      <thead>
                        <tr>
                          {cheminement.map((s,i) => (
                            <th key={i}>{s.session}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {cheminement.map((s,i) => (
                            <td key={i}>
                              {s.cours.length
                                ? s.cours.map((c,j) => (
                                    <div key={j}>
                                      {c.code_cours}
                                      {c.prerequis?.length > 0 && (
                                        <span className='prereq'>
                                         (Préalables : {c.prerequis.join(',')})
                                        </span>
                                      )}
                                    </div>
                                  ))
                                : <div style={{fontStyle:'italic'}}>Aucun cours</div>}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bouton export  */}
                <button onClick={exporterPDF} className="btn-export">
                  <FaFilePdf />Exporter en PDF
                </button>
              </>
            )}
          </div>
        </main>

        <footer>
          <p>UQO | Université du Québec en Outaouais, 2025. Tous droits réservés.</p>
        </footer>
        <PopUp
          open={popupEtudiants}
          titre="Fonctionnalité en développement"
          message="La section « Étudiants » n’est pas encore disponible."
          onFermer={() => setPopupEtudiants(false)}
        />

      </div>
    </div>
  );
}

export default OutilsCheminement;
