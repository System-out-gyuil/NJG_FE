import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import recipeApi from '../api/recipeApi';
import './RecipeList.css';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, [page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      // 로그인한 유저의 ID를 전달하여 냉장고 재료 기반 정렬
      const userId = user?.id || null;
      const data = await recipeApi.getRecipeList(page, 20, userId);
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError('레시피 목록을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      fetchRecipes();
      return;
    }

    try {
      setLoading(true);
      const data = await recipeApi.searchRecipes(searchKeyword);
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError('레시피 검색에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (rcpSeq) => {
    navigate(`/recipes/${rcpSeq}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0) {
      setPage(newPage);
    }
  };

  if (loading) {
    return <div className="recipe-loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="recipe-error">{error}</div>;
  }

  return (
    <div className="recipe-list-container">
      <div className="recipe-header">
        <h1>레시피 목록</h1>
        
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="레시피 이름으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">검색</button>
          <button 
            type="button" 
            onClick={() => {
              setSearchKeyword('');
              fetchRecipes();
            }}
            className="reset-button"
          >
            초기화
          </button>
        </form>
      </div>

      <div className="recipe-grid">
        {recipes && recipes.length > 0 ? (
          recipes.map((recipe, index) => (
            <div 
              key={recipe.rcpSeq || recipe.id || index} 
              className="recipe-card"
              onClick={() => handleRecipeClick(recipe.rcpSeq)}
            >
              <div className="recipe-image-container">
                {recipe.attFileNoMain ? (
                  <img 
                    src={recipe.attFileNoMain} 
                    alt={recipe.rcpNm}
                    className="recipe-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-recipe.png';
                    }}
                  />
                ) : (
                  <div className="recipe-no-image">이미지 없음</div>
                )}
              </div>
              
              <div className="recipe-info">
                <h3 className="recipe-title">{recipe.rcpNm}</h3>
                <div className="recipe-meta">
                  <span className="recipe-category">{recipe.rcpPat2}</span>
                  <span className="recipe-method">{recipe.rcpWay2}</span>
                </div>
                <div className="recipe-calories">
                  {recipe.infoEng && `${recipe.infoEng} kcal`}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-recipes">레시피가 없습니다.</div>
        )}
      </div>

      <div className="pagination">
        <button 
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="page-button"
        >
          이전
        </button>
        <span className="page-info">페이지 {page}</span>
        <button 
          onClick={() => handlePageChange(page + 1)}
          disabled={!recipes || recipes.length < 20}
          className="page-button"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default RecipeList;

