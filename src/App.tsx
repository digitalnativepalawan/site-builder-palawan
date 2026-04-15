import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import BusinessLandingPage from "@/pages/BusinessLandingPage";
import { FullWizard } from "@/components/wizard/FullWizard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/wizard" element={<FullWizard />} />
      <Route path="/site/:id" element={<BusinessLandingPage />} />
    </Routes>
  );
}
