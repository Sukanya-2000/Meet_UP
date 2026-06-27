import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

export default function useAuth() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return { ...auth, logout: () => dispatch(logout()) };
}
