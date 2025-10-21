import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('jwt_token');

  // Fetch all services
  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/api/website/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Add a new service
  const addService = async (newService, showTemporaryModal, resetForm) => {
    try {
      const res = await axios.post(`${BASE_URL}/api/website/services`, newService, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        setServices((prev) => [...prev, res.data.service]);
        showTemporaryModal('Service added successfully.', 'success');
        setIsAdding(false);
        resetForm(); // Clear the form fields
      }
    } catch (err) {
      console.error('Error adding service:', err);
      showTemporaryModal(err.response?.data?.message || 'Error adding service.', 'error');
    }
  };

  // Update an existing service
  const updateService = async (updatedService, showTemporaryModal) => {
    if (!editingService) return;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/website/services/${editingService.idservice}`,
        updatedService,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        setServices((prev) =>
          prev.map((service) =>
            service.idservice === editingService.idservice
              ? { ...service, ...updatedService }
              : service
          )
        );
        showTemporaryModal('Service updated successfully.', 'success');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      showTemporaryModal(err.response?.data?.message || 'Error updating service.', 'error');
    } finally {
      setIsEditing(false);
      setEditingService(null);
    }
  };

  // Delete a service
  const deleteService = async (id, showTemporaryModal) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/website/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 204) {
        setServices((prev) => prev.filter((s) => s.idservice !== id));
        showTemporaryModal('Service deleted successfully.', 'success');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      showTemporaryModal(err.response?.data?.message || 'Error deleting service.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    isLoading,
    isAdding,
    isEditing,
    editingService,
    confirmDeleteId,
    error,
    setIsAdding,
    setIsEditing,
    setEditingService,
    setConfirmDeleteId,
    fetchServices,
    addService,
    updateService,
    deleteService,
  };
}
