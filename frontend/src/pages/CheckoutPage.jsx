import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../features/order/orderSlice.js';
import { fmt } from '../utils/helpers.js';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';

const STEPS = ['Address', 'Payment', 'Review'];

const FIELD = ({ label, req, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && ' *'}</label>
    {children}
  </div>
);
const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { items, totalPrice } = useSelector(s => s.cart);
  const { loading } = useSelector(s => s.order);

  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const [step, setStep]         = useState(0);
  const [selAddr, setSelAddr]   = useState(defaultAddr?._id || null);
  const [useNew, setUseNew]     = useState(!user?.addresses?.length);
  const [newAddr, setNewAddr]   = useState({ fullName:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'' });
  const [method, setMethod]     = useState('razorpay');

  const tax      = Math.round(totalPrice * 0.18);
  const shipping = totalPrice > 500 ? 0 : 50;
  const total    = totalPrice + tax + shipping;

  const addr = useNew ? newAddr : user?.addresses?.find(a => a._id === selAddr);

  const handleRazorpay = async () => {
    const { data } = await api.post('/payment/razorpay/order', { amount: total });
    return new Promise((res, rej) => {
      const rzp = new window.Razorpay({
        key: data.key, amount: data.amount, currency: data.currency,
        order_id: data.orderId, name: 'MyShop',
        prefill: { name: user.name, email: user.email },
        theme: { color: '#6366f1' },
        handler: async response => {
          try {
            const v = await api.post('/payment/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            res(v.data.paymentResult);
          } catch { rej(new Error('Verification failed')); }
        },
        modal: { ondismiss: () => rej(new Error('Payment cancelled')) },
      });
      rzp.open();
    });
  };

  const handlePlace = async () => {
    if (!addr?.fullName) { toast.error('Please provide delivery address'); return; }
    try {
      let paymentResult = {};
      if (method === 'razorpay') paymentResult = await handleRazorpay();
      const r = await dispatch(placeOrder({ shippingAddress: addr, paymentMethod: method, paymentResult }));
      if (placeOrder.fulfilled.match(r)) navigate(`/orders/${r.payload._id}?success=true`);
      else toast.error(r.payload || 'Order failed');
    } catch (e) { toast.error(e.message || 'Payment failed'); }
  };

  const Indicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
            ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {i < step ? <FiCheck size={14}/> : i + 1}
          </div>
          <span className={`ml-1.5 text-sm hidden sm:block ${i === step ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>{s}</span>
          {i < 2 && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${i < step ? 'bg-emerald-400' : 'bg-gray-200'}`}/>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 text-center mb-6">Checkout</h1>
      <Indicator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Delivery Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="space-y-2.5 mb-5">
                  {user.addresses.map(a => (
                    <label key={a._id} className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors
                      ${!useNew && selAddr === a._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input type="radio" name="addr" checked={!useNew && selAddr === a._id}
                        onChange={() => { setSelAddr(a._id); setUseNew(false); }} className="mt-0.5 accent-indigo-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">{a.fullName}
                          {a.isDefault && <span className="ml-2 text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Default</span>}
                        </p>
                        <p className="text-gray-500">{a.phone}</p>
                        <p className="text-gray-500">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <button onClick={() => setUseNew(v => !v)}
                    className={`w-full p-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors
                      ${useNew ? 'border-indigo-400 text-indigo-600 bg-indigo-50' : 'border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                    + Add New Address
                  </button>
                </div>
              )}
              {(useNew || !user?.addresses?.length) && (
                <div className="grid grid-cols-2 gap-4">
                  {[['fullName','Full Name',true,'col-span-2'],['phone','Phone',true,''],['line1','Address Line 1',true,'col-span-2'],
                    ['line2','Address Line 2',false,'col-span-2'],['city','City',true,''],['state','State',true,''],['pincode','Pincode',true,'']].map(([k,l,r,span]) => (
                    <FIELD key={k} label={l} req={r}>
                      <input value={newAddr[k]} onChange={e => setNewAddr(p => ({ ...p, [k]: e.target.value }))}
                        className={inp + (span ? ` ${span}` : '')} style={span ? {gridColumn:'span 2'} : {}} />
                    </FIELD>
                  ))}
                </div>
              )}
              <button onClick={() => setStep(1)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 text-sm">
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[['razorpay','💳','Razorpay','UPI, Cards, Net Banking, Wallets'],
                  ['stripe','🌐','Stripe','International Credit / Debit Cards'],
                  ['cod','💵','Cash on Delivery','Pay when order arrives']].map(([v, e, l, s]) => (
                  <label key={v} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors
                    ${method === v ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="pay" value={v} checked={method === v} onChange={() => setMethod(v)} className="accent-indigo-600"/>
                    <span className="text-2xl">{e}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{l}</p>
                      <p className="text-xs text-gray-500">{s}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">← Back</button>
                <button onClick={() => setStep(2)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5">Review Order</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
                <p className="font-semibold text-gray-700 mb-1">Delivering to</p>
                <p className="text-gray-600">{addr?.fullName} · {addr?.phone}</p>
                <p className="text-gray-600">{addr?.line1}, {addr?.city} {addr?.pincode}</p>
              </div>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 text-sm">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"/>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">×{item.quantity} · {fmt(item.price)}</p>
                    </div>
                    <p className="font-bold text-gray-900">{fmt(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">← Back</button>
                <button onClick={handlePlace} disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60">
                  {loading ? 'Placing…' : `Place Order · ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
            <div className="space-y-2.5 text-sm text-gray-600">
              <div className="flex justify-between"><span>Items ({items.length})</span><span>{fmt(totalPrice)}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
              <div className="flex justify-between"><span>Shipping</span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : <span>{fmt(shipping)}</span>}</div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900"><span>Total</span><span>{fmt(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
