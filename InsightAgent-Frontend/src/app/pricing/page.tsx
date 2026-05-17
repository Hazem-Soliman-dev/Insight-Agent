'use client';

import { useEffect, useState } from 'react';
import { Check, Sparkles, Loader2, Coins } from 'lucide-react';
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
      toast.error('Failed to connect to Stripe checkout. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
      {/* Unified Premium Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Pricing Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Transparent Pay-As-You-Go Credits</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Purchase credit packs to execute agentic data analysis. Zero monthly subscriptions or recurring fees.
          </p>
          {user && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Coins className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Current balance: </span>
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.id === 'credits-growth';
              const features = getPlanFeatures(plan.credits);

              return (
                <Card
                  key={plan.id}
                  className={`relative bg-zinc-950/40 border ${
                    isPopular ? 'border-indigo-500 shadow-2xl scale-105 bg-zinc-950/80' : 'border-zinc-800'
                  } transition-all duration-300 hover:shadow-xl`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg shadow-indigo-600/30">
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2 font-extrabold text-zinc-100">{plan.name}</CardTitle>
                    <CardDescription className="text-zinc-400">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-black tracking-tight text-zinc-100">${plan.price}</span>
                      <span className="text-muted-foreground text-sm font-medium"> one-time</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-zinc-300">
                          <Check className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full py-6 text-base font-bold shadow-md ${
                        isPopular
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800'
                      }`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

        <div className="mt-16 text-center max-w-2xl mx-auto bg-zinc-950/20 border border-zinc-800 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-zinc-100 mb-2">Need bulk credits?</h3>
          <p className="text-zinc-400 mb-6">
            We provide tailored credit bundles for enterprise integration, large data volumes, and multi-tenant deployments.
          </p>
          <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800">
            Contact Enterprise Sales
          </Button>
        </div>
      </main>
    </div>
  );
}
