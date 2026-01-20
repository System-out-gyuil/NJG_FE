import { API_ENDPOINTS } from '../config/config';

export const authApi = {
  // 로그인
  login: async (email, password) => {
    const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || '로그인에 실패했습니다.');
    }
    
    return data;
  },

  // 로그아웃 (클라이언트 측에서 처리)
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },
};

