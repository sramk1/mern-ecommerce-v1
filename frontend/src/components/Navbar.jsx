import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice.js';
import { resetCart } from '../features/cart/cartSlice.js';
import toast from 'react-hot-toast';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser, FiPackage, FiSettings, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }       = useSelector(s => s.auth);
  const { totalItems } = useSelector(s => s.cart);

  const [q,      setQ]      = useState('');
  const [open,   setOpen]   = useState(false);
  const [uMenu,  setUMenu]  = useState(false);
  const menuRef = useRef(null);

  // Close user-dropdown on outside click
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setUMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onSearch = e => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?keyword=${q.trim()}`); setQ(''); setOpen(false); }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(resetCart());
    toast.success('See you soon!');
    navigate('/');
    setUMenu(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-indigo-600 shrink-0">MyShop</Link>

        {/* Desktop search */}
        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="flex w-full border border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-400 transition-colors">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
              className="flex-1 px-4 py-2 text-sm outline-none bg-white" />
            <button type="submit" className="px-3 text-gray-400 hover:text-indigo-600 bg-white transition-colors">
              <FiSearch size={17} />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">
            <FiShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setUMenu(v => !v)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                {user.avatar?.url
                  ? <img src={user.avatar.url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  : <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{user.name?.[0]?.toUpperCase()}</div>
                }
                <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
              </button>

              {uMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-1.5 overflow-hidden">
                  <Link to="/profile" onClick={() => setUMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <FiUser size={15}/> Profile
                  </Link>
                  <Link to="/orders" onClick={() => setUMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    <FiPackage size={15}/> My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                      <FiSettings size={15}/> Admin
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <FiLogOut size={15}/> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">
                Login
              </button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(v => !v)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            {open ? <FiX size={20}/> : <FiMenu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {open && (
        <div className="md:hidden px-4 pb-3 border-t border-gray-100">
          <form onSubmit={onSearch} className="flex mt-3 border border-gray-200 rounded-xl overflow-hidden">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
              className="flex-1 px-4 py-2.5 text-sm outline-none" />
            <button type="submit" className="px-3 text-gray-500"><FiSearch size={17}/></button>
          </form>
        </div>
      )}
    </nav>
  );
}
