import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

interface DashboardTypeSelectorProps {
  handleCardClick: (reportType: string) => void;
}

const DashboardTypeSelector: React.FC<DashboardTypeSelectorProps> = ({ handleCardClick }) => {
  const dashboardTypes = [
    { id: 'documents-registered', label: 'Documents Registered', value: '182166', icon: BarChart3, color: 'bg-green-500' },
    // Add other dashboard types as needed
  ];

  return (
    <div className="space-y-6">
      {/* Dashboards content */}
      <div className="text-center text-blue-600 font-bold text-xl mb-4">
        DASHBOARD STATISTICS FOR THE FINANCIAL YEAR 2025-2026
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {dashboardTypes.map((dashboard) => (
          <Card
            key={dashboard.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(dashboard.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-full h-32 ${dashboard.color} rounded mb-2 flex items-center justify-center`}>
                <dashboard.icon className="w-16 h-16 text-white" />
              </div>
              <div className="text-sm text-gray-600 mb-2">{dashboard.label}</div>
              <div className="text-2xl font-bold">{dashboard.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardTypeSelector;