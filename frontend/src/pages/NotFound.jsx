import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
      <p className="text-8xl mb-5">🔍</p>
      <h1 className="text-5xl font-bold text-gray-800 mb-3">404</h1>
      <p className="text-gray-500 text-lg mb-8">This page doesn't exist or was moved.</p>
      <Link
        to="/"
        className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm"
      >
        Go Home
      </Link>
    </div>
  );
}
