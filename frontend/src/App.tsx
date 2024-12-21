import Globe from './components/Globe';
import Donations from './components/Donations';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  
  return (
    <ErrorBoundary>
      <div className="App">
        <Globe />
        <Donations />
      </div>
    </ErrorBoundary>
  );
}

export default App;