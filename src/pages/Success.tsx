import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Crown, Eye, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Center burst
    confetti({ particleCount: 120, spread: 70, startVelocity: 45, gravity: 0.8 });

    // Side cannons with delay
    setTimeout(() => {
      const left = confetti.create({ origin: { x: 0 } });
      const right = confetti.create({ origin: { x: 1 } });
      left({ particleCount: 50, spread: 55, startVelocity: 35, gravity: 0.9 });
      right({ particleCount: 50, spread: 55, startVelocity: 35, gravity: 0.9 });
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative ring */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
          <Crown className="w-10 h-10 text-primary" />
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-heading font-semibold tracking-tight">
        Congratulations!
      </h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-md">
        Your resort profile is ready. All your details, photos, and amenities have been saved.
      </p>

      {/* Subtle divider */}
      <div className="w-16 h-px bg-border my-8" />

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          size="lg"
          onClick={() => navigate("/site-preview")}
          className="h-14 text-base gap-2"
        >
          <Eye className="w-5 h-5" />
          Preview My Site
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate("/dashboard")}
          className="h-14 text-base gap-2"
        >
          <LayoutDashboard className="w-5 h-5" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
