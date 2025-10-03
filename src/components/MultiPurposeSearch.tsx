'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const searchOptions = [
  'Agriculture ID',
  'ULPIN / Land Parcel ID',
  'Municipal ID',
  'By Address',
  'Free Text',
];

const placeholders = {
  'Agriculture ID': 'e.g., AGRI-KAMRUP-10234',
  'ULPIN / Land Parcel ID': 'e.g., IN-AS-18-1234-5678-9012',
  'Municipal ID': 'e.g., GMC-PPID-789456',
  'By Address': 'e.g., Ganeshguri, Dispur, Guwahati, Assam 781006',
  'Free Text': 'e.g., near Assam Secretariat, Dispur',
};

interface MultiPurposeSearchProps {
  onSearchTypeChange?: (type: string) => void;
  onSearchTextChange?: (text: string) => void;
}

export default function MultiPurposeSearch({
  onSearchTypeChange,
  onSearchTextChange,
}: MultiPurposeSearchProps = {}) {
  const [activeOption, setActiveOption] = useState('Agriculture ID');
  const [searchText, setSearchText] = useState('');
  const [inputError, setInputError] = useState('');

  // Function to handle search text change
  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Alphanumeric validation for specific fields
    if (['Agriculture ID', 'ULPIN / Land Parcel ID', 'Municipal ID'].includes(activeOption)) {
      if (/^[a-zA-Z0-9\-\s]*$/.test(value) && value.length <= 20) {
        setSearchText(value);
        setInputError('');
        onSearchTextChange?.(value);
      } else if (!/^[a-zA-Z0-9\-\s]*$/.test(value)) {
        setInputError('Only alphanumeric characters, spaces, and dashes allowed.');
      } else if (value.length > 20) {
        setInputError('Maximum 20 characters allowed.');
      }
    } else {
      setSearchText(value);
      setInputError('');
      onSearchTextChange?.(value);
    }
  };

  // Function to handle option change
  const handleOptionChange = (option: string) => {
    setActiveOption(option);
    setSearchText('');
    setInputError('');
    onSearchTypeChange?.(option);
    onSearchTextChange?.('');
  };

  // Function to handle Enter key for search
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((activeOption === 'By Address' || activeOption === 'Free Text') && e.key === 'Enter' && searchText.trim()) {
      onSearchTextChange?.(searchText.trim());
    }
  };

  return (
    <div className="w-full bg-white shadow-md rounded-xl px-6 pt-6 pb-4 z-10 relative">
      {/* Search Options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {searchOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleOptionChange(option)}
            className={`text-sm sm:text-base px-3 py-2 rounded-lg font-medium border transition-all duration-150 ${activeOption === option
                ? 'bg-[#1e8c98] text-white border-[#1e8c98] shadow-md'
                : 'bg-white text-[#1e8c98] border-[#1e8c98] hover:bg-[#e6f7fa]'
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Input and Submit */}
      <form
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if ((activeOption === 'By Address' || activeOption === 'Free Text') && searchText.trim()) {
            onSearchTextChange?.(searchText.trim());
          }
        }}
      >
        {/* Input with icon */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1e8c98]" />
          <Input
            type="text"
            value={searchText}
            onChange={handleSearchTextChange}
            onKeyDown={handleInputKeyDown}
            maxLength={
              ['Agriculture ID', 'ULPIN / Land Parcel ID', 'Municipal ID'].includes(activeOption)
                ? 20
                : undefined
            }
            placeholder={placeholders[activeOption]}
            className="pl-10 pr-4 py-2 w-full rounded-md border-2 border-[#b2e6ee] bg-[#f0fcfd] text-[#1e8c98] placeholder-[#1e8c98] focus:outline-none focus:ring-2 focus:ring-[#1e8c98] focus:border-[#1e8c98] text-sm sm:text-base"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="bg-[#1e8c98] text-white px-6 py-2 rounded-md shadow hover:bg-[#176c77] transition-all duration-200 text-sm sm:text-base min-h-[42px]"
          disabled={inputError !== '' || !searchText.trim()}
        >
          Submit
        </Button>
      </form>

      {/* Error Message */}
      {inputError && (
        <p className="text-red-600 text-sm mt-2">
          {inputError}
        </p>
      )}
    </div>

  );
}