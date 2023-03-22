import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
const Popup = lazy(() => import('./pages/popup'));
const Mock = lazy(() => import('./pages/mock'));
const EditMock = lazy(() => import('./pages/json'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Popup />} />
          <Route path="mock" element={<Mock />} />
          <Route path="edit" element={<EditMock />} />
        </Routes>
      </HashRouter>
    </Suspense>
  );
}

export default App;
