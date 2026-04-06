// OrderDetail.jsx
import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../features/order/orderSlice.js';
import { Spinner } from '../components/UI.jsx';
import { fmt, date, STATUS_COLOR } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import { FiPackage, FiClock, FiTruck, FiCheck } from 'react-icons/fi';

export default function OrderDetail() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading } = useSelector(s => s.order);
  const isSuccess = sp.get('success') === 'true';

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    const r = await dispatch(cancelOrder(id));
    if (cancelOrder.fulfilled.match(r)) toast.success('Order cancelled');
    else toast.error(r.payload || 'Cannot cancel');
  };

  if (loading || !order) return <Spinner />;

  const TRACK = ['pending','processing','shipped','delivered'];
  const step  = TRACK.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === 'cancelled';

  const ICONS = [<FiPackage size={15}/>, <FiClock size={15}/>, <FiTruck size={15}/>, <FiCheck size={15}/>];
  const LABELS = ['Placed','Processing','Shipped','Delivered'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0"><FiCheck size={18}/></div>
          <div>
            <p className="font-bold text-emerald-800">Order placed successfully! 🎉</p>
            <p className="text-sm text-emerald-700">Confirmation email sent to your inbox.</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{String(order._id).slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Placed {date(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[order.orderStatus]}`}>
            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
          </span>
          {['pending','processing'].includes(order.orderStatus) && (
            <button onClick={handleCancel} className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-full hover:bg-red-50">
              Cancel
            </button>
          )}
        </div>
      </div>

      {!cancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center">
            {TRACK.map((_, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${i <= step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {ICONS[i]}
                  </div>
                  <p className={`text-[11px] mt-1 ${i <= step ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{LABELS[i]}</p>
                </div>
                {i < 3 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Items</h2>
          <div className="space-y-4">
            {order.orderItems.map(item => (
              <div key={item._id} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50"/>
                <div className="flex-1">
                  <Link to={`/products/${item.product}`} className="text-sm font-medium text-gray-800 hover:text-indigo-600">{item.name}</Link>
                  <p className="text-xs text-gray-500 mt-0.5">×{item.quantity} · {fmt(item.price)}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Items</span><span>{fmt(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST</span><span>{fmt(order.taxPrice)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span>{order.shippingPrice === 0 ? <span className="text-emerald-600">Free</span> : <span>{fmt(order.shippingPrice)}</span>}</div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{fmt(order.totalPrice)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
            <p className="font-bold text-gray-900 mb-3">Shipping</p>
            <p className="font-medium text-gray-700">{order.shippingAddress.fullName}</p>
            <p className="text-gray-500">{order.shippingAddress.phone}</p>
            <p className="text-gray-500 mt-1">{order.shippingAddress.line1}, {order.shippingAddress.city}</p>
            <p className="text-gray-500">{order.shippingAddress.state} {order.shippingAddress.pincode}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm">
            <p className="font-bold text-gray-900 mb-3">Payment</p>
            <div className="flex justify-between mb-1"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <span className={`font-medium ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.isPaid ? `Paid ${date(order.paidAt)}` : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
