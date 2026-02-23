'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Brain, Check, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface TierLimits {
  maxProjects: number;
  maxQueriesPerMonth: number;
  maxFileSizeMB: number;
  dataRetentionDays: number;
}

interface Plan {
  tier: string;
  limits: TierLimits;
  price: number;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/subscription/plans');
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierDescription = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'Perfect for getting started';
      case 'PRO':
        return 'For growing teams';
      case 'ENTERPRISE':
        return 'For large organizations';
      default:
        return '';
    }
  };

  const getTierFeatures = (plan: Plan) => {
    const features = [
      plan.limits.maxProjects === -1
        ? 'Unlimited projects'
        : `${plan.limits.maxProjects} projects`,
      plan.limits.maxQueriesPerMonth === -1
        ? 'Unlimited queries'
        : `${plan.limits.maxQueriesPerMonth.toLocaleString()} queries per month`,
      `${plan.limits.maxFileSizeMB} MB file uploads`,
      plan.limits.dataRetentionDays === -1
        ? 'Unlimited data retention'
        : `${plan.limits.dataRetentionDays} days data retention`,
    ];

    if (plan.tier === 'FREE') {
      features.push('Community support');
    } else if (plan.tier === 'PRO') {
      features.push('Priority email support', 'Advanced analytics');
    } else if (plan.tier === 'ENTERPRISE') {
      features.push('Dedicated support', 'Custom integrations', 'SLA guarantee');
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">InsightAgent</h1>
              <p className="text-xs text-muted-foreground">Agentic Business Intelligence</p>
            </div>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
          {user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Current plan: <span className="font-semibold text-primary">{user.tier}</span>
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isPopular = plan.tier === 'PRO';
              const features = getTierFeatures(plan);

              return (
                <Card
                  key={plan.tier}
                  className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{plan.tier}</CardTitle>
                    <CardDescription>{getTierDescription(plan.tier)}</CardDescription>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      disabled={user?.tier === plan.tier}
                    >
                      {user?.tier === plan.tier
                        ? 'Current Plan'
                        : plan.price === 0
                        ? 'Get Started'
                        : 'Contact Admin'}
                    </Button>
                    {plan.price > 0 && (
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        Contact your administrator to upgrade
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Need a custom plan?</h3>
          <p className="text-muted-foreground mb-6">
            Contact us for enterprise solutions with custom features and dedicated support.
          </p>
          <Button size="lg" variant="outline">
            Contact Sales
          </Button>
        </div>
      </main>
    </div>
  );
}
