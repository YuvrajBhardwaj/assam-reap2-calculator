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
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {searchOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleOptionChange(option)}
            className={`text-sm sm:text-base px-4 py-2 rounded-full font-medium border transition-all duration-150 ${activeOption === option
                ? 'bg-gray-700 text-white border-gray-700 shadow-md'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
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
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700" />
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
            className="pl-10 pr-4 py-2 w-full rounded-md border-2 border-gray-300 bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm sm:text-base"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="bg-gray-700 text-white px-6 py-2 rounded-md shadow hover:bg-gray-800 transition-all duration-200 text-sm sm:text-base min-h-[42px]"
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