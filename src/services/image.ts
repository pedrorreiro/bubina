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
 * Fetches an image from a URL and processes it for the thermal printer.
 */
export async function fetchAndProcessLogo(url: string, method: 'threshold' | 'dither' = 'dither'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get canvas context");

      const targetWidth = 240;
      const scale = targetWidth / img.width;
      const targetHeight = Math.floor(img.height * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      const grayscaleData = new Uint8Array(targetWidth * targetHeight);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        grayscaleData[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
      }

      const processedBase64 = processMonochrome(grayscaleData, targetWidth, targetHeight, method);
      resolve(JSON.stringify({ width: targetWidth, height: targetHeight, data: processedBase64 }));
    };
    img.onerror = reject;
    img.src = url;
  });
}
