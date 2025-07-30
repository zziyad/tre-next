'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/frontend/hooks/useAuth';
import { UserRole } from '@/types';

interface UserRegistrationFormProps {
  onSuccess?: () => void;
}

export function UserRegistrationForm({ onSuccess }: UserRegistrationFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    role: 'USER',
    department: '',
    position: ''
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only administrators can register new users');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('User registered successfully');
        setFormData({
          name: '',
          surname: '',
          email: '',
          password: '',
          role: 'USER',
          department: '',
          position: ''
        });
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to register user');
      }
    } catch (error) {
      toast.error('An error occurred while registering the user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isAdmin) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Access Restricted
          </CardTitle>
          <CardDescription className="text-orange-700">
            Only administrators can register new users. Your current role: {user?.role || 'User'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              {user?.role || 'User'}
            </Badge>
            <span className="text-sm text-orange-700">
              Contact an administrator to register new users
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">First Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Enter first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="surname">Last Name *</Label>
          <Input
            id="surname"
            type="text"
            value={formData.surname}
            onChange={(e) => handleInputChange('surname', e.target.value)}
            required
            placeholder="Enter last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="Enter email address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            placeholder="Enter password"
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            type="text"
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            placeholder="Enter department"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            type="text"
            value={formData.position}
            onChange={(e) => handleInputChange('position', e.target.value)}
            placeholder="Enter position"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Administrator access required</span>
        </div>
        
        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {isLoading ? 'Registering...' : 'Register User'}
        </Button>
      </div>
    </form>
  );
} 