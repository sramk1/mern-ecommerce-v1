import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured } from '../features/product/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import { Spinner }  from '../components/UI.jsx';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const CATS = [
  { name:'Electronics',   emoji:'💻' },
  { name:'Clothing',      emoji:'👕' },
  { name:'Books',         emoji:'📚' },
  { name:'Home & Kitchen',emoji:'🏠' },
  { name:'Sports',        emoji:'⚽' },
  { name:'Beauty',        emoji:'💄' },
  { name:'Toys',          emoji:'🧸' },
  { name:'Other',         emoji:'🎁' },
];

const TRUST = [
  { icon:<FiTruck size={20}/>,      label:'Free Delivery',   sub:'Orders above ₹500' },
  { icon:<FiShield size={20}/>,     label:'Secure Payments', sub:'SSL encrypted' },
  { icon:<FiRefreshCw size={20}/>,  label:'Easy Returns',    sub:'7-day policy' },
  { icon:<FiHeadphones size={20}/>, label:'24/7 Support',    sub:'Always here' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector(s => s.product);

  useEffect(() => { dispatch(fetchFeatured()); }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
              New Arrivals 2025
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Discover products<br />you'll love
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-md">
              Thousands of curated products across all categories. Fast delivery, easy returns, best prices.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow">
                Shop Now <FiArrowRight />
              </Link>
              <Link to="/products?isFeatured=true"
                className="inline-flex items-center gap-2 border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                View Deals
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center w-64 h-64 bg-white/10 rounded-3xl text-8xl">
            🛍️
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map(({ icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATS.map(({ name, emoji }) => (
            <button key={name} onClick={() => navigate(`/products?category=${name}`)}
              className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-indigo-700 text-center leading-tight">{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <FiArrowRight size={14}/>
          </Link>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-rose-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">Limited Time Offer!</h2>
          <p className="text-orange-100 mb-6">Use code <strong className="text-white bg-white/20 px-2 py-0.5 rounded">MERN20</strong> for 20% off your first order</p>
          <Link to="/products"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow">
            Shop Now <FiArrowRight/>
          </Link>
        </div>
      </section>
    </div>
  );
}
