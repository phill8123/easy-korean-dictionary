import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  disabled?: boolean;
}

const languages = [
  "English", 
  "한국어 (Korean)", 
  "Español (Spanish)", 
  "Français (French)", 
  "Deutsch (German)", 
  "Italiano (Italian)",
  "Português (Portuguese)", 
  "Русский (Russian)", 
  "中文 (Chinese)", 
  "日本語 (Japanese)", 
  "Tiếng Việt (Vietnamese)", 
  "ไทย (Thai)", 
  "Bahasa Indonesia", 
  "العربية (Arabic)", 
  "हिन्दी (Hindi)",
  "Türkçe (Turkish)",
  "Polski (Polish)",
  "Nederlands (Dutch)",
  "Svenska (Swedish)"
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (lang: string) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  // Helper to display shorter name in button (e.g., "English" instead of "English (US)")
  const getDisplayName = (fullLang: string) => {
    return fullLang.split('(')[0].trim();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
          shadow-sm select-none border
          ${disabled 
            ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-400' 
            : 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white cursor-pointer active:scale-95'
          }
          ${isOpen ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className={`p-1 rounded-full ${disabled ? 'bg-slate-200' : 'bg-white/20 text-white'}`}>
           <Globe size={16} />
        </div>
        <span className="text-sm font-bold min-w-[60px] text-left">
          {getDisplayName(selectedLanguage)}
        </span>
        <ChevronDown 
            size={16} 
            className={`transition-transform duration-200 ${disabled ? 'text-slate-400' : 'text-indigo-200'} ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
          <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50 mb-1">
            번역 언어 선택
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleSelect(lang)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                  ${selectedLanguage === lang 
                    ? 'text-indigo-600 font-bold bg-indigo-50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
                role="option"
                aria-selected={selectedLanguage === lang}
              >
                <span>{lang}</span>
                {selectedLanguage === lang && <Check size={16} className="text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;