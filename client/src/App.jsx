import { Navigate, Route, Routes } from 'react-router-dom';
import SvgIcons from './components/SvgIcons';
import { ConfirmProvider } from './components/ConfirmProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterChoicePage from './pages/RegisterChoicePage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import RegisterStaffPage from './pages/RegisterStaffPage';
import DashboardPage from './pages/DashboardPage';
import FoodPrepPage from './pages/FoodPrepPage';
import MenuCounterPage from './pages/MenuCounterPage';
import PrepSheetPage from './pages/PrepSheetPage';
import StockTrackerPage from './pages/StockTrackerPage';
import TodoPage from './pages/TodoPage';
import RecipeBookPage from './pages/RecipeBookPage';
import SuperDashPage from './pages/SuperDashPage';
import SuperRestaurantsPage from './pages/SuperRestaurantsPage';
import SuperUsersPage from './pages/SuperUsersPage';
import OwnerTeamPage from './pages/OwnerTeamPage';
import OwnerCodesPage from './pages/OwnerCodesPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import ProfilePage from './pages/ProfilePage';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === 'super_admin' ? '/super' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <ConfirmProvider>
      <SvgIcons />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterChoicePage />} />
        <Route path="/register/restaurant" element={<RegisterOwnerPage />} />
        <Route path="/register/staff" element={<RegisterStaffPage />} />

        <Route element={<ProtectedRoute roles={['owner', 'staff']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/food-prep" element={<FoodPrepPage />} />
          <Route path="/menu-counter" element={<MenuCounterPage />} />
          <Route path="/prep-sheet" element={<PrepSheetPage />} />
          <Route path="/stock" element={<StockTrackerPage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/recipes" element={<RecipeBookPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['owner']} />}>
          <Route path="/owner/team" element={<OwnerTeamPage />} />
          <Route path="/owner/codes" element={<OwnerCodesPage />} />
          <Route path="/owner/settings" element={<OwnerSettingsPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['super_admin']} />}>
          <Route path="/super" element={<SuperDashPage />} />
          <Route path="/super/restaurants" element={<SuperRestaurantsPage />} />
          <Route path="/super/users" element={<SuperUsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfirmProvider>
  );
}
