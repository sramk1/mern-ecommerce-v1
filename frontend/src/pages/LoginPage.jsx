// LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../features/auth/authSlice.js';
import { fetchCart } from '../features/cart/cartSlice.js';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Card = ({ title, sub, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
      <div className="text-center mb-8">
        <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>
        <h2 className="text-xl font-bold text-gray-900 mt-4">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{sub}</p>
      </div>
      {children}
    </div>
  </div>
);

const inp = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm]   = useState({ email:'', password:'' });
  const [show, setShow]   = useState(false);

  useEffect(() => { if (user) { dispatch(fetchCart()); navigate(state?.from?.pathname || '/'); } }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const submit = e => { e.preventDefault(); dispatch(loginUser(form)); };

  return (
    <Card title="Welcome back" sub="Sign in to your account">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inp} placeholder="you@example.com"/>
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input type={show?'text':'password'} required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inp+' pr-10'} placeholder="Password"/>
            <button type="button" onClick={() => setShow(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm transition-colors">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-gray-500">No account? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Sign up</Link></p>
        <div className="bg-indigo-50 rounded-xl p-3 text-xs text-indigo-700 text-center">
          Demo → <strong>admin@demo.com</strong> / admin123 &nbsp;|&nbsp; <strong>user@demo.com</strong> / user123
        </div>
      </form>
    </Card>
  );
}
