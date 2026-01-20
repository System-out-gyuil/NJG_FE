import { API_ENDPOINTS } from '../config/config';

export const userApi = {
  // 전체 유저 조회
  getAllUsers: async () => {
    const response = await fetch(API_ENDPOINTS.USERS);
    if (!response.ok) {
      throw new Error('유저 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 단일 유저 조회
  getUserById: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`);
    if (!response.ok) {
      throw new Error('유저를 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 유저 생성
  createUser: async (user) => {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('유저 생성에 실패했습니다.');
    }
    return response.json();
  },

  // 유저 수정
  updateUser: async (id, user) => {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error('유저 수정에 실패했습니다.');
    }
    return response.json();
  },

  // 유저 삭제
  deleteUser: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.USERS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('유저 삭제에 실패했습니다.');
    }
    return response.ok;
  },
};

