import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-white text-lg font-bold mb-2">MyShop</p>
          <p className="text-sm leading-relaxed">Quality products delivered fast. Shop with confidence.</p>
        </div>
        {[
          { title:'Shop', links:[['Products','/products'],['Cart','/cart'],['My Orders','/orders']] },
          { title:'Account', links:[['Login','/login'],['Register','/register'],['Profile','/profile']] },
          { title:'Payments', links:[['Razorpay','#'],['Stripe','#'],['Cash on Delivery','#']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <p className="text-white text-sm font-semibold mb-3">{title}</p>
            <ul className="space-y-2 text-sm">
              {links.map(([l, h]) => (
                <li key={l}><Link to={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        © {new Date().getFullYear()} MyShop · Built with MERN Stack
      </div>
    </footer>
  );
}
