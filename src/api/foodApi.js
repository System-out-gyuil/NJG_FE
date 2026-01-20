import { API_ENDPOINTS } from '../config/config';

export const foodApi = {
  // 전체 음식 조회
  getAllFoods: async () => {
    const response = await fetch(API_ENDPOINTS.FOODS);
    if (!response.ok) {
      throw new Error('음식 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 타입별 음식 조회
  getFoodsByType: async (foodType) => {
    const response = await fetch(`${API_ENDPOINTS.FOODS}/type/${encodeURIComponent(foodType)}`);
    if (!response.ok) {
      throw new Error('음식 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 단일 음식 조회
  getFoodById: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.FOODS}/${id}`);
    if (!response.ok) {
      throw new Error('음식을 불러오는데 실패했습니다.');
    }
    return response.json();
  },

  // 음식 생성
  createFood: async (food) => {
    const response = await fetch(API_ENDPOINTS.FOODS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(food),
    });
    if (!response.ok) {
      throw new Error('음식 생성에 실패했습니다.');
    }
    return response.json();
  },

  // 음식 수정
  updateFood: async (id, food) => {
    const response = await fetch(`${API_ENDPOINTS.FOODS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(food),
    });
    if (!response.ok) {
      throw new Error('음식 수정에 실패했습니다.');
    }
    return response.json();
  },

  // 음식 삭제
  deleteFood: async (id) => {
    const response = await fetch(`${API_ENDPOINTS.FOODS}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('음식 삭제에 실패했습니다.');
    }
    return response.ok;
  },

  // 이미지 업로드
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_ENDPOINTS.FOODS}/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다.');
    }
    return response.json();
  },
};

