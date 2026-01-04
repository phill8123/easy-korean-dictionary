export interface ExampleSentence {
  korean: string;
  english: string; // This will now hold the translated text in the user's target language
  romanization: string;
}

export interface DictionaryEntry {
  word: string;
  romanization: string;
  partOfSpeech: string;
  definition: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  examples: ExampleSentence[];
  culturalNote?: string;
  culturalImageUrl?: string; // New field for the cultural context image
  breakdown?: { part: string; meaning: string; romanization: string }[]; // Added romanization field
  imageUrl?: string; // Generated image for the main word
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  currentEntry: DictionaryEntry | null;
  history: DictionaryEntry[];
}