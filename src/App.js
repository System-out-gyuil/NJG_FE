import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserManagement from './components/UserManagement';
import FoodManagement from './components/FoodManagement';
import Refrigerator from './components/Refrigerator';
import Login from './components/Login';
import './App.css';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('refrigerator');
  const { isAuthenticated, logout, user, loading } = useAuth();

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

  return (
    <div className="App">
      <nav className="main-nav">
        <div className="nav-left">
          <button
            className={activeTab === 'refrigerator' ? 'active' : ''}
            onClick={() => setActiveTab('refrigerator')}
          >
            냉장고
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            유저 관리
          </button>
          <button
            className={activeTab === 'foods' ? 'active' : ''}
            onClick={() => setActiveTab('foods')}
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
      {activeTab === 'refrigerator' && <Refrigerator />}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'foods' && <FoodManagement />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
