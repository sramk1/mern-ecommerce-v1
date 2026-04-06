import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchProduct } from '../../features/product/productSlice.js';
import { Spinner } from '../../components/UI.jsx';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiX, FiArrowLeft } from 'react-icons/fi';

const CATS = ['Electronics','Clothing','Books','Home & Kitchen','Sports','Beauty','Toys','Other'];
const inpCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition-colors bg-white';

export default function AdminProductForm() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.product);
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState({
    name:'', description:'', price:'', discountPrice:'',
    category:'Electronics', brand:'', stock:'', isFeatured: false,
  });
  const [files,    setFiles]    = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { if (isEdit) dispatch(fetchProduct(id)); }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && product?._id === id) {
      setForm({
        name:          product.name          || '',
        description:   product.description   || '',
        price:         product.price         || '',
        discountPrice: product.discountPrice || '',
        category:      product.category      || 'Electronics',
        brand:         product.brand         || '',
        stock:         product.stock         || '',
        isFeatured:    product.isFeatured    || false,
      });
      setPreviews(product.images?.map(i => i.url) || []);
    }
  }, [product, isEdit, id]);

  const onImages = e => {
    const chosen = Array.from(e.target.files);
    if (chosen.length + files.length > 5) { toast.error('Max 5 images'); return; }
    setFiles(f => [...f, ...chosen]);
    setPreviews(p => [...p, ...chosen.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = i => {
    setFiles(f => f.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isEdit && files.length === 0) { toast.error('Upload at least one image'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    files.forEach(f => fd.append('images', f));

    setSaving(true);
    const r = isEdit
      ? await dispatch(updateProduct({ id, fd }))
      : await dispatch(createProduct(fd));
    setSaving(false);

    const action = isEdit ? updateProduct : createProduct;
    if (action.fulfilled.match(r)) {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/admin');
    } else {
      toast.error(r.payload || 'Failed');
    }
  };

  if (isEdit && loading && !product) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/admin')} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 mb-6 text-sm font-medium">
        <FiArrowLeft size={15}/> Back to Dashboard
      </button>

      <h1 className="text-xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Basic Info</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-400">*</span></label>
            <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required className={inpCls} placeholder="e.g. Sony WH-1000XM5"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} required rows={4}
              className={inpCls + ' resize-none'} placeholder="Describe the product…"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand <span className="text-red-400">*</span></label>
              <input value={form.brand} onChange={e => setForm(p=>({...p,brand:e.target.value}))} required className={inpCls} placeholder="e.g. Sony"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-400">*</span></label>
              <select value={form.category} onChange={e => setForm(p=>({...p,category:e.target.value}))} className={inpCls}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pricing & Stock</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-400">*</span></label>
              <input type="number" min="0" value={form.price} onChange={e => setForm(p=>({...p,price:e.target.value}))} required className={inpCls} placeholder="0"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (₹)</label>
              <input type="number" min="0" value={form.discountPrice} onChange={e => setForm(p=>({...p,discountPrice:e.target.value}))} className={inpCls} placeholder="Optional"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock <span className="text-red-400">*</span></label>
              <input type="number" min="0" value={form.stock} onChange={e => setForm(p=>({...p,stock:e.target.value}))} required className={inpCls} placeholder="0"/>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p=>({...p,isFeatured:e.target.checked}))} className="w-4 h-4 accent-indigo-600 rounded"/>
            <span className="text-sm font-medium text-gray-700">Mark as Featured Product</span>
          </label>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Images</p>

          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors mb-4">
            <FiUploadCloud size={26} className="text-gray-400 mb-1.5"/>
            <p className="text-sm text-gray-500">Click to upload (max 5 images)</p>
            <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WEBP · Max 5 MB each</p>
            <input type="file" multiple accept="image/*" onChange={onImages} className="hidden"/>
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2.5">
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={src} alt={`preview-${i}`} className="w-full h-full object-cover rounded-xl border border-gray-100"/>
                  <button type="button" onClick={() => removeImg(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiX size={11}/>
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-medium">Main</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/admin')}
            className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
