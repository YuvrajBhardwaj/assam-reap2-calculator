import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsModule {
  id: string;
  label: string;
  color: string;
}

interface AnalyticsModuleSelectorProps {
  analyticsView: string;
  onAnalyticsViewChange: (viewId: string) => void;
}

const AnalyticsModuleSelector: React.FC<AnalyticsModuleSelectorProps> = ({ 
  analyticsView, 
  onAnalyticsViewChange 
}) => {
  const analyticsOptions: AnalyticsModule[] = [
    { id: 'reports', label: 'Reports', color: 'bg-teal-500' },
    { id: 'dashboards', label: 'Dashboards', color: 'bg-teal-500' },
    { id: 'databases', label: 'Databases', color: 'bg-teal-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {analyticsOptions.map((option) => (
        <Card 
          key={option.id}
          className={`cursor-pointer transition-all duration-200 ${
            analyticsView === option.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onAnalyticsViewChange(option.id)}
        >
          <CardContent className="p-4">
            <div className={`${option.color} text-white text-center py-3 rounded`}>
              {option.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsModuleSelector;