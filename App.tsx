import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import SearchBar from './components/SearchBar';
import WordCard from './components/WordCard';
import LanguageSelector from './components/LanguageSelector';
import { lookupWord, getDailyWord, lookupEntryImages } from './services/geminiService';
import { DictionaryEntry } from './types';

// Extensive Translation Dictionary covering Galaxy-style language list
const UI_TEXT: Record<string, any> = {
  "English": {
    badge: "AI-Powered Korean Tutor",
    welcome: "Start Learning Korean Today!",
    titlePrefix: "Master Korean,",
    titleHighlight: "One Word at a Time.",
    description: "Your personal AI companion for definitions and culture.\nSearch in English or Korean.",
    searchPlaceholder: "Search words (e.g., 'Hello' or '안녕')",
    searchButton: "Ask / 질문",
    recLabel: "Try searching:",
    analyzing: "Analyzing...",
    wordDay: "See Word of the Day",
    wordDayLabel: "Word of the Day",
    footer: "Powered by Gemini",
    errorMsg: "Sorry, I couldn't find that word. Please try a different one."
  },
  "한국어": {
    badge: "AI 기반 한국어 튜터",
    welcome: "외국인을 위한 쉬운 한국어 사전",
    titlePrefix: "한국어 완전 정복,",
    titleHighlight: "단어 하나부터 시작하세요.",
    description: "단어 정의부터 문화적 배경, 자연스러운 발음까지.\n모국어 또는 한국어로 검색해보세요.",
    searchPlaceholder: "단어 검색 (예: '사랑' 또는 'Love')",
    searchButton: "질문하기",
    recLabel: "추천 검색어:",
    analyzing: "분석 중입니다...",
    wordDay: "오늘의 단어 보기",
    wordDayLabel: "오늘의 단어",
    footer: "Gemini 기술 기반",
    errorMsg: "죄송합니다. 해당 단어를 찾을 수 없습니다. 다른 단어를 입력해 보세요."
  },
  "Español": {
    badge: "Tutor de coreano con IA",
    welcome: "¡Empieza a aprender coreano fácil!",
    titlePrefix: "Domina el coreano,",
    titleHighlight: "Palabra por palabra.",
    description: "Definiciones instantáneas y contexto cultural.\nBusca en español o coreano.",
    searchPlaceholder: "Buscar (ej. 'Hola' o '안녕')",
    searchButton: "Preguntar",
    recLabel: "Prueba buscar:",
    analyzing: "Analizando...",
    wordDay: "Ver Palabra del día",
    wordDayLabel: "Palabra del día",
    footer: "Impulsado por Gemini",
    errorMsg: "Lo siento, no pude encontrar esa palabra. Por favor intenta con otra."
  },
  "Français": {
    badge: "Tuteur de coréen IA",
    welcome: "Apprenez le coréen facilement !",
    titlePrefix: "Maîtrisez le coréen,",
    titleHighlight: "Mot par mot.",
    description: "Définitions instantanées et contexte culturel.\nRecherchez en français ou en coréen.",
    searchPlaceholder: "Rechercher (ex. 'Bonjour' ou '안녕')",
    searchButton: "Demander",
    recLabel: "Essayez :",
    analyzing: "Analyse en cours...",
    wordDay: "Voir le mot du jour",
    wordDayLabel: "Mot du jour",
    footer: "Propulsé par Gemini",
    errorMsg: "Désolé, je n'ai pas trouvé ce mot. Veuillez essayer un autre mot."
  },
  "Deutsch": {
    badge: "KI-Koreanisch-Tutor",
    welcome: "Koreanisch einfach lernen!",
    titlePrefix: "Meistere Koreanisch,",
    titleHighlight: "Wort für Wort.",
    description: "Sofortige Definitionen und kultureller Kontext.\nSuche auf Deutsch oder Koreanisch.",
    searchPlaceholder: "Suchen (z.B. 'Hallo' oder '안녕')",
    searchButton: "Fragen",
    recLabel: "Versuche:",
    analyzing: "Analysieren...",
    wordDay: "Wort des Tages sehen",
    wordDayLabel: "Wort des Tages",
    footer: "Powered by Gemini",
    errorMsg: "Entschuldigung, ich konnte dieses Wort nicht finden. Bitte versuchen Sie ein anderes."
  },
  "Italiano": {
    badge: "Tutor di coreano IA",
    welcome: "Impara il coreano facilmente!",
    titlePrefix: "Padroneggia il coreano,",
    titleHighlight: "Parola per parola.",
    description: "Definizioni istantanee e contesto culturale.\nCerca in italiano o coreano.",
    searchPlaceholder: "Cerca (es. 'Ciao' o '안녕')",
    searchButton: "Chiedi",
    recLabel: "Prova a cercare:",
    analyzing: "Analisi...",
    wordDay: "Parola del giorno",
    wordDayLabel: "Parola del giorno",
    footer: "Powered by Gemini",
    errorMsg: "Spiacenti, non ho trovato questa parola. Prova con un'altra."
  },
  "Português": {
    badge: "Tutor de Coreano IA",
    welcome: "Aprenda coreano facilmente!",
    titlePrefix: "Domine o coreano,",
    titleHighlight: "Uma palavra de cada vez.",
    description: "Definições instantâneas e contexto cultural.\nPesquise em português ou coreano.",
    searchPlaceholder: "Pesquisar (ex. 'Olá' ou '안녕')",
    searchButton: "Perguntar",
    recLabel: "Tente pesquisar:",
    analyzing: "Analisando...",
    wordDay: "Ver Palavra do dia",
    wordDayLabel: "Palavra do dia",
    footer: "Desenvolvido por Gemini",
    errorMsg: "Desculpe, não consegui encontrar essa palavra. Por favor, tente outra."
  },
  "Русский": {
    badge: "ИИ-репетитор корейского",
    welcome: "Учите корейский легко!",
    titlePrefix: "Освойте корейский,",
    titleHighlight: "Слово за словом.",
    description: "Мгновенные определения и культурный контекст.\nПоиск на русском или корейском.",
    searchPlaceholder: "Поиск (напр. 'Привет' или '안녕')",
    searchButton: "Спросить",
    recLabel: "Попробуйте:",
    analyzing: "Анализ...",
    wordDay: "Слово дня",
    wordDayLabel: "Слово дня",
    footer: "На базе Gemini",
    errorMsg: "Извините, я не нашел это слово. Пожалуйста, попробуйте другое."
  },
  "中文": {
    badge: "AI 驱动的韩语导师",
    welcome: "轻松有趣地开始学习韩语！",
    titlePrefix: "精通韩语，",
    titleHighlight: "从每一个单词开始。",
    description: "即时定义、文化背景和自然发音。\n支持中文或韩语搜索。",
    searchPlaceholder: "搜索 (如 '你好' 或 '안녕')",
    searchButton: "提问",
    recLabel: "尝试搜索:",
    analyzing: "分析中...",
    wordDay: "查看每日一词",
    wordDayLabel: "每日一词",
    footer: "由 Gemini 提供支持",
    errorMsg: "抱歉，找不到该单词。请尝试其他单词。"
  },
  "日本語": {
    badge: "AI 韓国語チューター",
    welcome: "韓国語、簡単かつ楽しく始めましょう！",
    titlePrefix: "韓国語マスター、",
    titleHighlight: "単語一つから。",
    description: "即時の定義、文化的背景、そして自然な発音。\n日本語または韓国語で検索できます。",
    searchPlaceholder: "検索 (例: 'こんにちは' または '안녕')",
    searchButton: "質問する",
    recLabel: "検索候補:",
    analyzing: "分析中...",
    wordDay: "今日の単語を見る",
    wordDayLabel: "今日の単語",
    footer: "Powered by Gemini",
    errorMsg: "申し訳ありません。その単語は見つかりませんでした。別の単語を試してみてください。"
  },
  "Tiếng Việt": {
    badge: "Gia sư tiếng Hàn AI",
    welcome: "Học tiếng Hàn thật dễ dàng!",
    titlePrefix: "Chinh phục tiếng Hàn,",
    titleHighlight: "Từng từ một.",
    description: "Định nghĩa tức thì và bối cảnh văn hóa.\nTìm kiếm bằng tiếng Việt hoặc tiếng Hàn.",
    searchPlaceholder: "Tìm kiếm (vd: 'Xin chào' hoặc '안녕')",
    searchButton: "Hỏi",
    recLabel: "Thử tìm:",
    analyzing: "Đang phân tích...",
    wordDay: "Xem từ của ngày",
    wordDayLabel: "Từ của ngày",
    footer: "Được hỗ trợ bởi Gemini",
    errorMsg: "Xin lỗi, tôi không tìm thấy từ đó. Vui lòng thử từ khác."
  },
  "ไทย": {
    badge: "ติวเตอร์ภาษาเกาหลี AI",
    welcome: "เริ่มเรียนภาษาเกาหลีได้ง่ายๆ!",
    titlePrefix: "เก่งภาษาเกาหลี,",
    titleHighlight: "ทีละคำ",
    description: "คำแปลทันใจและบริบททางวัฒนธรรม\nค้นหาเป็นภาษาไทยหรือภาษาเกาหลี",
    searchPlaceholder: "ค้นหา (เช่น 'สวัสดี' หรือ '안녕')",
    searchButton: "ถาม",
    recLabel: "ลองค้นหา:",
    analyzing: "กำลังวิเคราะห์...",
    wordDay: "ดูศัพท์ประจำวัน",
    wordDayLabel: "ศัพท์ประจำวัน",
    footer: "ขับเคลื่อนโดย Gemini",
    errorMsg: "ขออภัย ฉันไม่พบคำนั้น โปรดลองคำอื่น"
  },
  "Bahasa Indonesia": {
    badge: "Tutor Bahasa Korea AI",
    welcome: "Belajar Bahasa Korea dengan Mudah!",
    titlePrefix: "Kuasai Bahasa Korea,",
    titleHighlight: "Satu kata setiap waktu.",
    description: "Definisi instan dan konteks budaya.\nCari dalam Bahasa Indonesia atau Korea.",
    searchPlaceholder: "Cari (mis. 'Halo' atau '안녕')",
    searchButton: "Tanya",
    recLabel: "Coba cari:",
    analyzing: "Menganalisis...",
    wordDay: "Lihat Kata hari ini",
    wordDayLabel: "Kata hari ini",
    footer: "Didukung oleh Gemini",
    errorMsg: "Maaf, saya tidak dapat menemukan kata itu. Silakan coba kata lain."
  },
  "العربية": {
    badge: "معلم الكورية بالذكاء الاصطناعي",
    welcome: "ابدأ تعلم الكورية اليوم!",
    titlePrefix: "أتقن الكورية،",
    titleHighlight: "كلمة بكلمة.",
    description: "تعريفات فورية وسياق ثقافي.\nابحث بالعربية أو الكورية.",
    searchPlaceholder: "بحث (مثال: 'مرحبا' أو '안녕')",
    searchButton: "اسأل",
    recLabel: "جرب البحث عن:",
    analyzing: "جارٍ التحليل...",
    wordDay: "عرض كلمة اليوم",
    wordDayLabel: "كلمة اليوم",
    footer: "بدعم من Gemini",
    errorMsg: "عذراً، لم أتمكن من العثور على هذه الكلمة. يرجى تجربة كلمة أخرى."
  },
  "हिन्दी": {
    badge: "AI कोरियाई ट्यूटर",
    welcome: "आज ही कोरियाई सीखना शुरू करें!",
    titlePrefix: "कोरियाई में महारत हासिल करें,",
    titleHighlight: "एक-एक शब्द करके।",
    description: "तत्काल परिभाषाएँ और सांस्कृतिक संदर्भ।\nहिन्दी या कोरियाई में खोजें।",
    searchPlaceholder: "खोजें (जैसे 'नमस्ते' या '안녕')",
    searchButton: "पूछें",
    recLabel: "खोजने का प्रयास करें:",
    analyzing: "विश्लेषण कर रहा है...",
    wordDay: "आज का शब्द देखें",
    wordDayLabel: "आज का शब्द",
    footer: "Gemini द्वारा संचालित",
    errorMsg: "क्षमा करें, मुझे वह शब्द नहीं मिला। कृपया कोई दूसरा शब्द आज़माएँ।"
  },
  "Türkçe": {
    badge: "Yapay Zeka Korece Eğitmeni",
    welcome: "Korece öğrenmeye bugün başlayın!",
    titlePrefix: "Koreceyi Ustalaşın,",
    titleHighlight: "Adım adım, kelime kelime.",
    description: "Anında tanımlar ve kültürel bağlam.\nTürkçe veya Korece arama yapın.",
    searchPlaceholder: "Ara (ör. 'Merhaba' veya '안녕')",
    searchButton: "Sor",
    recLabel: "Şunu aramayı dene:",
    analyzing: "Analiz ediliyor...",
    wordDay: "Günün Kelimesini Gör",
    wordDayLabel: "Günün Kelimesi",
    footer: "Gemini tarafından desteklenmektedir",
    errorMsg: "Üzgünüm, o kelimeyi bulamadım. Lütfen başka bir kelime deneyin."
  },
  "Polski": {
    badge: "Nauczyciel koreańskiego AI",
    welcome: "Zacznij naukę koreańskiego już dziś!",
    titlePrefix: "Opanuj koreański,",
    titleHighlight: "Słowo po słowie.",
    description: "Natychmiastowe definicje i kontekst kulturowy.\nSzukaj po polsku lub koreańsku.",
    searchPlaceholder: "Szukaj (np. 'Cześć' lub '안녕')",
    searchButton: "Zapytaj",
    recLabel: "Spróbuj wyszukać:",
    analyzing: "Analizowanie...",
    wordDay: "Zobacz słowo dnia",
    wordDayLabel: "Słowo dnia",
    footer: "Wspierane przez Gemini",
    errorMsg: "Przepraszam, nie znalazłem tego słowa. Spróbuj innego."
  },
  "Nederlands": {
    badge: "AI Koreaanse Tutor",
    welcome: "Begin vandaag met Koreaans leren!",
    titlePrefix: "Beheers het Koreaans,",
    titleHighlight: "Woord voor woord.",
    description: "Directe definities en culturele context.\nZoek in het Nederlands of Koreaans.",
    searchPlaceholder: "Zoek (bijv. 'Hallo' of '안녕')",
    searchButton: "Vragen",
    recLabel: "Probeer te zoeken:",
    analyzing: "Analyseren...",
    wordDay: "Bekijk woord van de dag",
    wordDayLabel: "Woord van de dag",
    footer: "Mogelijk gemaakt door Gemini",
    errorMsg: "Sorry, ik kon dat woord niet vinden. Probeer een ander woord."
  },
  "Svenska": {
    badge: "AI Koreansk Lärare",
    welcome: "Börja lära dig koreanska idag!",
    titlePrefix: "Bemästra koreanska,",
    titleHighlight: "Ett ord i taget.",
    description: "Direkta definitioner och kulturell kontext.\nSök på svenska eller koreanska.",
    searchPlaceholder: "Sök (t.ex. 'Hej' eller '안녕')",
    searchButton: "Fråga",
    recLabel: "Prova att söka:",
    analyzing: "Analyserar...",
    wordDay: "Se dagens ord",
    wordDayLabel: "Dagens ord",
    footer: "Drivs av Gemini",
    errorMsg: "Tyvärr kunde jag inte hitta det ordet. Försök med ett annat."
  },
  "default": {
    badge: "AI-Powered Korean Tutor",
    welcome: "Start Learning Korean Today!",
    titlePrefix: "Master Korean,",
    titleHighlight: "One Word at a Time.",
    description: "Instant definitions, cultural context, and natural pronunciation.",
    searchPlaceholder: "Search words...",
    searchButton: "Ask",
    recLabel: "Try searching:",
    analyzing: "Analyzing...",
    wordDay: "See Word of the Day",
    wordDayLabel: "Word of the Day",
    footer: "Powered by Gemini",
    errorMsg: "Sorry, I couldn't find that word. Please try a different one."
  }
};

