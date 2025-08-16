import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GererCours from './pages/GererCours';
import Accueil from './pages/Accueil';
import OutilsCheminement from './pages/OutilsCheminement';
import GrapheCours from './pages/GrapheCours'; 
import '@fortawesome/fontawesome-free/css/all.min.css'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Accueil/>}/>
        <Route path="/gererCours" element={<GererCours />} />
        <Route path="/outilsCheminement" element={<OutilsCheminement />} />
        <Route path="/grapheCours" element={<GrapheCours />} />
        

      </Routes>
    </Router>
  );

}


export default App;
