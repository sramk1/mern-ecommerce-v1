// Spinner
export const Spinner = ({ className = '' }) => (
  <div className={`flex justify-center items-center py-16 ${className}`}>
    <div className="w-9 h-9 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

// Page-level loading
export const PageLoader = () => (
  <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

// Stars
export const Stars = ({ rating = 0, size = 14 }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
        stroke={s <= Math.round(rating) ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </span>
);

// Empty state
export const Empty = ({ emoji = '📦', title, sub, children }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <span className="text-6xl mb-4">{emoji}</span>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
    {sub && <p className="text-gray-500 text-sm mb-5">{sub}</p>}
    {children}
  </div>
);

// Btn
export const Btn = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const v = {
    primary:  'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95',
    outline:  'border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95',
    ghost:    'text-gray-600 hover:bg-gray-100',
    danger:   'bg-red-500 text-white hover:bg-red-600 active:scale-95',
  }[variant];
  const s = { sm:'text-xs px-3 py-1.5', md:'text-sm px-4 py-2.5', lg:'text-base px-6 py-3' }[size];
  return <button className={`${base} ${v} ${s} ${className}`} {...props}>{children}</button>;
};
