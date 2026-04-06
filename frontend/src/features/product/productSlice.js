import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axiosInstance.js';

export const fetchProducts = createAsyncThunk('product/list', async (params, { rejectWithValue }) => {
  try { const r = await api.get('/products', { params }); return r.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchFeatured = createAsyncThunk('product/featured', async (_, { rejectWithValue }) => {
  try { const r = await api.get('/products/featured'); return r.data.products; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const fetchProduct = createAsyncThunk('product/one', async (id, { rejectWithValue }) => {
  try { const r = await api.get(`/products/${id}`); return r.data.product; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const createProduct = createAsyncThunk('product/create', async (fd, { rejectWithValue }) => {
  try { const r = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data.product; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const updateProduct = createAsyncThunk('product/update', async ({ id, fd }, { rejectWithValue }) => {
  try { const r = await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data.product; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const deleteProduct = createAsyncThunk('product/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/products/${id}`); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});
export const submitReview = createAsyncThunk('product/review', async ({ id, data }, { rejectWithValue }) => {
  try { await api.post(`/products/${id}/reviews`, data); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'product',
  initialState: { products: [], product: null, featured: [], total: 0, perPage: 12, loading: false, error: null },
  reducers: { clearProduct: s => { s.product = null; } },
  extraReducers: b => {
    b
      .addCase(fetchProducts.pending,  s => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false; s.products = a.payload.products;
        s.total = a.payload.total; s.perPage = a.payload.perPage;
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload; })

      .addCase(fetchProduct.pending,  s => { s.loading = true; s.error = null; s.product = null; })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.product = a.payload; })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(createProduct.fulfilled, (s, a) => { s.products.unshift(a.payload); })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const i = s.products.findIndex(p => p._id === a.payload._id);
        if (i !== -1) s.products[i] = a.payload;
        if (s.product?._id === a.payload._id) s.product = a.payload;
      })
      .addCase(deleteProduct.fulfilled, (s, a) => { s.products = s.products.filter(p => p._id !== a.payload); });
  },
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
