import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ThreePhaseCalculator from './pages/ThreePhaseCalculator';
import TwoPhaseCalculator from './pages/TwoPhaseCalculator';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/two-phase" element={<TwoPhaseCalculator />} />
        <Route path="/three-phase" element={<ThreePhaseCalculator />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
