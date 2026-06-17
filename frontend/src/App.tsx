import { Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CreateAdPage } from "./pages/CreateAdPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ModerationPage } from "./pages/ModerationPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { GuestRoute, ModeratorRoute, ProtectedRoute } from "./components/RouteGuards";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage section="overview" /></ProtectedRoute>} />
      <Route path="/dashboard/ads" element={<ProtectedRoute><DashboardPage section="ads" /></ProtectedRoute>} />
      <Route path="/dashboard/responses" element={<ProtectedRoute><DashboardPage section="responses" /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/create-ad" element={<ProtectedRoute><CreateAdPage /></ProtectedRoute>} />
      <Route path="/ads/:id/edit" element={<ProtectedRoute><CreateAdPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/moderation" element={<ModeratorRoute><ModerationPage /></ModeratorRoute>} />
    </Routes>
  );
}
