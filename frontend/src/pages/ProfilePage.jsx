import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, fetchProfile } from '../features/auth/authSlice.js';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiMapPin, FiCamera, FiPlus, FiTrash2 } from 'react-icons/fi';

const inpCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors';

const TABS = [
  { key: 'info',      label: 'Profile',   icon: <FiUser size={15}/> },
  { key: 'password',  label: 'Password',  icon: <FiLock size={15}/> },
  { key: 'addresses', label: 'Addresses', icon: <FiMapPin size={15}/> },
];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.auth);

  const [tab,     setTab]     = useState('info');
  const [info,    setInfo]    = useState({ name: user?.name || '', email: user?.email || '' });
  const [avatar,  setAvatar]  = useState(null);
  const [preview, setPreview] = useState(user?.avatar?.url || '');
  const [pwForm,  setPwForm]  = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addrForm,setAddrForm]= useState({ fullName:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'' });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { dispatch(fetchProfile()); }, [dispatch]);

  /* ── Profile update ─────────────────────────────────── */
  const handleInfo = async e => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name',  info.name);
    fd.append('email', info.email);
    if (avatar) fd.append('avatar', avatar);
    const r = await dispatch(updateProfile(fd));
    if (updateProfile.fulfilled.match(r)) toast.success('Profile updated!');
    else toast.error(r.payload || 'Update failed');
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); }
  };

  /* ── Password change ─────────────────────────────────── */
  const handlePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ── Address CRUD ────────────────────────────────────── */
  const handleAddAddr = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/address', addrForm);
      toast.success('Address added!');
      setAddrForm({ fullName:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'' });
      setShowNew(false);
      dispatch(fetchProfile());
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelAddr = async id => {
    try {
      await api.delete(`/auth/address/${id}`);
      toast.success('Address deleted');
      dispatch(fetchProfile());
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">My Account</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="md:w-60 shrink-0">
          {/* Avatar card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 text-center">
            <div className="relative inline-block">
              {preview
                ? <img src={preview} alt="avatar" className="w-20 h-20 rounded-full object-cover mx-auto"/>
                : <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold flex items-center justify-center mx-auto">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
              }
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50">
                <FiCamera size={13} className="text-gray-600"/>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
              </label>
            </div>
            <p className="font-semibold text-gray-900 mt-3 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate px-2">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-block mt-2 text-[11px] bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">Admin</span>
            )}
          </div>

          {/* Nav tabs */}
          <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors border-l-[3px]
                  ${tab === t.key
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ──────────────────────────────────── */}
        <div className="flex-1">

          {/* Profile Info */}
          {tab === 'info' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
              <form onSubmit={handleInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                    <input value={info.name} onChange={e => setInfo(p => ({...p, name: e.target.value}))}
                      className={inpCls + ' pl-9'} placeholder="Your name"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                    <input type="email" value={info.email} onChange={e => setInfo(p => ({...p, email: e.target.value}))}
                      className={inpCls + ' pl-9'} placeholder="you@example.com"/>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Password */}
          {tab === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Change Password</h2>
              <form onSubmit={handlePassword} className="space-y-4">
                {[
                  { k:'currentPassword',  l:'Current Password' },
                  { k:'newPassword',      l:'New Password' },
                  { k:'confirmPassword',  l:'Confirm New Password' },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
                      <input type="password" required value={pwForm[k]}
                        onChange={e => setPwForm(p => ({...p, [k]: e.target.value}))}
                        className={inpCls + ' pl-9'} placeholder="••••••••"/>
                    </div>
                  </div>
                ))}
                <button type="submit"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Addresses */}
          {tab === 'addresses' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-900">Saved Addresses</h2>
                <button onClick={() => setShowNew(v => !v)}
                  className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                  <FiPlus size={13}/> Add New
                </button>
              </div>

              {/* New address form */}
              {showNew && (
                <form onSubmit={handleAddAddr} className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-4">New Address</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { k:'fullName', l:'Full Name',         span: true },
                      { k:'phone',   l:'Phone Number',       span: false },
                      { k:'line1',   l:'Address Line 1',     span: true },
                      { k:'line2',   l:'Address Line 2 (optional)', span: true },
                      { k:'city',    l:'City',               span: false },
                      { k:'state',   l:'State',              span: false },
                      { k:'pincode', l:'Pincode',            span: false },
                    ].map(({ k, l, span }) => (
                      <div key={k} className={span ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                        <input value={addrForm[k]} onChange={e => setAddrForm(p => ({...p, [k]: e.target.value}))}
                          className={inpCls} required={k !== 'line2'}/>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">Save</button>
                    <button type="button" onClick={() => setShowNew(false)}
                      className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
                  </div>
                </form>
              )}

              {/* Addresses list */}
              {!user?.addresses?.length && !showNew ? (
                <p className="text-sm text-gray-400 text-center py-8">No saved addresses yet.</p>
              ) : (
                <div className="space-y-3">
                  {user?.addresses?.map(a => (
                    <div key={a._id} className="flex justify-between gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {a.fullName}
                          {a.isDefault && <span className="ml-2 text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Default</span>}
                        </p>
                        <p className="text-gray-500 mt-0.5">{a.phone}</p>
                        <p className="text-gray-500">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                        <p className="text-gray-500">{a.city}, {a.state} — {a.pincode}</p>
                      </div>
                      <button onClick={() => handleDelAddr(a._id)} className="text-red-400 hover:text-red-600 shrink-0 transition-colors">
                        <FiTrash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
