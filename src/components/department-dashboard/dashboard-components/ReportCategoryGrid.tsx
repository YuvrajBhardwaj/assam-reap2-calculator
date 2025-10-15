import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp, 
  Settings, 
  Database, 
  PieChart, 
  MapPin, 
  Calendar, 
  Building 
} from 'lucide-react';

interface ReportCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ReportCategoryGridProps {
  onCategoryClick: (categoryId: string) => void;
}

const ReportCategoryGrid: React.FC<ReportCategoryGridProps> = ({ 
  onCategoryClick 
}) => {
  const reportCategories: ReportCategory[] = [
    { id: 'revenue', label: 'Revenue Collection', icon: DollarSign },
    { id: 'documents', label: 'Documents registered', icon: FileText },
    { id: 'category1', label: 'XX', icon: Users },
    { id: 'category2', label: 'XX', icon: TrendingUp },
    { id: 'category3', label: 'XX', icon: Settings },
    { id: 'category4', label: 'XX', icon: Database },
    { id: 'category5', label: 'XX', icon: PieChart },
    { id: 'category6', label: 'XX', icon: MapPin },
    { id: 'category7', label: 'XX', icon: Calendar },
    { id: 'category8', label: 'XX', icon: Building }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {reportCategories.map((category) => (
        <Card 
          key={category.id}
          className="cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-500"
          onClick={() => onCategoryClick(category.id)}
        >
          <CardContent className="p-4 text-center">
            <category.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">{category.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReportCategoryGrid;