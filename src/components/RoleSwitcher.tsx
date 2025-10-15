// components/RoleSwitcher.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// These are the REAL roles from your AuthContext
type RealUserRole = 
  | 'ROLE_NormalUser'
  | 'ROLE_ADMIN'
  | 'ROLE_Manager'; // Using ROLE_Manager as representative for department

const RoleSwitcher = () => {
  const { userRole, simpleLogin } = useAuth();

  // Map real roles to display names
  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_Manager':
      case 'ROLE_JuniorManager':
      case 'ROLE_SeniorManager':
        return 'Department';
      case 'ROLE_NormalUser':
      default:
        return 'Public';
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-amber-800">
            Dev Role: {getRoleDisplayName()}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => simpleLogin('ROLE_ADMIN')}
            className={`${
              userRole === 'ROLE_ADMIN'
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                : 'border-amber-600 text-amber-600 hover:bg-amber-50'
            }`}
          >
            As Admin
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => simpleLogin('ROLE_Manager')} // or ROLE_SeniorManager
            className={`${
              ['ROLE_Manager', 'ROLE_JuniorManager', 'ROLE_SeniorManager'].includes(userRole || '')
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                : 'border-amber-600 text-amber-600 hover:bg-amber-50'
            }`}
          >
            As Department
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => simpleLogin('ROLE_NormalUser')}
            className={`${
              userRole === 'ROLE_NormalUser'
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                : 'border-red-600 text-red-600 hover:bg-red-50'
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