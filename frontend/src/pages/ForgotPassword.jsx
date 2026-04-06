import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">MyShop</Link>

        {sent ? (
          <div className="mt-6">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Sent!</h2>
            <p className="text-gray-500 text-sm mb-5">
              Check your inbox for a reset link. It expires in 15 minutes.
            </p>
            <button onClick={() => setSent(false)} className="text-indigo-600 text-sm hover:underline">
              Didn't receive it? Try again
            </button>
          </div>
        ) : (
          <>
            <div className="text-5xl mt-6 mb-3">🔐</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mb-7">Enter your email and we'll send a reset link.</p>
            <form onSubmit={submit} className="text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 text-sm transition-colors"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="mt-5 inline-block text-sm text-indigo-600 hover:underline">
              ← Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
