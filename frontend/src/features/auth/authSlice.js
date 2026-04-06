import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';

const saved = localStorage.getItem('user');
const initialUser = saved ? JSON.parse(saved) : null;

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/auth/register', data); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/auth/login', data); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout').catch(() => {});
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/auth/profile'); return r.data.user; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const r = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return r.data.user;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const persist = (user) => { localStorage.setItem('user', JSON.stringify(user)); return user; };
const clear   = ()     => { localStorage.removeItem('user'); };

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: initialUser, accessToken: null, loading: false, error: null },
  reducers: {
    setToken:   (s, a) => { s.accessToken = a.payload; },
    logout:     (s)    => { s.user = null; s.accessToken = null; clear(); },
    clearError: (s)    => { s.error = null; },
  },
  extraReducers: b => {
    const pending  = s => { s.loading = true;  s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };

    b
      .addCase(registerUser.pending,  pending)
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false; s.user = persist(a.payload.user); s.accessToken = a.payload.accessToken;
      })
      .addCase(registerUser.rejected, rejected)

      .addCase(loginUser.pending,  pending)
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.user = persist(a.payload.user); s.accessToken = a.payload.accessToken;
      })
      .addCase(loginUser.rejected, rejected)

      .addCase(logoutUser.fulfilled, s => { s.user = null; s.accessToken = null; clear(); })

      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = persist(a.payload); })

      .addCase(updateProfile.pending,  pending)
      .addCase(updateProfile.fulfilled, (s, a) => { s.loading = false; s.user = persist(a.payload); })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { setToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
