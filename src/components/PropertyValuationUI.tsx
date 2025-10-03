import { useEffect, useState } from 'react';

import PropertyValuationMap from './PropertyValuationMap';
import MultiPurposeSearch from './MultiPurposeSearch';

const ensureMapCSS = () => {
  return new Promise<void>((resolve) => {
    const checkCSS = () => {
      const leafletCSS = document.querySelector('link[href*="leaflet"]');
      const arcgisCSS = document.querySelector('link[href*="arcgis"]');
      const cesiumCSS = document.querySelector('link[href*="cesium"]');
      
      if (leafletCSS && arcgisCSS && cesiumCSS) {
        resolve();
      } else {
        setTimeout(checkCSS, 50);
      }
    };
    checkCSS();
  });
};

const PropertyValuationUI = () => {
  
  const [selectedSubclauses, setSelectedSubclauses] = useState<string[]>([]);
  const [searchType, setSearchType] = useState("Agriculture ID");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [isMapSearchActive, setIsMapSearchActive] = useState(false);

 

  const handleSubclauseChange = (value: string) => {
    if (selectedSubclauses.includes(value)) {
      setSelectedSubclauses(selectedSubclauses.filter(item => item !== value));
    } else {
      setSelectedSubclauses([...selectedSubclauses, value]);
    }
  };

  const handleCalculate = () => {
    alert("Calculating property value with the provided details");
  };

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); 

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* MultiPurposeSearch always visible at the top */}
      <MultiPurposeSearch
        onSearchTypeChange={setSearchType}
        onSearchTextChange={setSearchText}
      />

      <br />
      <div className="flex flex-1">
        {/* Only show left-side content (map and controls), hide right panel */}
        <div className="w-full flex flex-col items-center justify-start min-h-[700px]">
          <PropertyValuationMap
            isFullWidth={true}
            searchType={searchType}
            searchText={debouncedSearchText}
            isMapSearchActive={isMapSearchActive}
          />
        </div>
        {/* Guideline Rates Dialog - Replaced Modal with Radix UI Dialog */}
        
      </div> 
    </div>
  );
};

export default PropertyValuationUI;
