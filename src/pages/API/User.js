import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('adminToken');

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/website/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.records || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Add a new user
  const addUser = async (newUser, showTemporaryModal, resetForm) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/website/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setUsers((prev) => [...prev, res.data.user]);
        showTemporaryModal('User added successfully.', 'success');
        setIsAdding(false);
        resetForm(); // Clear form fields
      }
    } catch (err) {
      console.error('Error adding user:', err);
      const msg = err.response?.data?.message || 'Error adding user.';
      showTemporaryModal(msg, 'error');
    }
  };

  // Update existing user
  const updateUser = async (updatedUser, showTemporaryModal) => {
    if (!editingUser) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/website/users/${editingUser.idusers}`,
        updatedUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((user) =>
            user.idusers === editingUser.idusers ? { ...user, ...updatedUser } : user
          )
        );
        showTemporaryModal('User updated successfully.', 'success');
        setIsEditing(false);
        setEditingUser(null);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Unexpected error occurred.';

      if (status === 409) showTemporaryModal(msg || 'Username or email already exists.', 'error');
      else if (status === 400) showTemporaryModal(msg || 'Missing or invalid input fields.', 'error');
      else if (status === 500) showTemporaryModal(msg || 'Internal server error occurred.', 'error');
      else showTemporaryModal(msg, 'error');
    }
  };

  // Delete a user
  const deleteUser = async (id, showTemporaryModal) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/website/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 204) {
        setUsers((prev) => prev.filter((u) => u.idusers !== id));
        showTemporaryModal('User deleted successfully.', 'success');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      const msg = err.response?.data?.message || 'Error deleting user.';
      showTemporaryModal(msg, 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    isAdding,
    isEditing,
    editingUser,
    confirmDeleteId,
    error,
    setIsAdding,
    setIsEditing,
    setEditingUser,
    setConfirmDeleteId,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
  };
}
