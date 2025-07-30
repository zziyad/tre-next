'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/frontend/hooks/useAuth';
import { UserRole } from '@/types';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault?: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export function RoleManagementForm() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  // Sample permissions - in a real app, these would come from the backend
  const samplePermissions: Permission[] = [
    { id: 'events:read', name: 'View Events', description: 'Can view events', category: 'Events' },
    { id: 'events:create', name: 'Create Events', description: 'Can create new events', category: 'Events' },
    { id: 'events:edit', name: 'Edit Events', description: 'Can edit existing events', category: 'Events' },
    { id: 'events:delete', name: 'Delete Events', description: 'Can delete events', category: 'Events' },
    { id: 'users:read', name: 'View Users', description: 'Can view user list', category: 'Users' },
    { id: 'users:create', name: 'Create Users', description: 'Can register new users', category: 'Users' },
    { id: 'users:edit', name: 'Edit Users', description: 'Can edit user information', category: 'Users' },
    { id: 'users:delete', name: 'Delete Users', description: 'Can delete users', category: 'Users' },
    { id: 'roles:manage', name: 'Manage Roles', description: 'Can manage roles and permissions', category: 'Roles' },
    { id: 'reports:read', name: 'View Reports', description: 'Can view transport reports', category: 'Reports' },
    { id: 'reports:create', name: 'Create Reports', description: 'Can create transport reports', category: 'Reports' },
    { id: 'reports:edit', name: 'Edit Reports', description: 'Can edit transport reports', category: 'Reports' },
    { id: 'reports:delete', name: 'Delete Reports', description: 'Can delete transport reports', category: 'Reports' },
  ];

  useEffect(() => {
    // Load sample roles
    setRoles([
      {
        id: '1',
        name: 'SUPER_ADMIN',
        description: 'Full system access with all permissions',
        permissions: samplePermissions.map(p => p.id),
        isDefault: true
      },
      {
        id: '2',
        name: 'ADMIN',
        description: 'Administrative access with most permissions',
        permissions: samplePermissions.filter(p => !p.id.includes('roles:')).map(p => p.id)
      },
      {
        id: '3',
        name: 'MANAGER',
        description: 'Manager access with event and report permissions',
        permissions: samplePermissions.filter(p => p.id.includes('events:') || p.id.includes('reports:')).map(p => p.id)
      },
      {
        id: '4',
        name: 'USER',
        description: 'Basic user access with limited permissions',
        permissions: samplePermissions.filter(p => p.id.includes('read')).map(p => p.id)
      }
    ]);
    setPermissions(samplePermissions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can manage roles');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement API call to create/update role
      if (editingRole) {
        // Update existing role
        const updatedRoles = roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...formData }
            : role
        );
        setRoles(updatedRoles);
        toast.success('Role updated successfully');
      } else {
        // Create new role
        const newRole: Role = {
          id: Date.now().toString(),
          ...formData
        };
        setRoles([...roles, newRole]);
        toast.success('Role created successfully');
      }
      
      handleCancel();
    } catch (error) {
      toast.error('An error occurred while saving the role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    if (!isAdmin) {
      toast.error('Only administrators can delete roles');
      return;
    }

    const role = roles.find(r => r.id === roleId);
    if (role?.isDefault) {
      toast.error('Cannot delete default roles');
      return;
    }

    try {
      // TODO: Implement API call to delete role
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    } catch (error) {
      toast.error('An error occurred while deleting the role');
    }
  };

  const handleCancel = () => {
    setEditingRole(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
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
            Only administrators can manage roles. Your current role: {user?.role || 'User'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              {user?.role || 'User'}
            </Badge>
            <span className="text-sm text-orange-700">
              Contact an administrator to manage roles
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
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage user roles with specific permissions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Role Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </CardTitle>
            <CardDescription>
              Define role name, description, and associated permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter role name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description</Label>
                  <Input
                    id="roleDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        <h4 className="font-medium">Existing Roles</h4>
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {role.name}
                      {role.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!role.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(role.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Permissions ({role.permissions.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 5).map((permId) => {
                      const permission = permissions.find(p => p.id === permId);
                      return permission ? (
                        <Badge key={permId} variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      ) : null;
                    })}
                    {role.permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 