import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your local IP when testing on a physical device
const BASE_URL = __DEV__ ? 'http://10.0.0.180:3000/api' : 'https://your-production-api.com/api';

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
