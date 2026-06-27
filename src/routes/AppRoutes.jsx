import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import WelcomePage from '../pages/WelcomePage';
import SignupPage from '../pages/SignupPage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProfileSetupPage from '../pages/ProfileSetupPage';
import InterestsPage from '../pages/InterestsPage';
import PhotosPage from '../pages/PhotosPage';
import DiscoverPage from '../pages/DiscoverPage';
import AppLayout from '../layouts/AppLayout';
import RequestsPage from '../pages/RequestsPage';
import ConnectionsPage from '../pages/ConnectionsPage';
import ChatPage from '../pages/ChatPage';
import PremiumPage from '../pages/PremiumPage';
import LikesYouPage from '../pages/LikesYouPage';
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminVerificationsPage from '../pages/admin/AdminVerificationsPage';
import SafetyCenterPage from '../pages/SafetyCenterPage';
import LikedYouPage from '../pages/LikedYouPage';
import EditProfilePage from '../pages/EditProfilePage';
import SettingsPage from '../pages/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile/setup" element={<ProfileSetupPage />} />
          <Route path="/profile/interests" element={<InterestsPage />} />
          <Route path="/profile/photos" element={<PhotosPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/connections" element={<ConnectionsPage />} />
          <Route path="/matches" element={<ConnectionsPage />} />
          <Route path="/chat/:matchId" element={<ChatPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/likes-you" element={<LikesYouPage />} />
          <Route path="/liked-you" element={<LikedYouPage />} />
          <Route path="/safety" element={<SafetyCenterPage />} />
        </Route>
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/verifications" element={<AdminVerificationsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
