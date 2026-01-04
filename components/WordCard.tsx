import React from 'react';
import { BookOpen, Star, Info, List } from 'lucide-react';
import { DictionaryEntry } from '../types';
import AudioButton from './AudioButton';

interface WordCardProps {
  entry?: DictionaryEntry | null;
  isLoading?: boolean;
}

const WordCardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-100 p-8 h-auto relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-grow space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-24 h-8 bg-slate-200 rounded-xl"></div>
               <div className="w-16 h-8 bg-slate-200 rounded-lg"></div>
            </div>
            
            <div className="space-y-3">
              <div className="w-48 h-12 sm:h-16 bg-slate-200 rounded-2xl"></div>
              <div className="w-32 h-6 bg-slate-200/60 rounded-lg"></div>
            </div>
          </div>

          <div className="shrink-0 mx-auto sm:mx-0">
             <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-200 rounded-2xl rotate-3"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8 space-y-8">
        
        {/* Definition */}
        <div className="space-y-3">
          <div className="w-24 h-4 bg-slate-200 rounded"></div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded"></div>
            <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
          </div>
        </div>

        {/* Cultural Note Skeleton */}
        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
           <div className="w-32 h-4 bg-slate-200 rounded"></div>
           <div className="flex flex-col sm:flex-row gap-6 items-start">
             <div className="flex-grow space-y-2 w-full">
               <div className="w-full h-3 bg-slate-200 rounded"></div>
               <div className="w-full h-3 bg-slate-200 rounded"></div>
               <div className="w-3/4 h-3 bg-slate-200 rounded"></div>
             </div>
             <div className="shrink-0 w-full sm:w-48 aspect-video bg-slate-200 rounded-xl"></div>
           </div>
        </div>

        {/* Examples Skeleton */}
        <div className="space-y-4">
          <div className="w-24 h-4 bg-slate-200 rounded"></div>
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-50 rounded-r-lg border-l-4 border-slate-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WordCard: React.FC<WordCardProps> = ({ entry, isLoading }) => {
  if (isLoading) {
    return <WordCardSkeleton />;
  }

  if (!entry) return null;

  // Fallback if difficultyLevel is missing from API response
  const level = entry.difficultyLevel || 'Beginner';
  
  const isBeginner = level === 'Beginner';
  const isIntermediate = level === 'Intermediate';
  const isAdvanced = level === 'Advanced';

  // Map levels to Korean
  const levelDisplay: Record<string, string> = {
    'Beginner': '초급',
    'Intermediate': '중급',
    'Advanced': '고급'
  };

  // Define styling based on difficulty
  let difficultyColor = 'bg-teal-500';
  let gradientFrom = 'from-teal-500';
  let gradientTo = 'to-emerald-600';
  let levelBars = 1;
  let topikLevel = 'Level 1-2';

  if (isIntermediate) {
    difficultyColor = 'bg-amber-500';
    gradientFrom = 'from-amber-500';
    gradientTo = 'to-orange-600';
    levelBars = 2;
    topikLevel = 'Level 3-4';
  } else if (isAdvanced) {
    difficultyColor = 'bg-rose-500';
    gradientFrom = 'from-rose-500';
    gradientTo = 'to-red-600';
    levelBars = 3;
    topikLevel = 'Level 5-6';
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-8 text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Star size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-grow">
            {/* Difficulty Badge & Meter */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
               <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 self-start">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((bar) => (
                      <div 
                        key={bar} 
                        className={`w-2 h-6 rounded-sm ${bar <= levelBars ? 'bg-white' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-90">{levelDisplay[level] || level}</span>
                    <span className="text-[10px] font-medium opacity-75">TOPIK {topikLevel}</span>
                  </div>
               </div>
               
               <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider text-white">
                 {entry.partOfSpeech}
               </span>
            </div>
            
            {/* Word Display */}
            <div className="mt-2 flex items-end gap-3 flex-wrap">
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">{entry.word}</h1>
              <div className="pb-1 bg-white/20 rounded-full p-1 backdrop-blur-sm">
                <AudioButton text={entry.word} dark={true} size={28} />
              </div>
            </div>
            <p className="text-white/90 text-xl font-light mt-2 opacity-90 font-serif italic">{entry.romanization}</p>
          </div>

          {/* AI Generated Image (Word) */}
          {entry.imageUrl && (
            <div className="shrink-0 mx-auto sm:mx-0">
               <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white/20 backdrop-blur-md p-2 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img 
                    src={entry.imageUrl} 
                    alt={`Illustration of ${entry.word}`} 
                    className="w-full h-full object-cover rounded-xl bg-white"
                  />
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 space-y-8">
        
        {/* Definition */}
        <section>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen size={14} /> 의미
          </h3>
          <p className="text-slate-800 text-2xl font-medium leading-relaxed">
            {entry.definition}
          </p>
        </section>

        {/* Cultural Note with Image */}
        {entry.culturalNote && (
          <section className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={14} /> 문화 팁
            </h3>
            
            <div className={`flex flex-col ${entry.culturalImageUrl ? 'sm:flex-row' : ''} gap-6 items-start`}>
               <p className="text-slate-700 text-lg leading-relaxed flex-grow">
                 {entry.culturalNote}
               </p>
               
               {entry.culturalImageUrl && (
                 <div className="shrink-0 w-full sm:w-48 aspect-video rounded-xl overflow-hidden shadow-sm border border-slate-200 self-center sm:self-start">
                   <img 
                     src={entry.culturalImageUrl} 
                     alt="Cultural illustration" 
                     className="w-full h-full object-cover"
                   />
                 </div>
               )}
            </div>
          </section>
        )}

        {/* Breakdown (if exists) */}
        {entry.breakdown && entry.breakdown.length > 0 && (
          <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <List size={14} /> 표현 분석
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.breakdown.map((part, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-200 min-w-[80px]">
                  <span className={`font-bold text-lg ${isIntermediate ? 'text-amber-600' : isAdvanced ? 'text-rose-600' : 'text-teal-600'}`}>
                    {part.part}
                  </span>
                  {/* Display Romanization if available */}
                  {part.romanization && (
                    <span className="text-slate-400 text-xs font-serif italic mb-1">{part.romanization}</span>
                  )}
                  {/* Divider arrow if nice, or just vertical spacing */}
                  <span className="text-slate-300 text-[10px] mb-1">↓</span>
                  <span className="text-slate-600 text-sm font-medium">{part.meaning}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Examples */}
        <section>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">예문</h3>
          <div className="space-y-4">
            {entry.examples.map((ex, idx) => (
              <div 
                key={idx} 
                className={`group relative border-l-4 pl-4 transition-colors hover:bg-slate-50 rounded-r-lg py-3 pr-2 ${
                  isIntermediate ? 'border-amber-200 hover:border-amber-400' : 
                  isAdvanced ? 'border-rose-200 hover:border-rose-400' : 
                  'border-teal-200 hover:border-teal-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-lg text-slate-800 font-medium">{ex.korean}</p>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    <AudioButton text={ex.korean} size={18} className="bg-slate-100 hover:bg-slate-200 text-slate-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 font-serif italic mb-1">{ex.romanization}</p>
                <p className="text-slate-600">{ex.english}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WordCard;