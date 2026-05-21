'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Trash2, ChevronLeft, ChevronRight, Loader2, Mail, Calendar, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
  queriesUsed: number;
  createdAt: string;
  _count: {
    projects: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [tierFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.append('search', search);
      if (tierFilter) params.append('tier', tierFilter);
      if (roleFilter) params.append('role', roleFilter);

      const { data } = await api.get(`/users?${params.toString()}`);
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, tierFilter, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleTierChange = async (userId: string, newTier: string) => {
    try {
      await api.patch(`/users/${userId}/tier`, { tier: newTier });
      toast.success('User tier updated successfully');
      loadUsers();
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to update tier');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      await api.delete(`/users/${deleteUserId}`);
      toast.success('User deleted successfully');
      setDeleteUserId(null);
      loadUsers();
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to delete user');
    }
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Retrieving user accounts database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-900/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium">
          Manage system users, access roles, and pay-as-you-go tiers
        </p>
      </div>

      {/* Filters Card */}
      <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-md overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-zinc-900/60 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4.5 w-4.5 text-primary animate-pulse" />
            <CardTitle className="text-base font-bold text-zinc-100">Search & Filtering</CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-400">
            Query users database by name, email, subscription tier, or security role
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-zinc-950/50 backdrop-blur-sm border-zinc-900 hover:border-zinc-800 h-11 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary focus-visible:border-zinc-800 rounded-xl"
              />
            </div>

            {/* Role Select */}
            <Select
              value={roleFilter}
              onValueChange={(value: string) => {
                setRoleFilter(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-zinc-950/50 backdrop-blur-sm border-zinc-900 hover:border-zinc-800 h-11 text-zinc-300 focus:ring-primary rounded-xl">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950/95 backdrop-blur-md border border-zinc-900 text-zinc-200 rounded-xl">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User Account</SelectItem>
                <SelectItem value="ADMIN">System Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Grid (Dual Presentation) */}
      <Card className="border-zinc-900 bg-zinc-950/40 backdrop-blur-md overflow-hidden rounded-2xl">
        {/* Desktop View Table (hidden on mobile, blocks on desktop) */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-zinc-950/60 backdrop-blur-sm border-b border-zinc-900/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 font-bold text-zinc-400">User Details</TableHead>
                <TableHead className="py-4 font-bold text-zinc-400">Access Role</TableHead>
                <TableHead className="py-4 font-bold text-zinc-400 text-center">Projects</TableHead>
                <TableHead className="py-4 font-bold text-zinc-400">Joined Date</TableHead>
                <TableHead className="py-4 font-bold text-zinc-400 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground font-medium">
                    No users matching these filters were found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-colors">
                    {/* User profile details */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-xs text-indigo-400 shadow-inner">
                          {getUserInitials(user.name, user.email)}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-100">{user.name || 'Anonymous'}</div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3 text-zinc-500" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role selector */}
                    <TableCell className="py-4">
                      <Select
                        value={user.role}
                        onValueChange={(value: string) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-28 bg-zinc-950/50 backdrop-blur-sm border-zinc-900 hover:border-zinc-800 text-xs h-8 text-zinc-300 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950/95 backdrop-blur-md border border-zinc-900 text-xs rounded-xl">
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    {/* Project counter badge */}
                    <TableCell className="py-4 text-center">
                      <Badge variant="secondary" className="bg-indigo-500/5 border-indigo-500/10 text-indigo-400 font-bold px-2.5 py-0.5 rounded-md">
                        {user._count.projects}
                      </Badge>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>

                    {/* Delete actions */}
                    <TableCell className="py-4 text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteUserId(user.id)}
                        className="hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all duration-200 rounded-lg"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View Card List (visible on mobile, hidden on desktop) */}
        <div className="block md:hidden p-4 space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">
              No users matching these filters were found.
            </div>
          ) : (
            users.map((user) => (
              <div 
                key={user.id} 
                className="p-4 border border-zinc-905 rounded-2xl bg-zinc-950/40 backdrop-blur-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-zinc-800/60"
              >
                {/* Background ambient accent */}
                <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/[0.015] rounded-full blur-lg pointer-events-none" />
                
                {/* Top: Avatar, Name, Email, Delete */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-xs text-indigo-400">
                      {getUserInitials(user.name, user.email)}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-100">{user.name || 'Anonymous'}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-zinc-500" />
                        <span className="truncate max-w-[150px]">{user.email}</span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteUserId(user.id)}
                    className="hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors rounded-lg -mt-1 -mr-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stats Badges */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-2 flex items-center justify-between px-3">
                    <span className="text-zinc-500 font-semibold">Projects</span>
                    <span className="font-extrabold text-indigo-400">{user._count.projects}</span>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-2 flex items-center justify-between px-3">
                    <span className="text-zinc-500 font-semibold">Queries</span>
                    <span className="font-extrabold text-cyan-400">{user.queriesUsed}</span>
                  </div>
                </div>

                {/* Selectors Block (Tier & Role selectors stacked side-by-side) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Tier Ledger</span>
                    <Select
                      value={user.tier}
                      onValueChange={(value: string) => handleTierChange(user.id, value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-950/50 backdrop-blur-sm border-zinc-900 text-xs h-9 text-zinc-300 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950/95 backdrop-blur-md border border-zinc-900 text-xs rounded-xl">
                        <SelectItem value="FREE">Free</SelectItem>
                        <SelectItem value="PRO">Pro</SelectItem>
                        <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Access Role</span>
                    <Select
                      value={user.role}
                      onValueChange={(value: string) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-full bg-zinc-950/50 backdrop-blur-sm border-zinc-900 text-xs h-9 text-zinc-300 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950/95 backdrop-blur-md border border-zinc-900 text-xs rounded-xl">
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Joined Date Footer */}
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-2 border-t border-zinc-900/40 justify-end">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-zinc-900 bg-zinc-950/40 hover:bg-accent text-zinc-300 rounded-xl hover:border-zinc-850"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </Button>
          <span className="text-xs font-semibold text-muted-foreground bg-zinc-950/50 backdrop-blur-sm border border-zinc-900/60 px-3.5 py-1.5 rounded-full shadow-inner">
            Page <span className="font-extrabold text-zinc-200">{page}</span> of <span className="font-extrabold text-zinc-200">{totalPages}</span>
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-zinc-900 bg-zinc-950/40 hover:bg-accent text-zinc-300 rounded-xl hover:border-zinc-850"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="bg-zinc-950/90 backdrop-blur-md border border-zinc-900 rounded-2xl p-6 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100 font-extrabold text-lg">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm">
              This action cannot be undone. This will permanently delete the user account, along with all associated project data directories, datasets, and API statistics from our database servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-300 rounded-xl font-semibold">
              Cancel Operations
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold px-5"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
