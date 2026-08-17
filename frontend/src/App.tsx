import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import InitialScreen from './pages/InitialScreen';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import MainScreen from './pages/MainScreen';
import MemberRegistration from './pages/MemberRegistration';
import MemberMatching from './pages/MemberMatching';
import MatchingManagement from './pages/MatchingManagement';
import MemberInquiry from './pages/MemberInquiry';
import CoupleInquiry from './pages/CoupleInquiry';
import AdminDashboard from './pages/AdminDashboard';
import ApprovalManagement from './pages/ApprovalManagement';

import { PopupProvider } from './contexts/PopupContext';

function App() {
  return (
    <PopupProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<InitialScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/reset-password" element={<ResetPasswordScreen />} />
            <Route path="/main" element={<MainScreen />} />
            <Route path="/register" element={<MemberRegistration />} />
            <Route path="/matching" element={<MemberMatching />} />
            <Route path="/manage" element={<MatchingManagement />} />
            <Route path="/members" element={<MemberInquiry />} />
            <Route path="/couples" element={<CoupleInquiry />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/approvals" element={<ApprovalManagement />} />
          </Routes>
        </div>
      </Router>
    </PopupProvider>
  );
}

export default App;
