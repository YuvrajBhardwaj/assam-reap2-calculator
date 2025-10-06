import { useNavigate } from 'react-router-dom';
import { Building, Calculator, Database } from 'lucide-react';

interface QuickNavigationTabsProps {
  currentTab?: string;
}

const QuickNavigationTabs = ({ currentTab }: QuickNavigationTabsProps) => {
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    // Navigate to index with the specific tab
    navigate(`/?tab=${tab}`);
    // Dispatch event to switch to that tab
    window.dispatchEvent(new CustomEvent('navigate-to-tab', {
      detail: { tab }
    }));
  };

  const tabs = [
    {
      id: 'property-valuation',
      label: 'Property Valuation',
      icon: Building
    },
    {
      id: 'stamp-duty-calculator',
      label: 'Stamp Duty Calculation',
      icon: Calculator
    },
    {
      id: 'zonal-value-database',
      label: 'View Zonal Values',
      icon: Database
    },
    {
      id: 'certified-copies',
      label: 'Services related to Certified Copies',
      icon: Database
    }
  ];

  return (
    <div className="flex flex-nowrap gap-x-2 mb-6 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 flex-shrink-0 truncate whitespace-nowrap px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-white text-[#595959] border border-[#595959]' 
                : 'bg-[#595959] text-white hover:bg-[#6a6a6a]'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickNavigationTabs;
