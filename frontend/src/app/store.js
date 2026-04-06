import { configureStore } from '@reduxjs/toolkit';
import authReducer    from '../features/auth/authSlice.js';
import cartReducer    from '../features/cart/cartSlice.js';
import productReducer from '../features/product/productSlice.js';
import orderReducer   from '../features/order/orderSlice.js';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    cart:    cartReducer,
    product: productReducer,
    order:   orderReducer,
  },
});
