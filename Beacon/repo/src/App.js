import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MagicLinkSignIn from './auth/MagicLinkSignin';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MagicLinkSignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
