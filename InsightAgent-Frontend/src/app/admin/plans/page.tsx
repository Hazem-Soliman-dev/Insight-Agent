'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  Search, 
  Sparkles, 
  Info, 
  Plus, 
  User, 
  Lock,
  Loader2,
  RefreshCw,
  CoinsIcon
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

interface UserSearchResult {
  id: string;
  name: string | null;
  email: string;
  creditsBalance: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Quick Credit Assignment state
  const [userEmail, setUserEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserSearchResult | null>(null);
  
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'set'>('add');
  const [amount, setAmount] = useState<string>('');
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);

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

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail.trim()) {
      toast.error('Please enter a user email to search');
      return;
    }

    setSearching(true);
    setFoundUser(null);
    try {
      const { data } = await api.get(`/users?search=${encodeURIComponent(userEmail.trim())}&limit=1`);
      if (!data.users || data.users.length === 0) {
        toast.error('No user found matching that email');
        return;
      }
      
      const user = data.users[0];
      setFoundUser({
        id: user.id,
        name: user.name,
        email: user.email,
        creditsBalance: user.creditsBalance,
      });
      toast.success('User found successfully');
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for user');
    } finally {
      setSearching(false);
    }
  };

  const handleUpdateCredits = async () => {
    if (!foundUser) return;
    
    const parsedAmount = parseInt(amount) || 0;

    if (parsedAmount <= 0 && adjustmentType === 'add') {
      toast.error('Please enter a positive amount of credits to add');
      return;
    }

    if (parsedAmount < 0 && adjustmentType === 'set') {
      toast.error('Credit balance cannot be set to a negative value');
      return;
    }

    setIsUpdatingCredits(true);
    try {
      const newCredits = adjustmentType === 'add' 
        ? foundUser.creditsBalance + parsedAmount 
        : parsedAmount;

      await api.patch(`/users/${foundUser.id}/credits`, { credits: newCredits });
      
      toast.success(`Updated credits for ${foundUser.email} to ${newCredits}`);
      
      // Update foundUser state with new balance
      setFoundUser({
        ...foundUser,
        creditsBalance: newCredits,
      });
      
      setAmount('');
    } catch (error) {
      console.error('Update credits error:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to update user credits');
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading dashboard configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Credit Plans & Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user balances and view active pay-as-you-go credit packages
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPlans} className="self-start md:self-auto gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Plans
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-indigo-950/20 border-indigo-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
        <CardContent className="p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-indigo-300 text-base">Credit-Based Pay-As-You-Go Architecture</h4>
            <p className="text-sm text-indigo-200/80 mt-1 max-w-3xl leading-relaxed">
              InsightAgent has successfully migrated from a legacy tiered subscription model to a streamlined, credit-based, 
              pay-as-you-go system. Users buy tokens to generate agentic insights, with no recurring or periodic subscription contracts.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Active Credit Packs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Active Credit Packages</h2>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => {
              const isPopular = plan.id === 'credits-growth';
              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    isPopular ? 'border-primary bg-primary/5 ring-1 ring-primary/20 scale-[1.02]' : 'border-zinc-800 bg-zinc-950/20'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="p-4 pb-2">
                    <Badge variant={isPopular ? "default" : "secondary"} className="w-fit text-[10px] font-semibold uppercase tracking-wider mb-2">
                      {plan.id.split('-')[1]} pack
                    </Badge>
                    <CardTitle className="text-lg font-bold truncate text-zinc-100">{plan.name}</CardTitle>
                    <CardDescription className="text-xs text-zinc-400 min-h-[32px] line-clamp-2 mt-1">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 mt-auto flex flex-col gap-4">
                    <div className="bg-zinc-900/50 rounded-lg p-2.5 flex items-center justify-between border border-zinc-800/40">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <CoinsIcon className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-semibold">Tokens</span>
                      </div>
                      <span className="text-base font-extrabold text-indigo-400">
                        {plan.credits.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-2xl font-black text-zinc-100">${plan.price}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-zinc-950/40 border-zinc-800/80 p-5 mt-4">
            <div className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
              <Lock className="h-4 w-4 text-amber-500/80 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-300">Gateway Synchronization: </span>
                These credit packs are hardcoded in the NestJS service backend and map directly to Stripe/Polar Sandbox products. 
                Any modifications to their configurations must be done in the backend&apos;s codebase and checkout environment variables.
              </div>
            </div>
          </Card>
        </div>

        {/* User Balance Adjustment */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Quick User Balance Adjuster</h2>
          </div>

          <Card className="border-zinc-800 bg-zinc-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Search & Adjust Balance</CardTitle>
              <CardDescription>
                Search a user by email to instantly modify their credit balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Form */}
              <form onSubmit={handleSearchUser} className="space-y-2">
                <Label htmlFor="searchEmail">User Email Address</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="pl-9 bg-zinc-900/50 border-zinc-800"
                    />
                  </div>
                  <Button type="submit" disabled={searching} className="gap-2">
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </form>

              {/* Search Result & Adjustments */}
              {foundUser ? (
                <div className="space-y-6 pt-4 border-t border-zinc-800/80 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Found User Info Card */}
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">
                          {foundUser.name || 'Anonymous User'}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {foundUser.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
                        Found
                      </Badge>
                    </div>

                    <Separator className="bg-zinc-800/50" />

                    <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800/40">
                      <span className="text-xs text-muted-foreground">Current Balance</span>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                        <Coins className="h-4 w-4 text-amber-500" />
                        <span>{foundUser.creditsBalance} credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Adjustments Panel */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Adjustment Method</Label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/80 rounded-lg border border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('add')}
                          className={`py-1.5 rounded-md text-xs font-semibold transition-all ${
                            adjustmentType === 'add'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Add Credits
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('set')}
                          className={`py-1.5 rounded-md text-xs font-semibold transition-all ${
                            adjustmentType === 'set'
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Override Total
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjustAmount">
                        {adjustmentType === 'add' ? 'Credits to Add' : 'New Total Balance'}
                      </Label>
                      <Input
                        id="adjustAmount"
                        type="number"
                        min="0"
                        placeholder={adjustmentType === 'add' ? 'e.g. 50' : 'e.g. 100'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-zinc-900/50 border-zinc-800"
                      />
                    </div>

                    <Button
                      onClick={handleUpdateCredits}
                      disabled={isUpdatingCredits || amount === ''}
                      className="w-full gap-2 font-bold py-5"
                    >
                      {isUpdatingCredits ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {adjustmentType === 'add' ? 'Add Credits' : 'Override Balance'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-800/80 rounded-xl p-8 text-center text-muted-foreground text-sm">
                  Search for a user by email above to show options for updating their credit balance.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
