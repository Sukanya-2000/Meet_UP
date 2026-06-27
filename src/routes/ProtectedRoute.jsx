import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import profileService from '../services/profileService';

export default function ProtectedRoute() {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();
  const [profileCompleted, setProfileCompleted] = useState(null);

  useEffect(() => {
    let active = true;
    if (!token) return undefined;
    profileService.getMyProfile()
      .then((data) => { if (active) setProfileCompleted(Boolean(data.profileCompleted)); })
      .catch(() => { if (active) setProfileCompleted(false); });
    return () => { active = false; };
  }, [token]);

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  const onboardingPaths = ['/profile/setup', '/profile/interests'];
  const isOnboarding = onboardingPaths.includes(location.pathname);
  if (profileCompleted === false && !isOnboarding) return <Navigate to="/profile/setup" replace />;
  if (profileCompleted && isOnboarding) return <Navigate to="/discover" replace />;

  return <Outlet />;
}
