import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { WizardProvider } from "@/context/wizard-context";
import { FullWizard } from "@/components/wizard/FullWizard";
import ResortLandingPage from "@/pages/ResortLandingPage";
import AdminDashboard from "@/pages/AdminDashboard";

export default function App() {
  return (
    <WizardProvider>
      <Routes>
        {/* 13-step wizard */}
        <Route path="/" element={<FullWizard />} />
        {/* Resort landing page */}
        <Route path="/resort/:submissionId" element={<ResortLandingPage />} />
        {/* Admin dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </WizardProvider>
  );
}
