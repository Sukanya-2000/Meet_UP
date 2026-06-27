import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { token, user } = useSelector((state) => state.auth);
  return token && user?.role === 'admin' ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
