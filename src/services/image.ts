/**
 * image.ts
 * Utilities for monochrome image processing (Threshold & Dithering).
 */

export interface ProcessedImage {
  width: number;
  height: number;
  data: string; // base64 bits
}

export function processMonochrome(
  grayscaleData: Uint8Array,
  width: number,
  height: number,
  method: 'threshold' | 'dither' = 'dither'
): string {
  const result = new Uint8Array(width * height);

  if (method === 'threshold') {
    for (let i = 0; i < grayscaleData.length; i++) {
      result[i] = grayscaleData[i] > 128 ? 0 : 1; // 1 = black, 0 = white
    }
  } else {
    // Floyd-Steinberg Dithering
    const buffer = new Float32Array(grayscaleData);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const oldGray = buffer[idx];
        const newBit = oldGray > 128 ? 0 : 1;
        result[idx] = newBit;

        const actualGray = newBit ? 0 : 255;
        const error = oldGray - actualGray;

        if (x + 1 < width) buffer[idx + 1] += error * 7 / 16;
        if (y + 1 < height) {
          if (x > 0) buffer[idx - 1 + width] += error * 3 / 16;
          buffer[idx + width] += error * 5 / 16;
          if (x + 1 < width) buffer[idx + 1 + width] += error * 1 / 16;
        }
      }
    }
  }

  // Convert to base64
  let binary = '';
  for (let i = 0; i < result.length; i++) {
    binary += String.fromCharCode(result[i]);
  }
  return btoa(binary);
}

/**
 * Helper to process a JSON stored 'logo_raw'
 */
export function processLogo(logoRaw: string, method: 'threshold' | 'dither'): string {
  try {
    const { width, height, data } = JSON.parse(logoRaw);
    // data is base64 grayscale
    const binary = atob(data);
    const uint8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);

    const processedBase64 = processMonochrome(uint8, width, height, method);
    return JSON.stringify({ width, height, data: processedBase64 });
  } catch (e) {
    console.error('Error processing logo:', e);
    return '';
  }
}
