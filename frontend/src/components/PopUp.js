import React, { useEffect } from "react";
import "./PopUp.css";

export default function PopUp({
  open,
  titre = "Information",
  message = "",
  onFermer,
  texteBouton = "OK",
  texteSecondaire,
  onSecondaire,
  fermerSiClickFond = true
}) {
  // Fermer avec Échap
  useEffect(() => {
    if (!open) return;
    const fermerAvecEchap = (e) => {
      if (e.key === "Escape") onFermer?.();
    };
    document.addEventListener("keydown", fermerAvecEchap);
    return () => document.removeEventListener("keydown", fermerAvecEchap);
  }, [open, onFermer]);

  if (!open) return null;

  const handleFond = () => {
    if (fermerSiClickFond) onFermer?.();
  };

  return (
    <div className="popup-fond" onClick={handleFond}>
      <div className="popup-contenu" onClick={(e) => e.stopPropagation()}>
        <h3 className="popup-titre">{titre}</h3>
        <p className="popup-message">{message}</p>
        <div className="popup-boutons">
          {texteSecondaire && onSecondaire && (
            <button type="button" className="btn-secondaire" onClick={onSecondaire}>
              {texteSecondaire}
            </button>
          )}
          <button type="button" onClick={onFermer}>
            {texteBouton}
          </button>
        </div>
      </div>
    </div>
  );
}
