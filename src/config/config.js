// API 설정 파일
// 환경 변수에서 가져오거나 기본값 사용
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/api/users`,
  FOODS: `${API_BASE_URL}/api/foods`,
  AUTH: `${API_BASE_URL}/api/auth`,
  USER_REFS: `${API_BASE_URL}/api/userRefs`,
  RECIPES: `${API_BASE_URL}/api/recipes`,
};

// 기본 API URL (필요시 직접 사용)
export default API_BASE_URL;

