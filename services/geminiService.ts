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

    // Model strategy: Try efficient models first, then fall back to older/stable ones
    // We strictly use the "001" or "002" versions? No, aliases are usually safer for updates, but fixed versions solve "alias not found".
    // Let's mix: 1.5-flash (alias), 1.5-pro (alias), gemini-pro (legacy 1.0)
    const candidates = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-1.0-pro"];

    let lastError: any = null;

    for (const model of candidates) {
      console.log(`Attempting search with model: ${model}`);
      try {
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
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: dictionarySchema,
            systemInstruction: `You are a Korean tutor. Return JSON only. Explanations in ${targetLanguage}.`,
          },
        });

        const textResponse = await textPromise;
        if (!textResponse.text) throw new Error("No response from AI");

        const entry = JSON.parse(textResponse.text) as DictionaryEntry;

        try {
          localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (e) {
          console.warn("Cache write failed", e);
        }

        // If successful, return immediately
        return entry;

      } catch (error: any) {
        console.warn(`Model ${model} failed:`, error.message);
        lastError = error;

        // If error is NOT a 404/Not Found, we usually shouldn't retry (e.g. Quota/Auth errors),
        // BUT for "Quota", sometimes different models have different free buckets?
        // Let's retry on 404 and 429 (Quota) just in case, but stop on 400 (Bad Request).
        const errString = error.message || error.toString();

        // If Invalid Argument (Key) -> Stop immediately, don't retry others
        if (errString.match(/API\s?Key/i)) throw error;
      }
    }

    // If loop finishes without success, throw the last error
    if (lastError) throw lastError;
    throw new Error("All models failed.");

  } catch (error: any) {
    console.error("Dictionary Lookup Error:", error);
    let errorMessage = "Failed to search. Please try again.";

    const errString = error.message || error.toString();

    if (errString.match(/API\s?Key/i) || errString.includes("400")) {
      errorMessage = "API Key가 잘못되었습니다. (Invalid API Key)";
    } else if (errString.includes("quota") || errString.includes("429")) {
      errorMessage = "하루 무료 사용량을 초과했습니다. (Quota Exceeded)";
    } else if (errString.includes("not found") || errString.includes("404")) {
      errorMessage = "모델을 찾을 수 없습니다. (Model Not Found)";
    } else {
      errorMessage = `오류가 발생했습니다: ${errString.substring(0, 100)}...`;
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
      model: "gemini-1.5-flash-001",
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
        model: "gemini-1.5-flash-001",
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