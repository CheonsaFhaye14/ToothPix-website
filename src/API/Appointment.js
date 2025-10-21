import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  const token = localStorage.getItem('jwt_token');
  const adminId = localStorage.getItem('adminId');

  // Fetch all dentists
    const fetchDentists = useCallback(async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/app/dentists`);
        setDentists(data.dentists || []);
      } catch (err) {
        console.error('Error fetching dentists:', err);
      }
    }, []);

  // Fetch all services
    const fetchServices = useCallback(async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/website/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    }, [token]);

  // Fetch all patients
    const fetchPatients = useCallback(async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/app/patients`);
        setPatients(data.patients || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    }, []);

  // Fetch all upcoming appointments
    const fetchAppointments = useCallback(async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`${BASE_URL}/api/website/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const now = Date.now();
        const upcomingAppointments = data.appointments.filter(
          (appt) => new Date(appt.date).getTime() > now
        );
  
        setAppointments(upcomingAppointments);
        return upcomingAppointments;
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  // Add new appointment
  const addAppointment = async (newAppointment) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/api/website/appointments`, newAppointment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) => [...prev, data.appointment]);
    } catch (err) {
      console.error('Error adding appointment:', err);
    }
  };

  // Update appointment
  const updateAppointment = async (id, updatedAppointment) => {
    try {
      const { data } = await axios.put(`${BASE_URL}/api/website/appointments/${id}`, updatedAppointment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments((prev) =>
        prev.map((appt) => (appt.idappointment === id ? data.appointment : appt))
      );
      setIsEditing(false);
      setEditFormData(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
    }
  };

  // Delete appointment
  const deleteAppointment = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/website/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { adminId },
      });
      setAppointments((prev) => prev.filter((appt) => appt.idappointment !== id));
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  // Fetch services for editing an appointment
  const fetchAppointmentForEdit = async (appointment) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/appointment-services/${appointment.idappointment}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const serviceNames = data.services?.map((s) => s.name) || [];
      const serviceIds = data.services?.map((s) => s.idservice) || [];

      const dateObj = new Date(appointment.date);
      const dateOnly = dateObj.toISOString().split('T')[0];

      let hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;

      setEditFormData({
        id: appointment.idappointment,
        patient: appointment.patientFullname || appointment.patient_name || '',
        dentist: appointment.dentistFullname,
        date: dateOnly,
        time: timeFormatted,
        service: serviceNames,
        serviceIds,
        serviceInput: '',
        status: appointment.status || 'pending',
        notes: appointment.notes || '',
      });
      setIsEditing(true);
    } catch (err) {
      console.error('Error fetching services for editing:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchDentists();
    fetchServices();
    fetchPatients();
    fetchAppointments();
  }, [fetchDentists, fetchServices, fetchPatients, fetchAppointments]);

  return {
    appointments,
    patients,
    dentists,
    services,
    isLoading,
    isEditing,
    editFormData,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    fetchAppointmentForEdit,
  };
}
