import { Route, Routes } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { CreateAdPage } from "./pages/CreateAdPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ModerationPage } from "./pages/ModerationPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create-ad" element={<CreateAdPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/moderation" element={<ModerationPage />} />
    </Routes>
  );
}
