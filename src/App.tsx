import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { WizardProvider } from "@/context/wizard-context";
import { FullWizard } from "@/components/wizard/FullWizard"; // Named Import
import ResortLandingPage from "@/pages/ResortLandingPage";
import AdminDashboard from "@/pages/AdminDashboard"; // Default Import

export default function App() {
  return (
    <WizardProvider>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* The 13-step wizard */}
        <Route path="/wizard" element={<FullWizard />} />
        
        {/* Resort landing page */}
        <Route path="/resort/:id" element={<ResortLandingPage />} />
        
        {/* Admin dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </WizardProvider>
  );
}
