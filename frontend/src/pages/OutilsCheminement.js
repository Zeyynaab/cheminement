// pages/OutilsCheminement.js
import React, { useState, useEffect } from 'react';
import './OutilsCheminement.css';

function OutilsCheminement() {
  const [etudiants, setEtudiants] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [etudiantId, setEtudiantId] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [cheminement, setCheminement] = useState([]);
  const [coursOptionnels, setCoursOptionnels] = useState([]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generer_cheminement/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_etudiant: etudiantId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur brute :", errorText);
        alert("Erreur lors de la génération du cheminement");
        return;
      }

      const data = await response.json();
      setCheminement(data.cours_par_session || []);
      setCoursOptionnels(data.cours_optionnels || []);
    } catch (error) {
      console.error("❌ Erreur fetch :", error);
      alert("Une erreur est survenue");
    }
  };

  return (
    <div className="cheminement-container">
      <h2>Générer un cheminement</h2>

      <form onSubmit={handleSubmit} className="form-cheminement">
        <label>Étudiant :</label>
        <select value={etudiantId} onChange={(e) => setEtudiantId(e.target.value)}>
          <option value="">Sélectionner...</option>
          {etudiants.map((e) => (
            <option key={e.id} value={e.id}>{e.nom_etudiant}</option>
          ))}
        </select>

        <label>Programme :</label>
        <select value={programmeId} onChange={(e) => setProgrammeId(e.target.value)}>
          <option value="">Sélectionner...</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>{p.nom_programme}</option>
          ))}
        </select>

        <button type="submit">Générer le cheminement</button>
      </form>

      {cheminement.length > 0 && (
        <div className="resultat-cheminement">
          <h3>Cheminement régulier</h3>
          <div className="tableau-sessions">
            {cheminement.map((sessionBlock, index) => (
              <div key={index} className="session-block">
                <h4>{sessionBlock.session}</h4>
                {sessionBlock.cours.length > 0 ? (
                  <ul>
                    {sessionBlock.cours.map((cours, idx) => (
                      <li key={idx} style={{ padding: '4px 8px', display: 'block' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e5b8c', marginRight: '25px' }}>
                          {cours.code_cours}
                        </span>
                        <span>{cours.nom_cours}</span>
                        {cours.prerequis && cours.prerequis.length > 0 && (
                          <span style={{ marginLeft: '10px', fontStyle: 'italic', color: 'gray' }}>
                            Préalables ( {cours.prerequis.join(' et ')} )
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: "italic", color: "#777", marginLeft: '10px' }}>
                    Aucun cours pour cette session
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {coursOptionnels.length > 0 && (
        <div className="session-block">
          <h3>Cours optionnels</h3>
          <ul>
            {coursOptionnels.map((cours, index) => (
              <li key={index} style={{ padding: '4px 8px', display: 'block' }}>
                <span style={{ fontWeight: 'bold', color: '#1e5b8c', marginRight: '25px' }}>
                  {cours.code_cours}
                </span>
                <span>{cours.nom_cours}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OutilsCheminement;
