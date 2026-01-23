import axios from 'axios';
import { API_BASE_URL } from '../config/config';

const recipeApi = {
  // 레시피 목록 조회 (유저 ID 선택적으로 전달)
  getRecipeList: async (page = 1, size = 20, userId = null) => {
    try {
      const params = { page, size };
      if (userId) {
        params.userId = userId;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/recipes`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('레시피 목록 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 상세 조회
  getRecipeDetail: async (rcpSeq) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/${rcpSeq}`);
      return response.data;
    } catch (error) {
      console.error('레시피 상세 조회 실패:', error);
      throw error;
    }
  },

  // 레시피 검색
  searchRecipes: async (name) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recipes/search`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error('레시피 검색 실패:', error);
      throw error;
    }
  }
};

export default recipeApi;

