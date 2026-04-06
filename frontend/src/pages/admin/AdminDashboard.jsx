import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateStatus } from '../../features/order/orderSlice.js';
import { fetchProducts, deleteProduct } from '../../features/product/productSlice.js';
import { fmt, date, STATUS_COLOR } from '../../utils/helpers.js';
import { Spinner } from '../../components/UI.jsx';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiEdit2, FiTrash2, FiPlus, FiTrendingUp,
} from 'react-icons/fi';

const TABS = [
  { key:'dashboard', label:'Dashboard', icon:<FiGrid size={15}/> },
  { key:'products',  label:'Products',  icon:<FiShoppingBag size={15}/> },
  { key:'orders',    label:'Orders',    icon:<FiPackage size={15}/> },
  { key:'users',     label:'Users',     icon:<FiUsers size={15}/> },
];

export default function AdminDashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { orders, totalSales } = useSelector(s => s.order);
  const { products }           = useSelector(s => s.product);

  const [tab,      setTab]      = useState('dashboard');
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [loadStat, setLoadStat] = useState(false);
  const [statusMap,setStatusMap]= useState({});

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchProducts({ limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (tab === 'dashboard') {
      setLoadStat(true);
      api.get('/admin/dashboard')
        .then(r => setStats(r.data))
        .catch(() => toast.error('Failed to load stats'))
        .finally(() => setLoadStat(false));
    }
    if (tab === 'users') {
      api.get('/admin/users').then(r => setUsers(r.data.users)).catch(() => {});
    }
  }, [tab]);

  const handleDel = async id => {
    if (!confirm('Delete this product?')) return;
    const r = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(r)) toast.success('Deleted');
    else toast.error(r.payload || 'Failed');
  };

  const handleOrderStatus = async id => {
    const newStatus = statusMap[id];
    if (!newStatus) return;
    const r = await dispatch(updateStatus({ id, data: { orderStatus: newStatus } }));
    if (updateStatus.fulfilled.match(r)) { toast.success('Status updated'); setStatusMap(p => { const c={...p}; delete c[id]; return c; }); }
    else toast.error(r.payload || 'Failed');
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      setUsers(u => u.map(x => x._id === userId ? { ...x, isActive: !isActive } : x));
      toast.success('User updated');
    } catch { toast.error('Failed'); }
  };

  const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );

  const Th = ({ children, cls = '' }) => (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${cls}`}>{children}</th>
  );
  const Td = ({ children, cls = '' }) => (
    <td className={`px-4 py-3 text-sm ${cls}`}>{children}</td>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <button onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
          <FiPlus size={15}/> New Product
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-7">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${tab === t.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard ── */}
      {tab === 'dashboard' && (
        loadStat ? <Spinner /> : stats && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <StatCard icon={<FiTrendingUp size={18} className="text-emerald-600"/>} label="Revenue"       value={fmt(stats.stats.totalRevenue)} color="bg-emerald-50"/>
              <StatCard icon={<FiPackage    size={18} className="text-blue-600"/>}    label="Orders"        value={stats.stats.totalOrders}       color="bg-blue-50"/>
              <StatCard icon={<FiShoppingBag size={18} className="text-violet-600"/>} label="Products"      value={stats.stats.totalProducts}     color="bg-violet-50"/>
              <StatCard icon={<FiUsers      size={18} className="text-orange-600"/>}  label="Users"         value={stats.stats.totalUsers}        color="bg-orange-50"/>
              <StatCard icon={<FiPackage    size={18} className="text-red-500"/>}     label="Pending Orders" value={stats.stats.pending}          color="bg-red-50"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Selling Products</h3>
                {stats.topProducts.length === 0
                  ? <p className="text-sm text-gray-400">No data yet</p>
                  : <div className="space-y-3">
                      {stats.topProducts.map((p, i) => (
                        <div key={p._id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center justify-center">{i+1}</span>
                            <span className="text-gray-700 font-medium">{p.name}</span>
                          </div>
                          <span className="text-gray-500 font-medium">{p.totalSold} sold</span>
                        </div>
                      ))}
                    </div>
                }
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Sales — Last 7 Days</h3>
                {stats.recentSales.length === 0
                  ? <p className="text-sm text-gray-400">No sales yet</p>
                  : <div className="space-y-2.5">
                      {stats.recentSales.map(s => (
                        <div key={s._id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{s._id}</span>
                          <div className="flex gap-5">
                            <span className="text-gray-600">{s.count} orders</span>
                            <span className="font-semibold text-emerald-600">{fmt(s.sales)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </div>
            </div>
          </div>
        )
      )}

      {/* ── Products ── */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"/>
                        <div>
                          <p className="font-medium text-gray-800 max-w-[180px] truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand}</p>
                        </div>
                      </div>
                    </Td>
                    <Td cls="text-gray-600">{p.category}</Td>
                    <Td cls="font-semibold text-gray-900">{fmt(p.discountPrice || p.price)}</Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                        p.stock > 0  ? 'bg-amber-50 text-amber-700' :
                                       'bg-red-50 text-red-700'
                      }`}>
                        {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><FiEdit2 size={14}/></button>
                        <button onClick={() => handleDel(p._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><FiTrash2 size={14}/></button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{orders.length} orders</p>
            <p className="text-sm font-semibold text-emerald-600">Revenue: {fmt(totalSales)}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Total</Th><Th>Payment</Th><Th>Status</Th><Th>Update</Th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <Td cls="font-mono text-xs text-indigo-600 font-semibold">#{String(o._id).slice(-8).toUpperCase()}</Td>
                    <Td cls="text-gray-700">{o.user?.name || '—'}</Td>
                    <Td cls="text-gray-500">{date(o.createdAt)}</Td>
                    <Td cls="font-semibold text-gray-900">{fmt(o.totalPrice)}</Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${o.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {o.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[o.orderStatus]}`}>
                        {o.orderStatus}
                      </span>
                    </Td>
                    <Td>
                      {!['delivered','cancelled'].includes(o.orderStatus) && (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={statusMap[o._id] || o.orderStatus}
                            onChange={e => setStatusMap(p => ({ ...p, [o._id]: e.target.value }))}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-400 bg-white"
                          >
                            {['pending','processing','shipped','delivered','cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button onClick={() => handleOrderStatus(o._id)}
                            className="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                            Save
                          </button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Status</Th><Th>Action</Th></tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                      </div>
                    </Td>
                    <Td cls="text-gray-500">{u.email}</Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </Td>
                    <Td cls="text-gray-500">{date(u.createdAt)}</Td>
                    <Td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Banned'}
                      </span>
                    </Td>
                    <Td>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u._id, u.isActive)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive ? 'Ban' : 'Unban'}
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