const App: React.FC = () => {
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMode, setWelcomeMode] = useState<boolean>(true);

  // CHANGED: Use a NEW storage key 'easy_korean_preference_v1' to ignore old cached settings
  // and force everyone to start with "English"
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('easy_korean_preference_v1');
      return saved || "한국어 (Korean)";
    }
    return "한국어 (Korean)";
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Debug log to confirm deployment
    console.log("Easy Korean App Loaded - Version: 0.2.0 (English Force)");
  }, []);

  // Get current UI text based on language
  const getUIText = (lang: string) => {
    const key = lang.split('(')[0].trim();
    return UI_TEXT[key] || UI_TEXT["default"];
  };

  const ui = getUIText(language);

  // Dynamic Logo Text: "Easy Korean" for English/Global, "이지코리안" for Korean mode
  const logoText = language.startsWith("한국어") ? "이지코리안" : "Easy Korean";

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setWelcomeMode(false);
    setSearchQuery(query);

    try {
      // 1. Get Text Result (Fast)
      const result = await lookupWord(query, language);
      setCurrentEntry(result);
      setIsLoading(false); // Render UI immediately

      // 2. Fetch Images (Background)
      lookupEntryImages(result).then(images => {
        setCurrentEntry(prev => {
          // Only update if the current entry matches the one we requested images for
          if (prev && prev.word === result.word) {
            return { ...prev, ...images };
          }
          return prev;
        });
      }).catch(err => console.error("Image background fetch failed", err));

    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "An unexpected error occurred.");
      setCurrentEntry(null);
      setIsLoading(false);
    }
  };

  const handleDailyWord = async () => {
    setIsLoading(true);
    setError(null);
    setWelcomeMode(false);
    setSearchQuery(""); // Clear search query for daily word

    try {
      const daily = await getDailyWord(language);
      setCurrentEntry(daily);
      setIsLoading(false);

      // Background fetch images
      lookupEntryImages(daily).then(images => {
        setCurrentEntry(prev => {
          if (prev && prev.word === daily.word) {
            return { ...prev, ...images };
          }
          return prev;
        });
      }).catch(err => console.error("Daily word image fetch failed", err));
    } catch (e) {
      console.error("Failed to load daily word", e);
      setError("error");
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setWelcomeMode(true);
    setCurrentEntry(null);
    setError(null);
    setSearchQuery("");
  };

  const handleLogoClick = () => {
    handleReset();
    // Removed window.location.reload() to prevent flickering/refreshing
    // The handleReset() call is sufficient to return to the initial state.
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // CHANGED: Update the new storage key
    localStorage.setItem('easy_korean_preference_v1', newLang);

    // If we are in welcome mode (initial screen), this state change 
    // automatically triggers a re-render with the new language UI text.

    // If viewing a word result, refresh the result in the new language
    if (!welcomeMode && currentEntry) {
      handleSearch(currentEntry.word);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E8FF] via-[#FDFBFF] to-[#EBE4FF] flex flex-col font-sans text-slate-900 relative selection:bg-purple-200 selection:text-purple-900 overflow-x-hidden">

      {/* Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-violet-400/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[20%] right-[20%] w-[40vw] h-[40vw] bg-fuchsia-300/15 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 transition-all duration-300 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform duration-300">
              <span className="font-bold text-lg">한</span>
            </div>
            {/* Dynamic Logo Text */}
            <span className="font-bold text-xl tracking-tight text-slate-800 group-hover:text-indigo-700 transition-colors">
              {logoText}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector selectedLanguage={language} onLanguageChange={handleLanguageChange} disabled={isLoading} />
          </div>
        </div>
      </nav>

      {/* Main Content - Centered vertically when no content */}
      <main className={`relative z-10 flex-grow flex flex-col items-center px-4 sm:px-6 transition-all duration-700 ${!currentEntry && !isLoading && !error ? 'justify-center pb-32' : 'justify-start pt-16 sm:pt-24 pb-12'}`}>

        {/* Hero / Header Section */}
        <div className={`text-center transition-all duration-700 ease-out max-w-4xl mx-auto ${(currentEntry || error) && !welcomeMode ? 'mb-8 opacity-90 scale-95' : 'mb-12'}`}>
          {welcomeMode && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Refined Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-purple-100 text-purple-600 rounded-full text-xs font-semibold mb-8 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-default">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span>{ui.badge}</span>
              </div>

              <h2 className="text-lg sm:text-xl font-medium text-slate-500 mb-6 font-sans tracking-tight">
                {ui.welcome}
              </h2>
            </div>
          )}

          <h1 className={`font-extrabold tracking-tight text-slate-900 mb-6 transition-all duration-500 ${currentEntry && !welcomeMode ? 'text-3xl' : 'text-5xl sm:text-7xl'}`}>
            {ui.titlePrefix}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x bg-[length:200%_auto]">
              {ui.titleHighlight}
            </span>
          </h1>

          {welcomeMode && (
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 whitespace-pre-line">
              {ui.description}
            </p>
          )}
        </div>

        {/* Search Bar Container */}
        <div className="w-full flex justify-center z-20 perspective-1000 flex-col items-center">
          <SearchBar
            onSearch={handleSearch}
            onClear={handleReset}
            isLoading={isLoading}
            texts={{
              placeholder: ui.searchPlaceholder,
              button: ui.searchButton,
              recommendationLabel: ui.recLabel
            }}
          />

          {/* Manual Daily Word Button */}
          {welcomeMode && !isLoading && (
            <div className="mt-8 animate-fade-in delay-200">
              <button
                onClick={handleDailyWord}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/50 hover:bg-white/80 border border-white/60 hover:border-indigo-200 rounded-full transition-all shadow-sm hover:shadow-md text-slate-600 hover:text-indigo-600"
              >
                <Sparkles size={16} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                <span className="text-sm font-medium">{ui.wordDay}</span>
              </button>
            </div>
          )}
        </div>

        {/* State Displays */}
        <div className="w-full max-w-2xl mt-6">
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl shadow-sm border border-red-100 animate-fade-in w-full text-center">
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1 opacity-75">Please check API Key or try again.</p>
            </div>
          )}

          {/* Visual Search Confirmation */}
          {isLoading && searchQuery && (
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md text-indigo-700 text-sm font-medium border border-indigo-100 shadow-lg shadow-indigo-100/50">
                <Loader2 className="animate-spin text-indigo-600" size={18} />
                <span><span className="font-bold text-slate-900">"{searchQuery}"</span> {ui.analyzing}</span>
              </div>
            </div>
          )}

          {/* Visual Daily Word Confirmation (when searchQuery is empty but loading) */}
          {isLoading && !searchQuery && (
            <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md text-indigo-700 text-sm font-medium border border-indigo-100 shadow-lg shadow-indigo-100/50">
                <Loader2 className="animate-spin text-indigo-600" size={18} />
                <span>{ui.analyzing}</span>
              </div>
            </div>
          )}

          {/* Show Card or Skeleton */}
          {(isLoading || currentEntry) && (
            <>
              {currentEntry && !isLoading && !searchQuery && (
                <div className="flex items-center justify-center gap-2 mb-6 text-indigo-900/40 uppercase text-[10px] font-bold tracking-[0.2em] animate-fade-in">
                  <span className="w-8 h-px bg-indigo-900/20"></span>
                  {ui.wordDayLabel}
                  <span className="w-8 h-px bg-indigo-900/20"></span>
                </div>
              )}
              <WordCard entry={currentEntry} isLoading={isLoading} />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/40 mt-auto bg-white/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} EasyKorean.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-purple-700 transition-colors cursor-pointer"><Sparkles size={14} /> {ui.footer} (v0.3.1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;