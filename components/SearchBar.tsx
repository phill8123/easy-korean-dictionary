import React, { useState, KeyboardEvent } from 'react';
import { Search, Loader2, RotateCcw } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  texts: {
    placeholder: string;
    button: string;
    recommendationLabel: string;
  };
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onClear, isLoading, texts }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);



  const handleReset = () => {
    setInput('');
    onClear();
  };

  return (
    <div className="relative w-full max-w-xl mx-auto group">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 blur transition duration-500 group-hover:opacity-30 ${isFocused ? 'opacity-40' : ''}`}></div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) onSearch(input.trim());
        }}
        className={`relative flex items-center w-full h-16 rounded-2xl bg-white transition-all duration-300 
        ${isFocused
            ? 'shadow-2xl shadow-indigo-500/20 border-2 border-indigo-500 scale-[1.01]'
            : 'shadow-xl shadow-purple-900/5 border-2 border-indigo-200/80 hover:border-indigo-400'
          }`}
      >

        <div className="grid place-items-center h-full w-14 text-slate-400 pl-2">
          <Search size={22} className={`${isFocused ? 'text-indigo-500' : 'text-slate-400'} transition-colors`} />
        </div>

        <input
          className="peer h-full w-full outline-none text-lg text-slate-700 px-2 bg-transparent placeholder-slate-400 font-medium"
          type="text"
          id="search"
          placeholder={texts.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          autoComplete="off"
        />

        {/* Reset / Clear Button */}
        {input && (
          <button
            type="button"
            onClick={handleReset}
            className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors mr-2 rounded-full hover:bg-slate-100"
            title="Reset"
            aria-label="Clear search"
          >
            <RotateCcw size={18} />
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-[calc(100%-8px)] mr-1 px-4 sm:px-8 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 font-semibold shadow-md shadow-indigo-200 disabled:shadow-none flex items-center justify-center min-w-[80px] sm:min-w-[90px]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="text-sm sm:text-base">{texts.button}</span>}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
        <span className="opacity-60">{texts.recommendationLabel}</span>
        <button type="button" onClick={() => setInput("Hello")} className="hover:text-indigo-600 hover:underline decoration-indigo-300 underline-offset-4 transition-all">"Hello"</button>
        <span className="opacity-30">•</span>
        <button type="button" onClick={() => setInput("맛있어요")} className="hover:text-indigo-600 hover:underline decoration-indigo-300 underline-offset-4 transition-all">"맛있어요"</button>
        <span className="opacity-30">•</span>
        <button type="button" onClick={() => setInput("Subway")} className="hover:text-indigo-600 hover:underline decoration-indigo-300 underline-offset-4 transition-all">"Subway"</button>
      </div>
    </div>
  );
};

export default SearchBar;