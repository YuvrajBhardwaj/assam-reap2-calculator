import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface SubModule {
  id: string;
  label: string;
  color: string;
}

interface SubModuleSelectorProps {
  activeSubTab: string;
  onSubTabChange: (tabId: string) => void;
}

const SubModuleSelector: React.FC<SubModuleSelectorProps> = ({ 
  activeSubTab, 
  onSubTabChange 
}) => {
  const subModules: SubModule[] = [
    { id: 'requestor', label: 'Requestor View', color: 'bg-teal-500' },
    { id: 'dashboard', label: 'Dashboard View', color: 'bg-gray-400' },
    { id: 'approver', label: 'Approver View', color: 'bg-gray-400' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {subModules.slice(0, 3).map((module) => (
        <Card 
          key={module.id}
          className={`cursor-pointer transition-all duration-200 ${
            activeSubTab === module.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSubTabChange(module.id)}
        >
          <CardContent className="p-4">
            <div className={`${module.color} text-white text-center py-3 rounded`}>
              {module.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubModuleSelector;