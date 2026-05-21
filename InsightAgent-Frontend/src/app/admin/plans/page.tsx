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
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading billing configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-900/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            Credit Plans & Ledger
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium">
            Manage user balances and view active pay-as-you-go credit packages
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadPlans} 
          className="self-start sm:self-auto gap-2 border-zinc-900 bg-zinc-950/40 hover:bg-accent text-zinc-300 rounded-xl hover:border-zinc-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Plans
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-indigo-950/20 backdrop-blur-sm border border-indigo-500/20 overflow-hidden relative rounded-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
        <CardContent className="p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0 border border-indigo-500/20 shadow-inner">
            <Info className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-300 text-base">Credit-Based Pay-As-You-Go Architecture</h4>
            <p className="text-sm text-indigo-200/70 mt-1.5 leading-relaxed max-w-4xl font-medium">
              InsightAgent has successfully migrated from a legacy tiered subscription model to a streamlined, credit-based, 
              pay-as-you-go system. Users buy tokens to generate agentic insights, with no recurring or periodic subscription contracts.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-12">
        {/* Active Credit Packs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary animate-pulse-glow rounded-full" />
            <h2 className="text-xl font-extrabold text-zinc-100">Active Credit Packages</h2>
          </div>
          
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
            {plans.map((plan) => {
              const isPopular = plan.id === 'credits-growth';
              return (
                <Card 
                  key={plan.id} 
                  className={`flex flex-col relative overflow-hidden transition-all duration-300 rounded-2xl backdrop-blur-md ${
                    isPopular 
                      ? 'border-indigo-500/70 bg-zinc-950/80 shadow-2xl scale-[1.02] z-10' 
                      : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800/80 hover:bg-zinc-900/10'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 z-10">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 uppercase tracking-wide">
                        <Sparkles className="h-2.5 w-2.5 animate-spin" style={{ animationDuration: '3s' }} /> Popular
                      </span>
                    </div>
                  )}
                  <CardHeader className="p-5 pb-3">
                    <Badge 
                      variant={isPopular ? "default" : "secondary"} 
                      className={`w-fit text-[9px] font-extrabold uppercase tracking-wider mb-2 ${
                        isPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60'
                      }`}
                    >
                      {plan.id.split('-')[1]} pack
                    </Badge>
                    <CardTitle className="text-lg font-extrabold truncate text-zinc-100">{plan.name}</CardTitle>
                    <CardDescription className="text-xs text-zinc-400 min-h-[36px] line-clamp-2 mt-1 leading-normal">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 mt-auto flex flex-col gap-4">
                    <div className="bg-zinc-900/40 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between border border-zinc-900/60">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <CoinsIcon className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs font-semibold">Tokens Included</span>
                      </div>
                      <span className="text-base font-black text-indigo-400">
                        {plan.credits.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xs text-zinc-500 font-semibold">Package Price</span>
                      <span className="text-2xl font-black text-zinc-100">${plan.price}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-900 p-5 mt-4 rounded-2xl">
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
            <User className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-xl font-extrabold text-zinc-100">User Ledger Balancer</h2>
          </div>

          <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-md overflow-hidden rounded-2xl">
            <CardHeader className="pb-4 border-b border-zinc-900/60">
              <CardTitle className="text-lg font-bold text-zinc-100">Search & Adjust Balance</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Search a user by email to instantly modify their credit balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-5">
              {/* Search Form */}
              <form onSubmit={handleSearchUser} className="space-y-2">
                <Label htmlFor="searchEmail" className="text-xs font-bold text-zinc-400">User Email Address</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="searchEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="pl-9 bg-zinc-950/50 backdrop-blur-sm border-zinc-900 h-11 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary focus-visible:border-zinc-800 rounded-xl"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={searching} 
                    className="gap-2 h-11 font-bold px-5 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:opacity-95 shadow-md shadow-primary/10 rounded-xl transition-all duration-200"
                  >
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
                <div className="space-y-6 pt-4 border-t border-zinc-900/60 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Found User Info Card */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-12 w-12 bg-indigo-500/[0.02] rounded-full blur-md pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-100 text-sm">
                          {foundUser.name || 'Anonymous User'}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate max-w-[220px] mt-0.5">
                          {foundUser.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-indigo-500/20 text-indigo-400 bg-indigo-500/5 text-[10px] font-bold">
                        Verified
                      </Badge>
                    </div>

                    <Separator className="bg-zinc-900/40" />

                    <div className="flex justify-between items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900/40">
                      <span className="text-xs text-zinc-500 font-semibold">Current Balance</span>
                      <div className="flex items-center gap-1.5 font-black text-zinc-200 text-sm">
                        <Coins className="h-4 w-4 text-amber-500 animate-pulse" />
                        <span>{foundUser.creditsBalance} credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Adjustments Panel */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-zinc-400">Adjustment Method</Label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900/40 backdrop-blur-sm rounded-xl border border-zinc-900 h-11 items-center">
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('add')}
                          className={`h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                            adjustmentType === 'add'
                              ? 'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md shadow-primary/10'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          }`}
                        >
                          Add Credits
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentType('set')}
                          className={`h-9 rounded-lg text-xs font-bold transition-all duration-200 ${
                            adjustmentType === 'set'
                              ? 'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md shadow-primary/10'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                          }`}
                        >
                          Override Total
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adjustAmount" className="text-xs font-bold text-zinc-400">
                        {adjustmentType === 'add' ? 'Credits to Add' : 'New Total Balance'}
                      </Label>
                      <Input
                        id="adjustAmount"
                        type="number"
                        min="0"
                        placeholder={adjustmentType === 'add' ? 'e.g. 50' : 'e.g. 100'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-zinc-950/50 backdrop-blur-sm border-zinc-900 h-11 text-zinc-100 focus-visible:ring-primary focus-visible:border-zinc-800 rounded-xl"
                      />
                    </div>

                    <Button
                      onClick={handleUpdateCredits}
                      disabled={isUpdatingCredits || amount === ''}
                      className="w-full gap-2 font-bold h-12 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground hover:opacity-95 rounded-xl transition-all duration-200 shadow-md shadow-primary/10 animate-pulse-glow"
                    >
                      {isUpdatingCredits ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4.5 w-4.5" />
                      )}
                      {adjustmentType === 'add' ? 'Add Credits' : 'Override Balance'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-zinc-900 rounded-2xl p-8 text-center text-zinc-500 text-xs leading-relaxed">
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
