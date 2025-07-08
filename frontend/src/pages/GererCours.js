// GererCours.js
import './GererCours.css';
import React, { useState, useEffect } from 'react';

function GererCours() {
  // États pour le formulaire d'ajout/modification de cours
  const [cours, setCours] = useState([]);
  const [nom, setNom] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('');
  const [programme, setProgramme] = useState('');
  const [programmes, setProgrammes] = useState([]); // Liste des programmes pour le menu déroulant
  const [message, setMessage] = useState('');
  const [idModif, setIdModif] = useState(null); // Si on modifie un cours existant
  const [sessions, setSessions] = useState([]);
  const [sessionSelect, setSessionSelect] = useState('');
  const [coursSelect, setCoursSelect] = useState('');
  const [messageSession, setMessageSession] = useState('');


  // États pour les prérequis
  const [coursDisponibles, setCoursDisponibles] = useState([]);// Pour choisir le cours principal et le prérequis
  const [coursPrincipal, setCoursPrincipal] = useState('');
  const [prerequis, setPrerequis] = useState('');
  const [messagePrerequis, setMessagePrerequis] = useState('');

  // Chargement initial des programmes, cours et cours pour prérequis
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/programmes/')
      .then(res => res.json())
      .then(data => setProgrammes(data));

    fetch('http://127.0.0.1:8000/api/cours/')
      .then(res => res.json())
      .then(data => {
        setCours(data);
        setCoursDisponibles(data); //Utilisé pour les menus déroulants des prérequis
      });

      fetch('http://127.0.0.1:8000/api/sessions/')
    .then(res => res.json())
    .then(data => setSessions(data));
  }, [message, messagePrerequis, messageSession]);

  // Ajouter ou modifier un cours selon letat idModif
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      nom_cours: nom,
      code_cours: code,
      credits: parseInt(credits),
      programme: parseInt(programme),
    };

    const url = idModif ? `http://127.0.0.1:8000/api/cours/modifier/${idModif}/` : 'http://127.0.0.1:8000/api/cours/ajouter/';
    const method = idModif ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      setMessage(idModif ? 'Cours modifié' : 'Cours ajouté');
      setNom(''); setCode(''); setCredits(''); setProgramme(''); setIdModif(null);
    } else {
      setMessage('Erreur : ' + JSON.stringify(result));
    }
  };

  // Supprimer un cours
  const handleSupprimer = async (id) => {
    if (window.confirm("Supprimer ce cours ?")) {
      const response = await fetch(`http://127.0.0.1:8000/api/cours/supprimer/${id}/`, { method: 'DELETE' });
      if (response.ok) setMessage("Cours supprimé");
    }
  };

  // Préremplir le formulaire pour la modification d’un cours
  const handleModifier = (cours) => {
    setIdModif(cours.id);
    setNom(cours.nom_cours);
    setCode(cours.code_cours);
    setCredits(cours.credits);
    setProgramme(cours.programme);
  };

  // Ajouter un prérequis entre 2 cours
  const handleAjouterPrerequis = async (e) => {
    e.preventDefault();
    const data = {
      cours: parseInt(coursPrincipal),
      prerequis: parseInt(prerequis),
    };

    const response = await fetch('http://127.0.0.1:8000/api/prerequis/ajouter/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setMessagePrerequis("Prérequis ajouté avec succès");
      setCoursPrincipal('');
      setPrerequis('');
    } else {
      const result = await response.json();
      setMessagePrerequis("Erreur : " + JSON.stringify(result));
    }
  };
  //lier session et cours 
  const handleAssocierCoursSession = async (e) => {
  e.preventDefault();
  const data = {
    id_cours: parseInt(coursSelect),
    id_session: parseInt(sessionSelect),
  };

  const response = await fetch('http://127.0.0.1:8000/api/sessions/associer/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    setMessageSession('Cours associé à la session.');
    setCoursSelect('');
    setSessionSelect('');
  } else {
    const result = await response.json();
    setMessageSession('Erreur : ' + JSON.stringify(result));
  }
};


  return (
    <div style={{ padding: '20px' }}>
      {/* Formulaire pour ajouter ou modifier un cours */}
      <h2>{idModif ? 'Modifier un cours' : 'Ajouter un cours'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input type="number" placeholder="Crédits" value={credits} onChange={(e) => setCredits(e.target.value)} required />
        <select value={programme} onChange={(e) => setProgramme(e.target.value)} required>
          <option value=''>Choisir un programme</option>
          {programmes.map(p => (
            <option key={p.id} value={p.id}>{p.nom_programme}</option>
          ))}
        </select>
        <button type="submit">{idModif ? 'Modifier' : 'Ajouter'}</button>
      </form>
      <p>{message}</p>


      {/* Formulaire pour ajouter un prérequis */}
      <h2>Ajouter un prérequis</h2>
      <form onSubmit={handleAjouterPrerequis}>
        <select value={coursPrincipal} onChange={(e) => setCoursPrincipal(e.target.value)} required>
          <option value=''>Cours principal</option>
          {coursDisponibles.map(c => (
            <option key={c.id} value={c.id}>{c.nom_cours}</option>
          ))}
        </select>
        <select value={prerequis} onChange={(e) => setPrerequis(e.target.value)} required>
          <option value=''>Cours prérequis</option>
          {coursDisponibles.map(c => (
            <option key={c.id} value={c.id}>{c.nom_cours}</option>
          ))}
        </select>
        <button type="submit">Ajouter prérequis</button>
      </form>
      <p>{messagePrerequis}</p>

      {/*associer un cours a une session */}
      <h2>Associer un cours à une session</h2>
<form onSubmit={handleAssocierCoursSession}>
  <select value={coursSelect} onChange={(e) => setCoursSelect(e.target.value)} required>
    <option value="">Choisir un cours</option>
    {coursDisponibles.map(c => (
      <option key={c.id} value={c.id}>{c.nom_cours}</option>
    ))}
  </select>

  <select value={sessionSelect} onChange={(e) => setSessionSelect(e.target.value)} required>
    <option value="">Choisir une session</option>
    {sessions.map(s => (
      <option key={s.id} value={s.id}>{s.nom_session} {s.numero_session}</option>
    ))}
  </select>

  <button type="submit">Associer</button>
</form>
<p>{messageSession}</p>

      {/* Liste des cours existants avec options modifier/supprimer */}
      
      <h3>Liste des cours</h3>
      <ul>
        {cours.map(c => (
          <li key={c.id}>
            {c.nom_cours} ({c.code_cours}) - {c.credits} crédits
            <button onClick={() => handleModifier(c)}>Modifier</button>
            <button onClick={() => handleSupprimer(c.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  
);
}

export default GererCours;

