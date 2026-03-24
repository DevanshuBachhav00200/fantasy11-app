import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// Matches
export const getMatches = (status) => api.get('/matches', { params: { status } });
export const getMatch = (id) => api.get(`/matches/${id}`);
export const getMatchPlayers = (id) => api.get(`/matches/${id}/players`);

// Players
export const getPlayers = (filters) => api.get('/players', { params: filters });
export const getPlayer = (id) => api.get(`/players/${id}`);

// Fantasy Teams
export const createTeam = (data) => api.post('/teams', data);
export const getMyTeams = () => api.get('/teams/my');
export const getMyTeamForMatch = (matchId) => api.get(`/teams/match/${matchId}`);

// Leaderboard
export const getLeaderboard = (matchId, page = 1) => api.get(`/leaderboard/${matchId}`, { params: { page } });
export const getMyRank = (matchId) => api.get(`/leaderboard/${matchId}/my-rank`);
export const getGlobalLeaderboard = () => api.get('/leaderboard/global/top');

// Admin
export const adminCreateMatch = (data) => api.post('/admin/matches', data);
export const adminCreatePlayer = (data) => api.post('/admin/players', data);
export const adminGetStats = () => api.get('/admin/stats');
export const startMatch = (matchId) => api.post(`/simulation/start/${matchId}`);
export const completeMatch = (matchId) => api.post(`/simulation/complete/${matchId}`);
export const sendLiveUpdate = (matchId, data) => api.post(`/simulation/live-update/${matchId}`, data);

export default api;
