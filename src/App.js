import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserManagement from './components/UserManagement';
import FoodManagement from './components/FoodManagement';
import Refrigerator from './components/Refrigerator';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import Login from './components/Login';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, logout, user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-left">
          <button
            className={isActive('/refrigerator') ? 'active' : ''}
            onClick={() => navigate('/refrigerator')}
          >
            냉장고
          </button>
          <button
            className={isActive('/recipes') ? 'active' : ''}
            onClick={() => navigate('/recipes')}
          >
            레시피
          </button>
          <button
            className={isActive('/users') ? 'active' : ''}
            onClick={() => navigate('/users')}
          >
            유저 관리
          </button>
          <button
            className={isActive('/foods') ? 'active' : ''}
            onClick={() => navigate('/foods')}
          >
            음식 관리
          </button>
        </div>
        <div className="nav-right">
          <span className="user-info">{user?.name || user?.email}님</span>
          <button className="logout-btn" onClick={logout}>
            로그아웃
          </button>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Navigate to="/refrigerator" replace />} />
        <Route path="/refrigerator" element={<Refrigerator />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/:rcpSeq" element={<RecipeDetail />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/foods" element={<FoodManagement />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
