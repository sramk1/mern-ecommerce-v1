import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, submitReview } from '../features/product/productSlice.js';
import { addToCart } from '../features/cart/cartSlice.js';
import { Spinner, Stars } from '../components/UI.jsx';
import { fmt, disc, date } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.product);
  const { user } = useSelector(s => s.auth);

  const [img,     setImg]     = useState(0);
  const [qty,     setQty]     = useState(1);
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const [revLoad, setRevLoad] = useState(false);

  useEffect(() => { dispatch(fetchProduct(id)); setImg(0); }, [id, dispatch]);

  if (loading || !product) return <Spinner />;

  const d     = disc(product.price, product.discountPrice);
  const price = product.discountPrice || product.price;

  const handleCart = async () => {
    if (!user) { toast.error('Login to add to cart'); navigate('/login'); return; }
    const r = await dispatch(addToCart({ productId: product._id, quantity: qty }));
    if (addToCart.fulfilled.match(r)) toast.success(`${qty} item(s) added!`);
    else toast.error(r.payload || 'Failed');
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!user) { toast.error('Login to review'); return; }
    setRevLoad(true);
    const r = await dispatch(submitReview({ id, data: { rating, comment } }));
    if (submitReview.fulfilled.match(r)) {
      toast.success('Review submitted!');
      setComment(''); setRating(5);
      dispatch(fetchProduct(id));
    } else toast.error(r.payload || 'Failed');
    setRevLoad(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex gap-2">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-indigo-600">Home</span>/
        <span onClick={() => navigate('/products')} className="cursor-pointer hover:text-indigo-600">Products</span>/
        <span className="text-gray-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3">
            <img src={product.images?.[img]?.url || 'https://placehold.co/500'} alt={product.name}
              className="w-full h-full object-contain" />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {product.images.map((im, i) => (
                <button key={i} onClick={() => setImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === img ? 'border-indigo-500' : 'border-transparent'}`}>
                  <img src={im.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{product.brand}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Stars rating={product.ratings} />
            <span className="text-sm text-gray-500">{product.ratings?.toFixed(1)} · {product.numReviews} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-gray-900">{fmt(price)}</span>
            {d > 0 && <>
              <span className="text-lg text-gray-400 line-through">{fmt(product.price)}</span>
              <span className="text-sm font-bold text-red-500">{d}% off</span>
            </>}
          </div>
          <p className={`text-sm font-medium mb-5 ${product.stock ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.stock ? `✓ In stock (${product.stock} left)` : '✗ Out of stock'}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-gray-50"><FiMinus size={15}/></button>
                <span className="px-4 py-2.5 font-semibold text-sm border-x border-gray-200 min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2.5 hover:bg-gray-50"><FiPlus size={15}/></button>
              </div>
              <button onClick={handleCart}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                <FiShoppingCart size={17}/> Add to Cart
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[{ i:<FiTruck/>, l:'Free Delivery', s:'Over ₹500' },
              { i:<FiShield/>, l:'Secure Pay',   s:'SSL encrypted' },
              { i:<FiRefreshCw/>, l:'7-day Return', s:'Easy returns' }].map(({ i, l, s }) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3 text-center">
                <span className="text-indigo-600 flex justify-center mb-1">{i}</span>
                <p className="text-xs font-semibold text-gray-700">{l}</p>
                <p className="text-[11px] text-gray-400">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Write review */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setRating(s)}>
                        <svg width={24} height={24} viewBox="0 0 24 24"
                          fill={s <= rating ? '#f59e0b' : 'none'}
                          stroke={s <= rating ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                  placeholder="Share your experience…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none" />
                <button type="submit" disabled={revLoad}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60">
                  {revLoad ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500">
                <span onClick={() => navigate('/login')} className="text-indigo-600 cursor-pointer hover:underline">Login</span> to leave a review.
              </p>
            )}
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews?.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No reviews yet. Be the first!</p>
            ) : product.reviews?.map(r => (
              <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                      {r.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400">{date(r.createdAt)}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} size={13} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
