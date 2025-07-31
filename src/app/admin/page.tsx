'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/layout/Container';
import { toast } from 'sonner';
import { Loader2, Users, Shield, Settings, Activity, ArrowLeft, Plus, UserCheck, UserX } from 'lucide-react';

interface User {
  user_id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  permissions: string[];
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPermissions: number;
  recentActivity: number;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats'),
      ]);

      if (!usersResponse.ok) {
        if (usersResponse.status === 401) {
          router.push('/login');
          return;
        }
        if (usersResponse.status === 403) {
          toast.error('Insufficient permissions');
          router.push('/dashboard');
          return;
        }
        throw new Error('Failed to fetch admin data');
      }

      const usersData = await usersResponse.json();
      const statsData = await statsResponse.json();

      if (usersData.success) {
        setUsers(usersData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users, permissions, and system settings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">
                Deactivated accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPermissions}</div>
              <p className="text-xs text-muted-foreground">
                Available permissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">Manage</Badge>
            </div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Create, edit, and manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Add new users, assign permissions, and control access to the system.
            </p>
            <Button className="w-full" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        {/* Permission Management */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/permissions')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Shield className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">Configure</Badge>
            </div>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>
              Configure system permissions and default access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage available permissions and set default permissions for new users.
            </p>
            <Button className="w-full" variant="outline">
              Manage Permissions
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/settings')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Settings className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">Configure</Badge>
            </div>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Configure system-wide settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage system configuration, defaults, and global settings.
            </p>
            <Button className="w-full" variant="outline">
              System Settings
            </Button>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/activity')}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-orange-600" />
              <Badge variant="secondary">Monitor</Badge>
            </div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              View system activity and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Monitor user activities, admin actions, and system events.
            </p>
            <Button className="w-full" variant="outline">
              View Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Plus className="h-8 w-8 text-indigo-600" />
              <Badge variant="secondary">Quick</Badge>
            </div>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Create New User
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/admin/permissions')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Manage Permissions
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => router.push('/admin/activity')}
            >
              <Activity className="mr-2 h-4 w-4" />
              View Activity Log
            </Button>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-gray-600" />
              <Badge variant="secondary">Recent</Badge>
            </div>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Latest user registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.slice(0, 3).map((user) => (
              <div key={user.user_id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
} 