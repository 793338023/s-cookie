import { HashRouter, Routes, Route } from 'react-router-dom';
import Popup from './pages/popup';
import Mock from './pages/mock';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="mock" element={<Mock />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
