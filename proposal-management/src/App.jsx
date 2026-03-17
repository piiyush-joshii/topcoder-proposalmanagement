import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProposalProvider } from './context/ProposalContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProposalsList from './pages/ProposalsList';
import CreateProposal from './pages/CreateProposal';
import ProposalDetail from './pages/ProposalDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('pm_auth') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('pm_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pm_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <ProposalProvider>
        {/* Pass down logout capability to Navbar if we want a logout button later, or just strictly render */}
        <Navbar onLogout={handleLogout} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/proposals" element={<ProposalsList />} />
            <Route path="/proposals/new" element={<CreateProposal />} />
            <Route path="/proposals/:id" element={<ProposalDetail />} />
            <Route path="/proposals/:id/edit" element={<CreateProposal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </ProposalProvider>
    </BrowserRouter>
  );
}

export default App;
