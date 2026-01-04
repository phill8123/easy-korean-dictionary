let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // Ensure even byte length for Int16Array
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
    alignedData = data.slice(0, data.byteLength - 1);
  }

  if (alignedData.byteLength === 0) {
      throw new Error("Audio data is empty after alignment.");
  }

  const dataInt16 = new Int16Array(
    alignedData.buffer, 
    alignedData.byteOffset, 
    alignedData.byteLength / 2
  );
  
  const frameCount = dataInt16.length / numChannels;
  
  if (frameCount === 0) {
      throw new Error("Audio frame count is zero.");
  }

  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function playBuffer(buffer: AudioBuffer): Promise<void> {
  const ctx = getAudioContext();

  try {
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
  } catch (e) {
      console.warn("Failed to resume audio context:", e);
  }

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => resolve();
    source.start();
  });
}