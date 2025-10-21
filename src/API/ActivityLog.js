// src/api/activityLogs.js
import axios from 'axios';
import { BASE_URL } from '../config';

export const getActivityLogs = (token) => {
  return axios.get(`${BASE_URL}/api/website/activity_logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteActivityLog = (logId, token) => {
  return axios.delete(`${BASE_URL}/api/website/activity_logs/${logId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const undoActivityLog = (logId, adminId, token) => {
  return axios.post(
    `${BASE_URL}/api/website/activity_logs/undo/${logId}`,
    { admin_id: adminId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
