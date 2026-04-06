import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';

export const placeOrder = createAsyncThunk('order/place', async (data, { rejectWithValue }) => {
  try { const r = await api.post('/orders', data); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchMyOrders = createAsyncThunk('order/mine', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/orders/my'); return r.data.orders; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchOrder = createAsyncThunk('order/one', async (id, { rejectWithValue }) => {
  try { const r = await api.get(`/orders/${id}`); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const cancelOrder = createAsyncThunk('order/cancel', async (id, { rejectWithValue }) => {
  try { const r = await api.put(`/orders/${id}/cancel`); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchAllOrders = createAsyncThunk('order/all', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/admin/orders'); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateStatus = createAsyncThunk('order/status', async ({ id, data }, { rejectWithValue }) => {
  try { const r = await api.put(`/admin/orders/${id}`, data); return r.data.order; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const patchOrder = (s, a) => {
  const o = a.payload;
  const i = s.orders.findIndex(x => x._id === o._id);
  if (i !== -1) s.orders[i] = o;
  if (s.order?._id === o._id) s.order = o;
};

const orderSlice = createSlice({
  name: 'order',
  initialState: { orders: [], order: null, totalSales: 0, loading: false, error: null },
  reducers: { clearOrder: s => { s.order = null; s.error = null; } },
  extraReducers: b => {
    b
      .addCase(placeOrder.pending,   s => { s.loading = true; s.error = null; })
      .addCase(placeOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(placeOrder.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchMyOrders.pending,   s => { s.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (s, a) => { s.loading = false; s.orders = a.payload; })
      .addCase(fetchMyOrders.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchOrder.pending,   s => { s.loading = true; })
      .addCase(fetchOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(fetchOrder.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(cancelOrder.fulfilled, patchOrder)

      .addCase(fetchAllOrders.fulfilled, (s, a) => { s.orders = a.payload.orders; s.totalSales = a.payload.totalSales; })
      .addCase(updateStatus.fulfilled,   patchOrder);
  },
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
