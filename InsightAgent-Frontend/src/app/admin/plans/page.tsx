'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Database, Zap, HardDrive, Calendar, Search, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

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

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Plan>>({});
  const [userEmail, setUserEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/subscription/plans');
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.tier);
    setEditValues(plan);
  };

  const handleSave = async (tier: string) => {
    try {
      await api.put(`/subscription/plans/${tier}`, editValues);
      toast.success('Plan updated successfully');
      setEditingPlan(null);
      loadPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditValues({});
  };

  const handleAssignTier = async () => {
    if (!userEmail || !selectedTier) {
      toast.error('Please enter an email and select a tier');
      return;
    }

    setIsAssigning(true);
    try {
      // First find the user by email
      const { data: usersData } = await api.get(`/users?search=${userEmail}&limit=1`);
      if (!usersData.users || usersData.users.length === 0) {
        toast.error('User not found');
        return;
      }

      const userId = usersData.users[0].id;
      await api.patch(`/users/${userId}/tier`, { tier: selectedTier });
      toast.success(`Assigned ${selectedTier} tier to ${userEmail}`);
      setUserEmail('');
      setSelectedTier('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign tier');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground mt-1">
          Manage plan limits, pricing, and user tier assignments
        </p>
      </div>

      {/* Quick Assign Offer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Assign Tier
          </CardTitle>
          <CardDescription>Assign a subscription tier to a user by email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="userEmail">User Email</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userEmail"
                  placeholder="user@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="tier">Tier</Label>
              <select
                id="tier"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select tier</option>
                {plans.map((plan) => (
                  <option key={plan.tier} value={plan.tier}>
                    {plan.tier}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAssignTier} disabled={isAssigning}>
                {isAssigning ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isEditing = editingPlan === plan.tier;
          const currentValues = isEditing ? editValues : plan;

          return (
            <Card key={plan.tier} className={isEditing ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.tier}</CardTitle>
                  <Badge variant={plan.tier === 'ENTERPRISE' ? 'default' : 'secondary'}>
                    {plan.tier === 'FREE' ? 'Free' : plan.tier === 'PRO' ? 'Popular' : 'Premium'}
                  </Badge>
                </div>
                <CardDescription>
                  {plan.tier === 'FREE' && 'Perfect for getting started'}
                  {plan.tier === 'PRO' && 'For growing teams'}
                  {plan.tier === 'ENTERPRISE' && 'For large organizations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    Price ($/month)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentValues.price || 0}
                      onChange={(e) =>
                        setEditValues({ ...editValues, price: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-2xl font-bold mt-1">${plan.price}</div>
                  )}
                </div>

                <Separator />

                {/* Max Projects */}
                <div>
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Max Projects
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentValues.limits?.maxProjects || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          limits: {
                            ...editValues.limits!,
                            maxProjects: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                      placeholder="-1 for unlimited"
                    />
                  ) : (
                    <div className="font-medium mt-1">
                      {plan.limits.maxProjects === -1 ? 'Unlimited' : plan.limits.maxProjects}
                    </div>
                  )}
                </div>

                {/* Max Queries */}
                <div>
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    Max Queries/Month
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentValues.limits?.maxQueriesPerMonth || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          limits: {
                            ...editValues.limits!,
                            maxQueriesPerMonth: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                      placeholder="-1 for unlimited"
                    />
                  ) : (
                    <div className="font-medium mt-1">
                      {plan.limits.maxQueriesPerMonth === -1
                        ? 'Unlimited'
                        : plan.limits.maxQueriesPerMonth.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Max File Size */}
                <div>
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    Max File Size (MB)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentValues.limits?.maxFileSizeMB || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          limits: {
                            ...editValues.limits!,
                            maxFileSizeMB: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <div className="font-medium mt-1">{plan.limits.maxFileSizeMB} MB</div>
                  )}
                </div>

                {/* Data Retention */}
                <div>
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Data Retention (days)
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={currentValues.limits?.dataRetentionDays || 0}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          limits: {
                            ...editValues.limits!,
                            dataRetentionDays: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="mt-1"
                      placeholder="-1 for unlimited"
                    />
                  ) : (
                    <div className="font-medium mt-1">
                      {plan.limits.dataRetentionDays === -1
                        ? 'Unlimited'
                        : `${plan.limits.dataRetentionDays} days`}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(plan.tier)} className="flex-1">
                      Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleEdit(plan)} variant="outline" className="w-full">
                    Edit Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
