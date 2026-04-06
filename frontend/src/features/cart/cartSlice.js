import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';

const empty = { items: [], totalPrice: 0, totalItems: 0 };

export const fetchCart      = createAsyncThunk('cart/fetch',  async (_, { rejectWithValue }) => {
  try { const r = await api.get('/cart'); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const addToCart      = createAsyncThunk('cart/add',    async (data, { rejectWithValue }) => {
  try { const r = await api.post('/cart', data); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const r = await api.put(`/cart/${itemId}`, { quantity }); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { const r = await api.delete(`/cart/${itemId}`); return r.data.cart; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const clearCart      = createAsyncThunk('cart/clear',  async (_, { rejectWithValue }) => {
  try { await api.delete('/cart'); return empty; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const setCart = (s, a) => {
  const c = a.payload || empty;
  s.items      = c.items      ?? [];
  s.totalPrice = c.totalPrice ?? 0;
  s.totalItems = c.totalItems ?? 0;
  s.loading    = false;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { ...empty, loading: false, error: null },
  reducers: { resetCart: s => { Object.assign(s, empty); } },
  extraReducers: b => {
    b
      .addCase(fetchCart.pending,      s => { s.loading = true; s.error = null; })
      .addCase(fetchCart.fulfilled,    setCart)
      .addCase(fetchCart.rejected,     (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(addToCart.fulfilled,    setCart)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(clearCart.fulfilled,    setCart);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
