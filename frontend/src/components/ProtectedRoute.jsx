import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  const loc = useLocation();
  return user ? children : <Navigate to="/login" state={{ from: loc }} replace />;
};

export const AdminRoute = ({ children }) => {
  const { user } = useSelector(s => s.auth);
  const loc = useLocation();
  if (!user)                return <Navigate to="/login" state={{ from: loc }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};
