import Globe from './components/Globe';
import Donations from './components/Donations';
import ErrorBoundary from './components/ErrorBoundary';
import Tooltip from './components/Tooltip';
import './App.css';
import { useState } from 'react';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
    location: {
      lat: number;
      lon: number;
    } | null;
  };
}

function App() {
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null);
  
  return (
    <ErrorBoundary>
      <div className="App">
        <Globe setActiveRepo={setActiveRepo} />
        <Donations />
        {activeRepo && <Tooltip repo={activeRepo} onClose={() => setActiveRepo(null)} />}
      </div>
    </ErrorBoundary>
  );
}

export default App;