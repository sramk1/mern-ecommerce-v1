import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice.js';
import { Stars } from './UI.jsx';
import { fmt, disc, trunc } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import { FiShoppingCart } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const d = disc(product.price, product.discountPrice);
  const price = product.discountPrice || product.price;

  const handleAdd = async e => {
    e.preventDefault();
    if (!user) { toast.error('Login to add to cart'); return; }
    if (!product.stock) { toast.error('Out of stock'); return; }
    const r = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    if (addToCart.fulfilled.match(r)) toast.success('Added to cart');
    else toast.error(r.payload || 'Failed');
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative bg-gray-50 h-52 overflow-hidden">
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/300x200?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {d > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{d}%
            </span>
          )}
          {!product.stock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-white text-gray-700 text-sm font-semibold px-3 py-1 rounded-lg shadow">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="text-gray-800 text-sm font-medium leading-snug mb-2">{trunc(product.name, 50)}</h3>
          <div className="flex items-center gap-1.5 mb-3">
            <Stars rating={product.ratings} />
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-gray-900">{fmt(price)}</span>
              {d > 0 && <span className="text-xs text-gray-400 line-through">{fmt(product.price)}</span>}
            </div>
            <button
              onClick={handleAdd}
              disabled={!product.stock}
              className="flex items-center gap-1 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FiShoppingCart size={13}/> Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
