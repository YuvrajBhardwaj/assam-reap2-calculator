import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import { ApiService, AddUserRequest } from '../../services/adminService';
import { toast } from 'sonner';
import { getAuditLogs, logAuditEvent } from '../../services/masterDataService';
import type { AuditLog } from '@/types/masterData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const UserManagement = () => {
  const { token, loginId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddUserRequest>({
    loginId: '',
    loginPwd: '',
    salutation: '',
    firstName: '',
    lastName: '',
    departmentCode: '',
    zoneCode: '',
    designation: '',
    roleCodes: ['10001']
  });
  const [userLogs, setUserLogs] = useState<AuditLog[]>([]);

  const fetchUserLogs = async () => {
    try {
      const logs = await getAuditLogs('User');
      setUserLogs(logs);
    } catch (error) {
      console.error('Failed to fetch user logs', error);
    }
  };

  useEffect(() => {
    fetchUserLogs();
  }, []);

  const handleInputChange = (field: keyof AddUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.addUser(formData, token);
      toast.success(response);

      // Log the audit event
      if (loginId) {
        await logAuditEvent({
          entityType: 'User',
          entityId: formData.loginId,
          action: 'CREATE',
          performedBy: loginId,
          details: { ...formData, loginPwd: '[REDACTED]' },
        });
      }

      // Reset form and refresh logs
      setFormData({
        loginId: '',
        loginPwd: '',
        salutation: '',
        firstName: '',
        lastName: '',
        departmentCode: '',
        zoneCode: '',
        designation: '',
        roleCodes: ['10001']
      });
      fetchUserLogs();
    } catch (error) {
      toast.error('Failed to add user');
      console.error('Add user error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loginId">Login ID</Label>
                <Input
                  id="loginId"
                  value={formData.loginId}
                  onChange={(e) => handleInputChange('loginId', e.target.value)}
                  placeholder="Enter login ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loginPwd">Password</Label>
                <Input
                  id="loginPwd"
                  type="password"
                  value={formData.loginPwd}
                  onChange={(e) => handleInputChange('loginPwd', e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salutation">Salutation</Label>
                <Select onValueChange={(value) => handleInputChange('salutation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentCode">Department Code</Label>
                <Input
                  id="departmentCode"
                  value={formData.departmentCode}
                  onChange={(e) => handleInputChange('departmentCode', e.target.value)}
                  placeholder="Enter department code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneCode">Zone Code</Label>
                <Input
                  id="zoneCode"
                  value={formData.zoneCode}
                  onChange={(e) => handleInputChange('zoneCode', e.target.value)}
                  placeholder="Enter zone code"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Enter designation"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Adding User...' : 'Add User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.performedBy}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <pre className="text-xs">{JSON.stringify(log.details, null, 2)}</pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};