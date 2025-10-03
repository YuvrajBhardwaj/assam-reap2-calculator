import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

type UserRole = 'user' | 'admin' | 'department';

const RoleSwitcher = () => {
  const { userRole, simpleLogin } = useAuth();

  const handleRoleSwitch = (role: UserRole) => {
    simpleLogin(role);
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'department':
        return 'Department';
      case 'user':
      default:
        return 'Public';
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-800">
            Dev Role: {getRoleDisplayName(userRole)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={userRole === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoleSwitch('admin')}
            className={`${
              userRole === 'admin'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
            }`}
          >
            As Admin
          </Button>
          <Button
            variant={userRole === 'department' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleRoleSwitch('department')}
            className={`${
              userRole === 'department'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white'
            }`}
          >
            As Department
          </Button>
          <Button
            variant={userRole === 'user' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => handleRoleSwitch('user')}
            className={`${
              userRole === 'user'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
            }`}
          >
            As Public
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;