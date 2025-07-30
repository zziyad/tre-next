'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/frontend/hooks/useAuth';
import { UserRole } from '@/types';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface PermissionCategory {
  id: string;
  name: string;
  description: string;
}

export function PermissionManagementForm() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Sample categories
  const sampleCategories: PermissionCategory[] = [
    { id: 'events', name: 'Events', description: 'Event management permissions' },
    { id: 'users', name: 'Users', description: 'User management permissions' },
    { id: 'roles', name: 'Roles', description: 'Role management permissions' },
    { id: 'reports', name: 'Reports', description: 'Report management permissions' },
    { id: 'system', name: 'System', description: 'System-level permissions' }
  ];

  // Sample permissions
  const samplePermissions: Permission[] = [
    { id: 'events:read', name: 'View Events', description: 'Can view events', category: 'events', isActive: true },
    { id: 'events:create', name: 'Create Events', description: 'Can create new events', category: 'events', isActive: true },
    { id: 'events:edit', name: 'Edit Events', description: 'Can edit existing events', category: 'events', isActive: true },
    { id: 'events:delete', name: 'Delete Events', description: 'Can delete events', category: 'events', isActive: true },
    { id: 'users:read', name: 'View Users', description: 'Can view user list', category: 'users', isActive: true },
    { id: 'users:create', name: 'Create Users', description: 'Can register new users', category: 'users', isActive: true },
    { id: 'users:edit', name: 'Edit Users', description: 'Can edit user information', category: 'users', isActive: true },
    { id: 'users:delete', name: 'Delete Users', description: 'Can delete users', category: 'users', isActive: true },
    { id: 'roles:manage', name: 'Manage Roles', description: 'Can manage roles and permissions', category: 'roles', isActive: true },
    { id: 'reports:read', name: 'View Reports', description: 'Can view transport reports', category: 'reports', isActive: true },
    { id: 'reports:create', name: 'Create Reports', description: 'Can create transport reports', category: 'reports', isActive: true },
    { id: 'reports:edit', name: 'Edit Reports', description: 'Can edit transport reports', category: 'reports', isActive: true },
    { id: 'reports:delete', name: 'Delete Reports', description: 'Can delete transport reports', category: 'reports', isActive: true },
    { id: 'system:settings', name: 'System Settings', description: 'Can access system settings', category: 'system', isActive: true },
    { id: 'system:logs', name: 'View Logs', description: 'Can view system logs', category: 'system', isActive: false }
  ];

  useEffect(() => {
    setPermissions(samplePermissions);
    setCategories(sampleCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can manage permissions');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement API call to create/update permission
      if (editingPermission) {
        // Update existing permission
        const updatedPermissions = permissions.map(perm => 
          perm.id === editingPermission.id 
            ? { ...perm, ...formData }
            : perm
        );
        setPermissions(updatedPermissions);
        toast.success('Permission updated successfully');
      } else {
        // Create new permission
        const newPermission: Permission = {
          id: `${formData.category}:${formData.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...formData
        };
        setPermissions([...permissions, newPermission]);
        toast.success('Permission created successfully');
      }
      
      handleCancel();
    } catch (error) {
      toast.error('An error occurred while saving the permission');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      category: permission.category,
      isActive: permission.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (permissionId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete permissions');
      return;
    }

    try {
      // TODO: Implement API call to delete permission
      setPermissions(permissions.filter(p => p.id !== permissionId));
      toast.success('Permission deleted successfully');
    } catch (error) {
      toast.error('An error occurred while deleting the permission');
    }
  };

  const handleCancel = () => {
    setEditingPermission(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      category: '',
      isActive: true
    });
  };

  const togglePermissionStatus = async (permissionId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can modify permissions');
      return;
    }

    try {
      const updatedPermissions = permissions.map(perm => 
        perm.id === permissionId 
          ? { ...perm, isActive: !perm.isActive }
          : perm
      );
      setPermissions(updatedPermissions);
      toast.success('Permission status updated');
    } catch (error) {
      toast.error('An error occurred while updating the permission');
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (!isAdmin) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Access Restricted
          </CardTitle>
          <CardDescription className="text-orange-700">
            Only administrators can manage permissions. Your current role: {user?.role || 'User'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              {user?.role || 'User'}
            </Badge>
            <span className="text-sm text-orange-700">
              Contact an administrator to manage permissions
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Permission Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage system permissions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {/* Permission Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {editingPermission ? 'Edit Permission' : 'Create New Permission'}
            </CardTitle>
            <CardDescription>
              Define permission name, description, and category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permissionName">Permission Name *</Label>
                  <Input
                    id="permissionName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter permission name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permissionCategory">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permissionDescription">Description</Label>
                <Textarea
                  id="permissionDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter permission description"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : (editingPermission ? 'Update Permission' : 'Create Permission')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Permissions List */}
      <div className="space-y-6">
        <h4 className="font-medium">System Permissions</h4>
        
        {Object.entries(groupedPermissions).map(([category, perms]) => {
          const categoryInfo = categories.find(c => c.id === category);
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base">{categoryInfo?.name || category}</CardTitle>
                <CardDescription>{categoryInfo?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {perms.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{permission.name}</h5>
                          <Badge variant={permission.isActive ? "default" : "secondary"}>
                            {permission.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID: {permission.id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePermissionStatus(permission.id)}
                        >
                          {permission.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(permission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(permission.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{permissions.length}</div>
              <div className="text-sm text-muted-foreground">Total Permissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {permissions.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Permissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 