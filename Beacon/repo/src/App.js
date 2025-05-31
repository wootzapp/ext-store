import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MagicLinkSignIn from './auth/MagicLinkSignin';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';
import RecoverAccount from './auth/RecoverAccount';
import Dashboard from './components/Dashboard';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MagicLinkSignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/Recover" element={<RecoverAccount />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
