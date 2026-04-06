import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [pw,      setPw]      = useState('');
  const [pw2,     setPw2]     = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (pw !== pw2)   { toast.error('Passwords do not match'); return; }
    if (pw.length < 6){ toast.error('Min 6 characters');       return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: pw });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired link');
    } finally { setLoading(false); }
  };

  const inpCls = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-7">
          <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>
          <div className="text-5xl mt-5 mb-3">🔑</div>
          <h2 className="text-xl font-bold text-gray-900">Set New Password</h2>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {[
            { label: 'New Password',     value: pw,  set: setPw },
            { label: 'Confirm Password', value: pw2, set: setPw2 },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="password" required minLength={6}
                  value={value} onChange={e => set(e.target.value)}
                  placeholder="Min 6 characters"
                  className={inpCls}
                />
              </div>
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm transition-colors"
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
