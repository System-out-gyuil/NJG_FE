import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
  });

  // 유저 목록 불러오기
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
      name: '',
      email: '',
      phone_number: '',
      password: '',
    });
    setEditingUser(null);
  };

  // 유저 생성
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await userApi.createUser(formData);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // 유저 수정 시작
  const handleEditStart = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || '',
      password: '', // 수정 시 비밀번호는 비워둠
    });
  };

  // 유저 수정
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await userApi.updateUser(editingUser, formData);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // 유저 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }
    setError(null);
    try {
      await userApi.deleteUser(id);
      fetchUsers();
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
    <div className="user-management">
      <h1>유저 관리</h1>

      {error && <div className="error-message">{error}</div>}

      {/* 유저 생성/수정 폼 */}
      <div className="user-form">
        <h2>{editingUser ? '유저 수정' : '새 유저 추가'}</h2>
        <form onSubmit={editingUser ? handleUpdate : handleCreate}>
          <div className="form-group">
            <label>이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>이메일 *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={!!editingUser}
            />
          </div>
          <div className="form-group">
            <label>전화번호</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
            />
          </div>
          {!editingUser && (
            <div className="form-group">
              <label>비밀번호 *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="비밀번호를 입력하세요"
              />
            </div>
          )}
          <div className="form-actions">
            <button type="submit">
              {editingUser ? '수정' : '추가'}
            </button>
            {editingUser && (
              <button type="button" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 유저 목록 */}
      <div className="user-list">
        <h2>유저 목록</h2>
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : users.length === 0 ? (
          <div className="empty-message">등록된 유저가 없습니다.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th>생성일</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone_number || '-'}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditStart(user)}
                    >
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
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

export default UserManagement;

