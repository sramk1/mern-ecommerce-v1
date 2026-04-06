// ── MyOrders.jsx ──────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/order/orderSlice.js';
import { Spinner, Empty } from '../components/UI.jsx';
import { fmt, date, STATUS_COLOR } from '../utils/helpers.js';

export function MyOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector(s => s.order);
  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <Spinner />;
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Orders</h1>
      {!orders.length ? (
        <Empty emoji="📦" title="No orders yet" sub="Start shopping to see your orders here">
          <Link to="/products" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">Browse Products</Link>
        </Empty>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} onClick={() => navigate(`/orders/${o._id}`)}
              className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">#{String(o._id).slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{date(o.createdAt)} · {o.orderItems.length} item(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.orderStatus]}`}>
                    {o.orderStatus}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">{fmt(o.totalPrice)}</span>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {o.orderItems.slice(0, 5).map(item => (
                  <img key={item._id} src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0"/>
                ))}
                {o.orderItems.length > 5 && <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-500 shrink-0">+{o.orderItems.length-5}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default MyOrders;
