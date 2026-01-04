import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DictionaryEntry } from "../types";
import { decodeBase64, decodeAudioData, getAudioContext } from "./audioUtils";

// --- Caching Configuration ---
const TEXT_CACHE_PREFIX = 'ek_text_cache_v1_';
const IMAGE_CACHE = new Map<string, string>(); // In-memory cache for generated images
const AUDIO_CACHE = new Map<string, AudioBuffer>(); // In-memory cache for TTS audio buffers

// Helper to initialize the client safely
const getClient = () => {
  // FIX: Using import.meta.env for Vite instead of process.env
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY || (process as any).env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY is missing. Please check your .env.local file and ensure VITE_API_KEY is set.");
    throw new Error("API Key is missing. Please configure VITE_API_KEY in your .env.local file.");
  }
  return new GoogleGenAI({ apiKey });
};

const dictionarySchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The Korean word, phrase, or short sentence." },
    romanization: { type: Type.STRING, description: "Romanized pronunciation (Latin characters ONLY)." },
    partOfSpeech: { type: Type.STRING, description: "Noun, Verb, Adjective, Phrase, Expression, etc. (Translated to target language)" },
    definition: { type: Type.STRING, description: "A simple, easy-to-understand definition in the target language." },
    difficultyLevel: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          korean: { type: Type.STRING },
          english: { type: Type.STRING, description: "Translation of the example strictly in the target language." },
          romanization: { type: Type.STRING, description: "Romanized pronunciation (Latin characters ONLY). NO Hangul." },
        },
      },
      description: "2-3 common example sentences."
    },
    culturalNote: { type: Type.STRING, description: "A brief fun fact or nuance about usage in the target language. Mention politeness level (formal/informal) for phrases." },
    breakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          part: { type: Type.STRING, description: "The specific Korean word or particle." },
          romanization: { type: Type.STRING, description: "Romanized pronunciation (Latin characters ONLY)." },
          meaning: { type: Type.STRING, description: "Meaning of the part in the target language." },
        }
      },
      description: "Crucial for phrases/sentences. Break down key words and grammatical particles."
    }
  },
  required: ["word", "romanization", "definition", "examples", "difficultyLevel"],
};

const generateImage = async (query: string, type: 'word' | 'culture'): Promise<string | undefined> => {
  try {
    const ai = getClient();
    let prompt = "";
    if (type === 'word') {
      prompt = `Generate a cute, simple, flat vector style illustration representing the concept of: "${query}". White background, minimalist, easy to understand. Do not include any text in the image.`;
    } else {
      prompt = `Generate a warm, inviting, flat vector style illustration describing this Korean cultural context: "${query}". White background, minimalist, educational art style. Do not include any text in the image.`;
    }

    if (IMAGE_CACHE.has(prompt)) {
      return IMAGE_CACHE.get(prompt);
    }

    // IMAGE GENERATION TEMPORARILY DISABLED
    // The current free tier key does not support the image generation model reliably.
    // We will return undefined to skip image generation for now.
    return undefined;
  } catch (error) {
    console.warn(`${type} image generation failed:`, error);
    return undefined;
  }
};

const getTextCacheKey = (query: string, lang: string) => {
  return `${TEXT_CACHE_PREFIX}${lang}_${query.trim().toLowerCase()}`;
};

export const lookupWord = async (query: string, targetLanguage: string = "English"): Promise<DictionaryEntry> => {
  const cacheKey = getTextCacheKey(query, targetLanguage);
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as DictionaryEntry;
    }
  } catch (e) {
    console.warn("Cache read failed", e);
    localStorage.removeItem(cacheKey);
  }

  try {
    const ai = getClient();
    // Simplified prompt for speed
    const prompt = `
      Input: "${query}"
      Target Language: ${targetLanguage}
      
      Task: Create a Korean dictionary entry JSON.
      
      If Input is NOT Korean: Translate to common Korean word first.
      
      Rules:
      1. 'word' field: Korean word/phrase.
      2. Explanations/Definitions/Translations: In ${targetLanguage}.
      3. 'romanization': Latin chars only.
      
      Return valid JSON matching schema.
    `;

    const textPromise = ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dictionarySchema,
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster response
        systemInstruction: `You are a Korean tutor. Return JSON only. Explanations in ${targetLanguage}.`,
      },
    });

    const textResponse = await textPromise;
    if (!textResponse.text) throw new Error("No response from AI");

    const entry = JSON.parse(textResponse.text) as DictionaryEntry;

    try {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (e) {
      console.warn("Cache write failed (likely quota exceeded)", e);
    }
    return entry;

  } catch (error: any) {
    console.error("Dictionary Lookup Error:", error);
    let errorMessage = "Failed to search. Please try again.";

    if (error.message?.includes("API Key")) {
      errorMessage = "API Key is missing or invalid.";
    } else if (error.message?.includes("quota")) {
      errorMessage = "API Quota exceeded. Please try again later.";
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

export const lookupEntryImages = async (entry: DictionaryEntry): Promise<{ imageUrl?: string; culturalImageUrl?: string }> => {
  try {
    getClient();
  } catch (e) {
    return {};
  }

  try {
    const wordImagePromise = generateImage(entry.word, 'word');
    const culturalImagePromise = entry.culturalNote
      ? generateImage(entry.culturalNote, 'culture')
      : Promise.resolve(undefined);

    const [imageUrl, culturalImageUrl] = await Promise.all([wordImagePromise, culturalImagePromise]);

    return { imageUrl, culturalImageUrl };
  } catch (error) {
    console.warn("Background image generation failed:", error);
    return {};
  }
};

export const getDailyWord = async (targetLanguage: string = "English"): Promise<DictionaryEntry> => {
  const topics = ["food", "travel", "emotions", "daily routine", "weather", "shopping", "school", "dating", "emergency"];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  return lookupWord(`A random useful beginner Korean word or short phrase related to ${randomTopic}`, targetLanguage);
};

export const getTTSAudio = async (text: string): Promise<AudioBuffer> => {
  const ai = getClient();

  if (!text || !text.trim()) {
    throw new Error("Text is empty");
  }

  if (AUDIO_CACHE.has(text)) {
    return AUDIO_CACHE.get(text)!;
  }

  try {
    // Attempt 1: Try with specific voice config
    // Note: We use "AUDIO" string directly to avoid enum import issues in some bundlers
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: ["AUDIO" as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    let base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    // Fallback: If no audio, try without voice config (sometimes specific voices fail)
    if (!base64Audio) {
      console.warn("First TTS attempt failed (no audio), retrying with default voice...");
      const retryResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: { parts: [{ text: text }] },
        config: {
          responseModalities: ["AUDIO" as any],
        },
      });
      base64Audio = retryResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!base64Audio) {
      console.warn("TTS Failed. Response:", JSON.stringify(response, null, 2));
      throw new Error("No audio data returned from Gemini TTS.");
    }

    const ctx = getAudioContext();
    const audioBuffer = await decodeAudioData(
      decodeBase64(base64Audio),
      ctx,
      24000,
      1
    );

    AUDIO_CACHE.set(text, audioBuffer);
    return audioBuffer;

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};