import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recipeApi from '../api/recipeApi';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { rcpSeq } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipeDetail();
  }, [rcpSeq]);

  const fetchRecipeDetail = async () => {
    try {
      setLoading(true);
      const data = await recipeApi.getRecipeDetail(rcpSeq);
      setRecipe(data);
      setError(null);
    } catch (err) {
      setError('레시피 상세 정보를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 조리 순서를 배열로 변환
  const getManualSteps = () => {
    if (!recipe) return [];
    
    const steps = [];
    for (let i = 1; i <= 20; i++) {
      const paddedNum = String(i).padStart(2, '0');
      const manual = recipe[`manual${paddedNum}`];
      const manualImg = recipe[`manualImg${paddedNum}`];
      
      if (manual && manual.trim()) {
        steps.push({
          step: i,
          description: manual,
          image: manualImg
        });
      }
    }
    return steps;
  };

  if (loading) {
    return <div className="recipe-detail-loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="recipe-detail-error">
        <p>{error}</p>
        <button onClick={() => navigate('/recipes')}>목록으로 돌아가기</button>
      </div>
    );
  }

  if (!recipe) {
    return <div className="recipe-detail-error">레시피를 찾을 수 없습니다.</div>;
  }

  const manualSteps = getManualSteps();

  return (
    <div className="recipe-detail-container">
      <button className="back-button" onClick={() => navigate('/recipes')}>
        ← 목록으로
      </button>

      <div className="recipe-detail-header">
        <div className="recipe-detail-image-container">
          {recipe.attFileNoMk ? (
            <img 
              src={recipe.attFileNoMk} 
              alt={recipe.rcpNm}
              className="recipe-detail-image"
              onError={(e) => {
                e.target.src = recipe.attFileNoMain || '/placeholder-recipe.png';
              }}
            />
          ) : (
            <div className="recipe-detail-no-image">이미지 없음</div>
          )}
        </div>

        <div className="recipe-detail-info">
          <h1 className="recipe-detail-title">{recipe.rcpNm}</h1>
          
          <div className="recipe-tags">
            <span className="recipe-tag category">{recipe.rcpPat2}</span>
            <span className="recipe-tag method">{recipe.rcpWay2}</span>
          </div>

          {recipe.hashTag && (
            <div className="recipe-hashtags">
              {recipe.hashTag}
            </div>
          )}

          <div className="recipe-nutrition">
            <h3>영양 정보 (1인분 {recipe.infoWgt})</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-label">열량</span>
                <span className="nutrition-value">{recipe.infoEng} kcal</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">탄수화물</span>
                <span className="nutrition-value">{recipe.infoCar} g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">단백질</span>
                <span className="nutrition-value">{recipe.infoPro} g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">지방</span>
                <span className="nutrition-value">{recipe.infoFat} g</span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">나트륨</span>
                <span className="nutrition-value">{recipe.infoNa} mg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recipe-ingredients">
        <h2>재료</h2>
        <p className="ingredients-text">{recipe.rcpPartsDtls}</p>
      </div>

      {recipe.rcpNaTip && (
        <div className="recipe-tip">
          <h3>💡 저감 조리법 TIP</h3>
          <p>{recipe.rcpNaTip}</p>
        </div>
      )}

      <div className="recipe-instructions">
        <h2>조리 순서</h2>
        <div className="manual-steps">
          {manualSteps.map((step) => (
            <div key={step.step} className="manual-step">
              <div className="step-number">{step.step}</div>
              <div className="step-content">
                {step.image && step.image.trim() && (
                  <div className="step-image-container">
                    <img 
                      src={step.image} 
                      alt={`조리 순서 ${step.step}`}
                      className="step-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;

