import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  let token = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {}

  if (!token) {
    const local = localStorage.getItem('complyai_session');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        token = parsed?.access_token;
      } catch {}
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if explicitly 401 and not in a demo session
    if (error.response?.status === 401) {
      const local = localStorage.getItem('complyai_session');
      if (!local) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
