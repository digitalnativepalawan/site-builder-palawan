import { useEffect, useRef, useState } from "react";
import { Crown, Eye, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Simple canvas-confetti inline — avoids external dependency
function popConfetti() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const confetti = require("canvas-confetti");

    // Center burst
    confetti({ particleCount: 120, spread: 70, startVelocity: 45, gravity: 0.8 });

    // Side cannons
    setTimeout(() => {
      const left = confetti.create({ origin: { x: 0 } });
      const right = confetti.create({ origin: { x: 1 } });
      left({ particleCount: 50, spread: 55, startVelocity: 35, gravity: 0.9 });
      right({ particleCount: 50, spread: 55, startVelocity: 35, gravity: 0.9 });
    }, 500);
  } catch {
    console.warn("Confetti skipped — canvas-confetti not loaded");
  }
}

export function SuccessStep({ submissionId }: { submissionId: string | null }) {
  const fired = useRef(false);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => popConfetti(), 300);
  }, []);

  // Fetch the generated site URL (placeholder for now)
  useEffect(() => {
    if (!submissionId) return;
    // TODO: once the rendering pipeline is live, swap this for a real query
    setSiteUrl(`/preview/${submissionId}`);
  }, [submissionId]);

  const handlePreview = () => {
    if (siteUrl) {
      window.location.href = siteUrl;
    } else {
      toast.info("Site preview coming soon — your resort data is saved!");
    }
  };

  const handleDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      className="w-full max-w-xl mx-auto text-center space-y-8"
    >
      {/* Crown icon */}
      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
        <Crown className="w-10 h-10 text-primary" />
      </div>

      {/* Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl font-heading font-semibold tracking-tight">
          Congratulations!
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your resort profile is ready. All your details, photos, and amenities have been saved securely.
        </p>
      </div>

      {/* Divider */}
      <div className="w-16 h-px bg-border mx-auto" />

      {/* Action buttons */}
      <div className="space-y-3 max-w-xs mx-auto">
        <Button size="lg" onClick={handlePreview} className="h-14 text-base gap-2 w-full">
          <Eye className="w-5 h-5" />
          Preview My Site
        </Button>
        <Button variant="outline" size="lg" onClick={handleDashboard} className="h-14 text-base gap-2 w-full">
          <LayoutDashboard className="w-5 h-5" />
          Go to Dashboard
        </Button>
      </div>
    </motion.div>
  );
}
