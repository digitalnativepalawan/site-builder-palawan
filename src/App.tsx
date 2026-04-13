import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { WizardProvider } from "@/context/wizard-context";
import { FullWizard } from "@/components/wizard/FullWizard";
import ResortLandingPage from "@/pages/ResortLandingPage";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <WizardProvider>
      <Routes>
        {/* Redirect root to dashboard or keep as wizard start */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* The 13-step wizard - Path must match what Dashboard calls */}
        <Route path="/wizard" element={<FullWizard />} />
        
        {/* Resort landing page - submissionId must match the param used in your Eye button */}
        <Route path="/resort/:id" element={<ResortLandingPage />} />
        
        {/* Admin dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />

        {/* Catch-all to prevent 404 white screens */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </WizardProvider>
  );
}
