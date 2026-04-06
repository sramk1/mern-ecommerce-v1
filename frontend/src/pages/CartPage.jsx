import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeCartItem, clearCart } from '../features/cart/cartSlice.js';
import { Spinner, Empty } from '../components/UI.jsx';
import { fmt } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, loading } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);

  useEffect(() => { if (user) dispatch(fetchCart()); }, [user, dispatch]);

  const upd = async (itemId, quantity) => {
    if (quantity < 1) return;
    const r = await dispatch(updateCartItem({ itemId, quantity }));
    if (updateCartItem.rejected.match(r)) toast.error(r.payload || 'Failed');
  };
  const rem = async itemId => {
    await dispatch(removeCartItem(itemId));
    toast.success('Removed');
  };
  const clr = async () => { await dispatch(clearCart()); toast.success('Cart cleared'); };

  const tax      = Math.round(totalPrice * 0.18);
  const shipping = totalPrice > 500 ? 0 : 50;
  const total    = totalPrice + tax + shipping;

  if (!user) return (
    <Empty emoji="🔒" title="Login to view your cart">
      <Link to="/login" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">Login</Link>
    </Empty>
  );
  if (loading) return <Spinner />;
  if (!items.length) return (
    <Empty emoji="🛒" title="Your cart is empty" sub="Add items to get started">
      <Link to="/products" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 inline-flex items-center gap-2">
        <FiShoppingBag size={15}/> Browse Products
      </Link>
    </Empty>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Cart <span className="text-gray-400 font-normal text-base">({totalItems} items)</span></h1>
        <button onClick={clr} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
          <FiTrash2 size={14}/> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
              <Link to={`/products/${item.product}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product}`} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 line-clamp-2">{item.name}</Link>
                <p className="text-indigo-600 font-bold mt-1">{fmt(item.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => upd(item._id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-gray-50"><FiMinus size={13}/></button>
                    <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-200">{item.quantity}</span>
                    <button onClick={() => upd(item._id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-gray-50"><FiPlus size={13}/></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{fmt(item.price * item.quantity)}</span>
                    <button onClick={() => rem(item._id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link to="/products" className="flex items-center gap-1.5 text-indigo-600 text-sm hover:gap-2.5 transition-all mt-2">
            <FiArrowLeft size={14}/> Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({totalItems})</span><span>{fmt(totalPrice)}</span></div>
              <div className="flex justify-between text-gray-600"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : <span>{fmt(shipping)}</span>}
              </div>
              {shipping > 0 && <p className="text-xs text-gray-400">Add {fmt(500 - totalPrice)} more for free shipping</p>}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
            <button onClick={() => navigate('/checkout')}
              className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm">
              Checkout →
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure SSL checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
