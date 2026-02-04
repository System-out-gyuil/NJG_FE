import React, { useState, useEffect } from 'react';
import { userRefApi } from '../api/userRefApi';
import { foodApi } from '../api/foodApi';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config';
import './Refrigerator.css';

const Refrigerator = () => {
  const { user } = useAuth();
  const [userRefs, setUserRefs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserRef, setSelectedUserRef] = useState(null);
  const [selectedTab, setSelectedTab] = useState('전체');
  
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

  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError(null);
  };

  // 상세 정보 모달 열기
  const openDetailModal = (userRef) => {
    setSelectedUserRef(userRef);
    setIsDetailModalOpen(true);
  };

  // 상세 정보 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserRef(null);
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
      closeModal();
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
      closeDetailModal();
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

  // 유통기한까지 남은 날짜 계산 (D-day 형식)
  const calculateDaysUntilExpiry = (expDateString) => {
    if (!expDateString) return '-';
    
    try {
      const expDate = new Date(expDateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);
      
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `D+${Math.abs(diffDays)}`;
      } else if (diffDays === 0) {
        return 'D-day';
      } else {
        return `D-${diffDays}`;
      }
    } catch (error) {
      return '-';
    }
  };

  // 이미지 URL 생성
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // 이미 전체 URL인 경우
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // 상대 경로인 경우 API_BASE_URL과 결합
    return `${API_BASE_URL}${imageUrl}`;
  };

  // 냉장고에 있는 재료들의 고유한 foodType 추출
  const getAvailableFoodTypes = () => {
    const types = userRefs
      .map(userRef => userRef.food?.foodType)
      .filter(Boolean)
      .filter((type, index, self) => self.indexOf(type) === index);
    return ['전체', ...types];
  };

  // 선택된 탭에 따라 필터링된 목록 반환
  const getFilteredUserRefs = () => {
    if (selectedTab === '전체') {
      return userRefs;
    }
    return userRefs.filter(userRef => userRef.food?.foodType === selectedTab);
  };

  return (
    <div className="refrigerator">
      <div className="refrigerator-header">
        <h1>냉장고</h1>
        <button className="add-button" onClick={openModal}>
          +
        </button>
      </div>

      {/* 음식 추가 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>음식 추가</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
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
        </div>
      )}

      {/* 상세 정보 모달 */}
      {isDetailModalOpen && selectedUserRef && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>상세 정보</h2>
              <button className="modal-close" onClick={closeDetailModal}>
                ×
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-image-section">
                {getImageUrl(selectedUserRef.food?.foodImageUrl) ? (
                  <img 
                    src={getImageUrl(selectedUserRef.food?.foodImageUrl)} 
                    alt={selectedUserRef.food?.foodName || '음식 이미지'} 
                    className="detail-food-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="no-image-placeholder">이미지 없음</div>
                )}
              </div>
              <div className="detail-info-section">
                {/* <div className="detail-info-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedUserRef.id}</span>
                </div> */}
                <div className="detail-info-row">
                  <span className="detail-label">음식 이름:</span>
                  <span className="detail-value">{selectedUserRef.food?.foodName || '-'}</span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">음식 종류:</span>
                  <span className="detail-value">{selectedUserRef.food?.foodType || '-'}</span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">수량(용량):</span>
                  <span className="detail-value">{selectedUserRef.quantity || '-'} {selectedUserRef.unit || '-'}</span>
                </div>
                {/* <div className="detail-info-row">
                  <span className="detail-label">단위:</span>
                  <span className="detail-value"></span>
                </div> */}
                <div className="detail-info-row">
                  <span className="detail-label">유통기한:</span>
                  <span className="detail-value">{formatDate(selectedUserRef.exp_date)} 까지</span>
                </div>
                <div className="detail-info-row">
                  <span className="detail-label">남은 기한:</span>
                  <span className={`detail-value ${calculateDaysUntilExpiry(selectedUserRef.exp_date).startsWith('D+') ? 'expired' : calculateDaysUntilExpiry(selectedUserRef.exp_date) === 'D-day' ? 'expiring-today' : ''}`}>
                    {calculateDaysUntilExpiry(selectedUserRef.exp_date)}
                  </span>
                </div>
              </div>
              <div className="detail-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(selectedUserRef.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 메뉴 */}
      {userRefs.length > 0 && (
        <div className="refrigerator-tabs">
          {getAvailableFoodTypes().map((type) => (
            <button
              key={type}
              className={`tab-button ${selectedTab === type ? 'active' : ''}`}
              onClick={() => setSelectedTab(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* 냉장고 목록 */}
      <div className="refrigerator-list">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : userRefs.length === 0 ? (
          <div className="empty-message">냉장고가 비어있습니다.</div>
        ) : getFilteredUserRefs().length === 0 ? (
          <div className="empty-message">선택한 종류의 재료가 없습니다.</div>
        ) : (
          <div className="refrigerator-cards">
            {getFilteredUserRefs().map((userRef) => {
              const imageUrl = getImageUrl(userRef.food?.foodImageUrl);
              const daysUntilExpiry = calculateDaysUntilExpiry(userRef.exp_date);
              
              return (
                <div 
                  key={userRef.id} 
                  className="refrigerator-card"
                  onClick={() => openDetailModal(userRef)}
                >
                  <div className="card-image">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={userRef.food?.foodName || '음식 이미지'} 
                        className="card-food-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="card-no-image">이미지 없음</div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-food-name">{userRef.food?.foodName || '-'}</h3>
                    <div className={`card-expiry ${daysUntilExpiry.startsWith('D+') ? 'expired' : daysUntilExpiry === 'D-day' ? 'expiring-today' : ''}`}>
                      {daysUntilExpiry}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Refrigerator;

