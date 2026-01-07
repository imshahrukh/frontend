import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableMultiSelectProps {
  label: string;
  value: string[]; // Array of selected values
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.subtitle?.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  });

  // Get selected option labels
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  // Toggle selection
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Remove a selected item
  const removeItem = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  // Clear all selections
  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {/* Selected items display */}
        <div
          className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-primary-500 focus-within:border-primary-500 bg-white cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-2">
            {selectedOptions.length > 0 ? (
              <>
                {selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center px-2 py-1 rounded bg-primary-100 text-primary-800 text-sm"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => removeItem(option.value, e)}
                      className="ml-1 hover:text-primary-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear all
                  </button>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        isSelected ? 'bg-primary-50' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(option.value);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{option.label}</div>
                          {option.subtitle && (
                            <div className="text-xs text-gray-500">{option.subtitle}</div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedOptions.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {selectedOptions.length} {selectedOptions.length === 1 ? 'employee' : 'employees'} selected
        </p>
      )}
    </div>
  );
};

export default SearchableMultiSelect;

