import React, { useState, useEffect } from 'react';
import { userRefApi } from '../api/userRefApi';
import { foodApi } from '../api/foodApi';
import { useAuth } from '../context/AuthContext';
import './Refrigerator.css';

const Refrigerator = () => {
  const { user } = useAuth();
  const [userRefs, setUserRefs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    foodType: '',
    foodId: '',
    quantity: 1,
    unit: '',
    expDate: '',
  });

  // 냉장고 목록 불러오기
  const fetchUserRefs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await userRefApi.getUserRefsByUserId(user.id);
      setUserRefs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 음식 목록 불러오기
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodApi.getAllFoods();
      setFoods(data);
      
      // 고유한 foodType 추출
      const types = [...new Set(data.map(food => food.foodType).filter(Boolean))];
      setFoodTypes(types);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    if (user?.id) {
      fetchUserRefs();
    }
  }, [user]);

  // 타입 선택 시 해당 타입의 음식 목록 가져오기
  const handleTypeChange = async (e) => {
    const selectedType = e.target.value;
    setFormData({
      ...formData,
      foodType: selectedType,
      foodId: '', // 타입 변경 시 음식 선택 초기화
    });

    if (selectedType) {
      try {
        const foodsByType = await foodApi.getFoodsByType(selectedType);
        // 현재 foods 배열을 업데이트하지 않고, 타입별 음식만 사용
        // 실제로는 formData에 저장하거나 별도 state로 관리
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // 폼 입력 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      foodType: '',
      foodId: '',
      quantity: 1,
      unit: '',
      expDate: '',
    });
  };

  // 냉장고에 음식 추가
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('로그인이 필요합니다.');
      return;
    }

    setError(null);
    try {
      await userRefApi.createUserRef(
        user.id,
        formData.foodId,
        parseInt(formData.quantity),
        formData.unit,
        formData.expDate
      );
      resetForm();
      fetchUserRefs();
    } catch (err) {
      setError(err.message);
    }
  };

  // 냉장고에서 음식 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    setError(null);
    try {
      await userRefApi.deleteUserRef(id);
      fetchUserRefs();
    } catch (err) {
      setError(err.message);
    }
  };

  // 선택된 타입에 해당하는 음식 목록 필터링
  const getFoodsBySelectedType = () => {
    if (!formData.foodType) return [];
    return foods.filter(food => food.foodType === formData.foodType);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString;
  };

  return (
    <div className="refrigerator">
      <h1>냉장고</h1>

      {error && <div className="error-message">{error}</div>}

      {/* 음식 추가 폼 */}
      <div className="refrigerator-form">
        <h2>음식 추가</h2>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>음식 종류 *</label>
            <select
              name="foodType"
              value={formData.foodType}
              onChange={handleTypeChange}
              required
            >
              <option value="">선택하세요</option>
              {foodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          {formData.foodType && (
            <div className="form-group">
              <label>음식 이름 *</label>
              <select
                name="foodId"
                value={formData.foodId}
                onChange={handleInputChange}
                required
              >
                <option value="">선택하세요</option>
                {getFoodsBySelectedType().map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.foodName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>수량(용량) *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label>단위 *</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
            >
              <option value="">선택하세요</option>
              <option value="개">개</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
              <option value="봉">봉</option>
              <option value="팩">팩</option>
              <option value="병">병</option>
            </select>
          </div>

          <div className="form-group">
            <label>유통기한 *</label>
            <input
              type="date"
              name="expDate"
              value={formData.expDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit">추가</button>
            <button type="button" onClick={resetForm}>
              초기화
            </button>
          </div>
        </form>
      </div>

      {/* 냉장고 목록 */}
      <div className="refrigerator-list">
        <h2>냉장고 목록</h2>
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : userRefs.length === 0 ? (
          <div className="empty-message">냉장고가 비어있습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>음식 종류</th>
                <th>음식 이름</th>
                <th>수량(용량)</th>
                <th>단위</th>
                <th>유통기한</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {userRefs.map((userRef) => (
                <tr key={userRef.id}>
                  <td>{userRef.id}</td>
                  <td>{userRef.food?.foodType || '-'}</td>
                  <td>{userRef.food?.foodName || '-'}</td>
                  <td>{userRef.quantity || '-'}</td>
                  <td>{userRef.unit || '-'}</td>
                  <td>{formatDate(userRef.exp_date)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(userRef.id)}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Refrigerator;

