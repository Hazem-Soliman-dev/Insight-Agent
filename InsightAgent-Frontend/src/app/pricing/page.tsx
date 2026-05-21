'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export default function PricingPage() {
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/subscription/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      toast.error('Failed to load credit plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const { data } = await api.post('/subscription/checkout', { planId });
      if (data.url) {
        toast.loading('Redirecting to Stripe secure checkout...');
        window.location.href = data.url;
      } else {
        toast.error('Failed to initiate checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPlanFeatures = (credits: number) => {
    const features = [
      `Gives exactly ${credits.toLocaleString()} query credits`,
      'Non-expiring tokens',
      'Deploy custom DB queries',
      'Generate business recommendations',
    ];

    if (credits <= 100) {
      features.push('Standard execution speed');
    } else if (credits <= 500) {
      features.push('Priority execution speed', 'Advanced SQL debugging');
    } else {
      features.push('Max priority speed', 'Unlimited simultaneous uploads', '24/7 technical support');
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans pb-0">
      {/* Glowing Background Grids & Ambient Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none" />

      {/* Unified Premium Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Pricing Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16 relative z-10 max-w-6xl">
        <div className="text-center mb-10 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-[950] tracking-tight text-zinc-100 leading-[1.1] text-balance">
            Transparent
            <span className="block mt-1 text-[20px] sm:inline sm:mt-0 bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent select-none pb-1 sm:pb-2">
              {" "}Pay-As-You-Go Credits
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed text-balance">
            Purchase credit packs to execute agentic data analysis. Zero monthly subscriptions or recurring fees.
          </p>
          {user && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-300 font-bold shadow-sm shadow-indigo-500/5 select-none mt-2">
              <Coins className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
              <span>Current Balance: </span>
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {user.creditsBalance} credits
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory md:mx-0 md:px-0 scrollbar-none max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.id === 'credits-growth';
              const features = getPlanFeatures(plan.credits);

              return (
                <Card
                  key={plan.id}
                  className={`relative bg-zinc-950/40 backdrop-blur-md border ${
                    isPopular ? 'border-indigo-500/70 shadow-2xl scale-100 md:scale-105 bg-zinc-950/80 z-10' : 'border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/10'
                  } transition-all duration-300 rounded-2xl overflow-hidden min-w-[240px] sm:min-w-[320px] md:min-w-0 flex-1 shrink-0 md:shrink snap-center flex flex-col justify-between`}
                >
                  <CardHeader className="text-center p-5 pb-3 pt-7">
                    <CardTitle className="text-xl font-extrabold text-zinc-100">{plan.name}</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">{plan.description}</CardDescription>
                    <div className="mt-4 flex items-baseline justify-center gap-1">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-100">${plan.price}</span>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider"> one-time</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-3 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2.5 mb-6">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-zinc-300">
                          <Check className="h-4.5 w-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full py-5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all duration-200 ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:-translate-y-0.5'
                      }`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        `Buy ${plan.credits.toLocaleString()} Credits`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center max-w-xl mx-auto bg-zinc-950/40 backdrop-blur-md border border-zinc-900 p-6 rounded-2xl shadow-sm mb-14 sm:mb-0">
          <h3 className="text-lg font-bold text-zinc-200 mb-1.5 tracking-tight">Need bulk credits?</h3>
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
            We provide tailored credit bundles for enterprise integration, large data volumes, and multi-tenant deployments.
          </p>
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-zinc-100 border border-zinc-800 rounded-xl text-xs font-bold py-5 px-6 shadow-sm transition-all duration-200">
            Contact Enterprise Sales
          </Button>
        </div>
      </main>
    </div>
  );
}
