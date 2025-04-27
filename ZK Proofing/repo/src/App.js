import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ZKProofPage from './components/ZKProofPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/zkproof" element={<ZKProofPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
