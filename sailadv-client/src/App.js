import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // כאן נמצא התפריט החדש והמאוחד
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CreateAdPage from './pages/CreateAdPage';
import MyAdsPage from './pages/MyAdsPage';
import AdminActivePage from './pages/AdminActivePage';
import AdminPendingPage from './pages/AdminPendingPage';
import AdminLoginPage from './pages/AdminLoginPage';
function App() {
  return (
    <Router>
      <Navbar /> {/* התפריט היחיד שצריך להיות כאן */}
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-ad" element={<CreateAdPage />} />
        <Route path="/my-ads" element={<MyAdsPage />} />
        <Route path="/admin/active" element={<AdminActivePage />} />
        <Route path="/admin/pending" element={<AdminPendingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;