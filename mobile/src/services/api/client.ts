import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// DEV  → your Mac's local IP (phone must be on same Wi-Fi)
// PROD → Railway deployment URL (set after deploying to Railway)
const DEV_URL = 'http://10.0.0.180:3000/api';
const PROD_URL = 'https://your-app.railway.app/api'; // ← update after Railway deploy

const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { BASE_URL };
