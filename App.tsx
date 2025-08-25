
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import POS from './pages/POS.tsx';
import Inventory from './pages/Inventory.tsx';
import SalesHistory from './pages/SalesHistory.tsx';
import Header from './components/Header.tsx';
import Database from './pages/Database.tsx';
import Settings from './pages/Settings.tsx';
import Pitch from './pages/Pitch.tsx';

// This component contains the main application layout with sidebar and header
const AppLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<SalesHistory />} />
            <Route path="/database" element={<Database />} />
            <Route path="/settings" element={<Settings />} />
            {/* Redirect any other paths inside the layout to the dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


// This is the main App component that handles top-level routing
const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/pitch" element={<Pitch />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
