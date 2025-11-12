import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Building, Database } from 'lucide-react';

interface MainModule {
  id: 'master-data' | 'analytics' | 'property';
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MainModuleSelectorProps {
  activeMainTab: 'master-data' | 'analytics' | 'property';
  setActiveMainTab: (tab: 'master-data' | 'analytics' | 'property') => void;
}

const mainModules: MainModule[] = [
  { id: 'master-data', label: 'Master Data Management', icon: Database, color: 'bg-blue-100' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-green-100' },
  { id: 'property', label: 'Property Verification', icon: Building, color: 'bg-purple-100' },
];

const MainModuleSelector: React.FC<MainModuleSelectorProps> = ({ activeMainTab, setActiveMainTab }) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {mainModules.map((module) => (
          <Card
            key={module.id}
            className={`cursor-pointer transition-all duration-200 ${
              activeMainTab === module.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveMainTab(module.id)}
          >
            <CardContent className="p-6">
              <div className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                <module.icon className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-center font-medium text-gray-900">{module.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MainModuleSelector;
