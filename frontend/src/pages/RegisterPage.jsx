import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice.js';
import { fetchCart } from '../features/cart/cartSlice.js';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

const inp = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });

  useEffect(() => { if (user) { dispatch(fetchCart()); navigate('/'); } }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const submit = e => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Create account</h2>
          <p className="text-gray-500 text-sm mt-1">Join thousands of happy shoppers</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[
            { k:'name',    l:'Full Name',    t:'text',     i:<FiUser/>,  p:'John Doe' },
            { k:'email',   l:'Email',        t:'email',    i:<FiMail/>,  p:'you@example.com' },
            { k:'password',l:'Password',     t:'password', i:<FiLock/>,  p:'Min 6 characters' },
            { k:'confirm', l:'Confirm Password', t:'password', i:<FiLock/>, p:'Repeat password' },
          ].map(({ k, l, t, i, p }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{i}</span>
                <input type={t} required value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className={inp} placeholder={p}/>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-gray-500">Have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}

// ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance.js';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); }
    catch (err) { import('react-hot-toast').then(m => m.default.error(err.response?.data?.message || 'Failed')); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>
        {sent ? (
          <div className="mt-6">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-gray-500 text-sm">Check your inbox for a password reset link (valid 15 min).</p>
            <button onClick={() => setSent(false)} className="mt-4 text-indigo-600 text-sm hover:underline">Try again</button>
          </div>
        ) : (
          <>
            <div className="text-5xl mt-6 mb-4">🔐</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            <form onSubmit={submit} className="text-left space-y-4">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"/>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">← Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}

// ResetPassword.jsx
import { useParams, useNavigate } from 'react-router-dom';

export function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [pw, setPw]   = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (pw !== pw2) { import('react-hot-toast').then(m => m.default.error('Passwords do not match')); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: pw });
      import('react-hot-toast').then(m => m.default.success('Password reset! Please login.'));
      navigate('/login');
    } catch (err) {
      import('react-hot-toast').then(m => m.default.error(err.response?.data?.message || 'Failed'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>
          <div className="text-5xl mt-4 mb-2">🔑</div>
          <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[['New Password', pw, setPw], ['Confirm Password', pw2, setPw2]].map(([l, v, s]) => (
            <div key={l}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input type="password" required value={v} onChange={e => s(e.target.value)} minLength={6}
                placeholder="Min 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm">
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// NotFound.jsx
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl mb-4">🔍</p>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist.</p>
      <a href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 text-sm">Go Home</a>
    </div>
  );
}

export default RegisterPage;
