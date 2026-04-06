export const fmt   = n  => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
export const date  = d  => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
export const trunc = (s, n) => s?.length > n ? s.slice(0, n) + '…' : s;
export const disc  = (price, dp) => dp ? Math.round(((price - dp) / price) * 100) : 0;

export const STATUS_COLOR = {
  pending:    'bg-amber-50  text-amber-700  border border-amber-200',
  processing: 'bg-blue-50   text-blue-700   border border-blue-200',
  shipped:    'bg-violet-50 text-violet-700 border border-violet-200',
  delivered:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:  'bg-red-50    text-red-700    border border-red-200',
};
