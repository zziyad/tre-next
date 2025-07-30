'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Shield, 
  Users, 
  Settings, 
  Key,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/DefaultLayout';
import { useAuth } from '@/frontend/hooks/useAuth';
import { toast } from 'sonner';
import { UserRegistrationForm } from '@/components/settings/UserRegistrationForm';
import { RoleManagementForm } from '@/components/settings/RoleManagementForm';
import { PermissionManagementForm } from '@/components/settings/PermissionManagementForm';
import { UserRole } from '@/types';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('registration');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user has admin permissions
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <DefaultLayout
      title="Settings"
      subtitle="Manage users, roles, and permissions"
      showSidebar={false}
      showMenuToggle={false}
    >
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage system configuration and user access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {user.role || 'User'}
            </Badge>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Registration</span>
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Roles</span>
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Permissions</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Registration Tab */}
          <TabsContent value="registration" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Registration
                </CardTitle>
                <CardDescription>
                  Register new users to the system. Only administrators can register new users.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserRegistrationForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="roles" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage user roles with specific permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RoleManagementForm />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Permissions Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="permissions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Permission Management
                  </CardTitle>
                  <CardDescription>
                    Configure system permissions and access controls.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PermissionManagementForm />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Users Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    View and manage all system users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserManagementList />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DefaultLayout>
  );
}

// User Management List Component
function UserManagementList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // TODO: Implement user fetching and management
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Users</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
      
      <div className="border rounded-lg">
        <div className="p-4 text-center text-muted-foreground">
          User management functionality coming soon...
        </div>
      </div>
    </div>
  );
} 