import React, { useState, useEffect } from 'react';
import { foodApi } from '../api/foodApi';
import API_BASE_URL from '../config/config';
import './FoodManagement.css';

const FoodManagement = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: '',
    foodImageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 음식 목록 불러오기
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await foodApi.getAllFoods();
      setFoods(data);
      console.log(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

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
      foodName: '',
      foodType: '',
      foodImageUrl: '',
    });
    setEditingFood(null);
    setImagePreview(null);
  };

  // 음식 생성
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await foodApi.createFood(formData);
      resetForm();
      fetchFoods();
    } catch (err) {
      setError(err.message);
    }
  };

  // 음식 수정 시작
  const handleEditStart = (food) => {
    setEditingFood(food.id);
    setFormData({
      foodName: food.foodName || '',
      foodType: food.foodType || '',
      foodImageUrl: food.foodImageUrl || '',
    });
    // 기존 이미지 미리보기 설정
    if (food.foodImageUrl) {
      setImagePreview(`${API_BASE_URL}${food.foodImageUrl}`);
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (file) => {
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      // 이미지 미리보기 표시
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 서버에 업로드
      const result = await foodApi.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        foodImageUrl: result.imageUrl,
      }));
    } catch (err) {
      setError(err.message);
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // 드래그 앤 드랍 이벤트 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      foodImageUrl: '',
    }));
  };

  // 음식 수정
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await foodApi.updateFood(editingFood, formData);
      resetForm();
      fetchFoods();
    } catch (err) {
      setError(err.message);
    }
  };

  // 음식 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    setError(null);
    try {
      await foodApi.deleteFood(id);
      fetchFoods();
    } catch (err) {
      setError(err.message);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  return (
    <div className="food-management">
      <h1>음식 관리 (관리자용)</h1>

      {error && <div className="error-message">{error}</div>}

      {/* 음식 생성/수정 폼 */}
      <div className="food-form">
        <h2>{editingFood ? '음식 수정' : '새 음식 추가'}</h2>
        <form onSubmit={editingFood ? handleUpdate : handleCreate}>
          <div className="form-group">
            <label>음식 이름 *</label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleInputChange}
              required
              placeholder="예: 김치찌개"
            />
          </div>
          <div className="form-group">
            <label>음식 종류</label>
            <input
              type="text"
              name="foodType"
              value={formData.foodType}
              onChange={handleInputChange}
              placeholder="예: 찌개, 볶음, 국 등"
            />
          </div>
          <div className="form-group">
            <label>음식 이미지</label>
            
            {/* 이미지 미리보기 */}
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="미리보기" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={handleRemoveImage}
                >
                  ✕ 제거
                </button>
              </div>
            )}

            {/* 드래그 앤 드랍 영역 */}
            <div
              className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadingImage ? (
                <p>업로드 중...</p>
              ) : (
                <>
                  <p>이미지를 드래그하여 놓거나 클릭하여 선택하세요</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" className="file-input-label">
                    파일 선택
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit">
              {editingFood ? '수정' : '추가'}
            </button>
            {editingFood && (
              <button type="button" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 음식 목록 */}
      <div className="food-list">
        <h2>음식 목록</h2>
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : foods.length === 0 ? (
          <div className="empty-message">등록된 음식이 없습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>음식 이름</th>
                <th>음식 종류</th>
                <th>이미지</th>
                <th>생성일</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td>{food.id}</td>
                  <td>{food.foodName || '-'}</td>
                  <td>{food.foodType || '-'}</td>
                  <td>
                    {food.foodImageUrl ? (
                      <img
                        src={`${API_BASE_URL}${food.foodImageUrl}`}
                        alt={food.foodName}
                        className="food-thumbnail"
                      />
                    ) : (
                      <span className="no-image">이미지 없음</span>
                    )}
                  </td>
                  <td>{formatDate(food.createdAt)}</td>
                  <td>{formatDate(food.updatedAt)}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditStart(food)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(food.id)}
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

export default FoodManagement;

