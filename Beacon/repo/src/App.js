import './App.css';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MagicLinkSignIn from './auth/MagicLinkSignin';
import SignUp from './auth/SignUp';
import SignIn from './auth/SignIn';
import RecoverAccount from './auth/RecoverAccount';
import Main from './components/mainpage/Main';
import SettingsPage from './pages/SettingsPage';
import DeploymentsPage from './pages/DeploymentsPage';
import ViewDataPage from './pages/ViewDataPage';
import CreateDataPage from './pages/CreateDataPage';
import DataUnionsPage from './pages/DataUnionsPage';
import DocumentationPage from './pages/DocumentationPage';
import HomePage from './pages/HomePage';
import TwitterControl from './pages/TwitterControl';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MagicLinkSignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/Recover" element={<RecoverAccount />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<Main />}>
            <Route index element={<HomePage />} />
            <Route path="deployments" element={<DeploymentsPage />} />
            <Route path="view-data" element={<ViewDataPage />} />
            <Route path="create-data" element={<CreateDataPage />} />
            <Route path="data-unions" element={<DataUnionsPage />} />
            <Route path="documentation" element={<DocumentationPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="twitter-control" element={<TwitterControl />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;