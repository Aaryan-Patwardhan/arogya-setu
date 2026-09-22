import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.PROD ? '' : 'http://localhost:8000');

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

export const checkHealth = async () => {
  const response = await client.get('/api/health');
  return response.data;
};

export const getHospitals = async (specialty = null, district = null) => {
  const params = {};
  if (specialty) params.specialty = specialty;
  if (district) params.district = district;
  const response = await client.get('/api/hospitals', { params });
  return response.data;
};

export const sendTriageMessage = async ({ message, language = 'en', lat = null, lon = null }) => {
  const response = await client.post('/api/chat', {
    message,
    language,
    lat,
    lon,
  });
  return response.data;
};

export default {
  checkHealth,
  getHospitals,
  sendTriageMessage,
};
