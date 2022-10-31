import { HashRouter, Routes, Route } from 'react-router-dom';
import Popup from './pages/popup';
import Mock from './pages/mock';
import EditJson from './pages/json';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="mock" element={<Mock />} />
        <Route path="json/*" element={<EditJson />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
