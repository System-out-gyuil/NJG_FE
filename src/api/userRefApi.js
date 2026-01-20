import { API_ENDPOINTS } from '../config/config';

export const userRefApi = {
  // 전체 냉장고 조회
  getAllUserRefs: async () => {
    const response = await fetch(API_ENDPOINTS.USER_REFS);
    if (!response.ok) {
      throw new Error('냉장고 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 유저별 냉장고 조회
  getUserRefsByUserId: async (userId) => {
    const response = await fetch(`${API_ENDPOINTS.USER_REFS}/user/${userId}`);
    if (!response.ok) {
      throw new Error('냉장고 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 단일 냉장고 조회
  getUserRefById: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.USER_REFS}/${id}`);
    if (!response.ok) {
      throw new Error('냉장고 정보를 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 냉장고에 음식 추가
  createUserRef: async (userId, foodId, quantity, unit, expDate) => {
    const response = await fetch(API_ENDPOINTS.USER_REFS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        foodId,
        quantity,
        unit,
        expDate,
      }),
    });
    if (!response.ok) {
      throw new Error('음식 추가에 실패했습니다.');
    }
    return response.json();
  },

  // 냉장고 수정
  updateUserRef: async (id, data) => {
    const response = await fetch(`${API_ENDPOINTS.USER_REFS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('냉장고 수정에 실패했습니다.');
    }
    return response.json();
  },

  // 냉장고에서 음식 삭제
  deleteUserRef: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.USER_REFS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('음식 삭제에 실패했습니다.');
    }
    return response.ok;
  },
};

