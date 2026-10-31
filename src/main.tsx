import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameProvider } from './context/GameContext';
import AppContent from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameProvider>
      <AppContent />
    </GameProvider>
  </React.StrictMode>
);
