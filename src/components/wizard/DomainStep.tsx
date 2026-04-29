import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useWizard } from '@/context/wizard-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { domainSchema, type DomainFormValues } from '@/lib/domain-schema';

export function DomainStep({ onStepComplete }: { onStepComplete: () => void }) {
  const { submissionId, saveStepData } = useWizard();

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: { purchaseDomain: false, customDomain: '' },
  });

  const purchaseDomain = watch('purchaseDomain');
  const customDomain = watch('customDomain');

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    price?: number;
    currency?: string;
    message?: string;
    domain?: string;
  } | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  // ── Check domain availability ──
  const onCheckDomain = async () => {
    if (!customDomain) {
      toast.error('Please enter a domain name');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch('/api/hostinger/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check domain');
      setAvailability(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setChecking(false);
    }
  };

  // ── Purchase domain ──
  const onPurchaseDomain = async () => {
    if (!availability?.available || !customDomain) return;
    setPurchasing(true);
    try {
      const res = await fetch('/api/hostinger/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: customDomain,
          years: 1,
          submissionId,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Purchase failed');

      await saveStepData('domain', {
        purchaseDomain: true,
        customDomain,
        purchased: true,
        purchaseResult: result,
      });

      setPurchased(true);
      toast.success('Domain purchased and DNS configured!');
      // Slight delay so user sees success state
      setTimeout(() => onStepComplete(), 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  // ── Continue / Submit ──
  const onSubmit = async () => {
    if (purchasing) return;

    if (purchaseDomain && !purchased) {
      if (!availability?.available) {
        toast.error('Please check availability and complete purchase first.');
        return;
      }
      await onPurchaseDomain();
      return;
    }

    // Save final state (skip or already purchased)
    const stepData: Record<string, unknown> = { purchaseDomain };
    if (purchased && customDomain) {
      stepData.customDomain = customDomain;
    }
    await saveStepData('domain', stepData);
    onStepComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-heading font-semibold tracking-tight">
          Your Domain
        </h1>
        <p className="text-sm text-muted-foreground">
          Step 5 — Get a custom domain or use a free subdomain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Domain Options
          </CardTitle>
          <CardDescription>
            Purchase a domain through Hostinger; we'll configure DNS automatically to point to Vercel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Custom domain toggle */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="purchaseDomain"
              checked={purchaseDomain}
              onCheckedChange={(checked) => {
                const val = checked === true;
                setValue('purchaseDomain', val);
                if (!val) {
                  setAvailability(null);
                  setPurchased(false);
                }
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="purchaseDomain" className="font-medium">
                I want a custom domain (e.g. yourresort.com)
              </Label>
              <p className="text-sm text-muted-foreground">
                Approx. ₱599/year for .com domains; we handle registration & DNS setup.
              </p>
            </div>
          </div>

          {/* Custom domain input (shown when checkbox is checked) */}
          {purchaseDomain && (
            <div className="space-y-4 pl-8">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Domain name</Label>
                <div className="flex gap-2">
                  <Input
                    id="customDomain"
                    placeholder="yourdomain.com"
                    className="flex-1"
                    {...control.register('customDomain')}
                    disabled={checking || purchasing || purchased}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onCheckDomain}
                    disabled={checking || purchasing || purchased || !customDomain}
                  >
                    {checking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Availability'
                    )}
                  </Button>
                </div>
                {errors.customDomain && (
                  <p className="text-xs text-red-500">{errors.customDomain.message}</p>
                )}
              </div>

              {/* Availability result card */}
              {availability && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border p-4 bg-muted/30"
                >
                  {availability.available ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">Available!</span>
                        <span className="text-sm">
                          – ₱{availability.price ?? 599}/year
                          {availability.currency && ` ${availability.currency}`}
                        </span>
                      </div>

                      {purchased ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Domain purchased & DNS configured ✅</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={onPurchaseDomain}
                          disabled={purchasing}
                          className="w-full"
                        >
                          {purchasing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Purchasing…
                            </>
                          ) : (
                            <>
                              Buy {availability.domain || customDomain} for ₱
                              {availability.price ?? 599}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-red-600">
                      <XCircle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-medium">Not available</p>
                        <p className="text-sm">
                          {availability.message || 'This domain is already taken.'}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Post-purchase success message */}
              {purchased && (
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200 text-sm text-blue-800">
                  <p>
                    🎉 Domain purchased! DNS is now pointing to our servers. Full
                    propagation takes <strong>24–48 hours</strong>.
                  </p>
                  <p className="mt-1">
                    Your site will be live at: <strong>https://{customDomain}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Free subdomain fallback */}
          {!purchaseDomain && (
            <div className="pl-8 rounded-md bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Your site will get a free subdomain:{' '}
                <code className="bg-muted-foreground/10 px-1 py-0.5 rounded">
                  your-resort.vercel.app
                </code>
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="button" onClick={onSubmit} disabled={purchasing}>
            {purchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
