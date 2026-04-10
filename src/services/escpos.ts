/**
 * ESC/POS command encoder — port of bluetooth.py (Python) to TypeScript.
 * Builds raw byte arrays exactly as the Python BluetoothPrinter does.
 */

// ── Control bytes ─────────────────────────────────────────────────────────────
export const ESC = 0x1b;
export const GS  = 0x1d;
export const LF  = 0x0a;

export const CMD_INIT    = new Uint8Array([ESC, 0x40]);
export const CMD_ALIGN_L = new Uint8Array([ESC, 0x61, 0x00]);
export const CMD_ALIGN_C = new Uint8Array([ESC, 0x61, 0x01]);
export const CMD_ALIGN_R = new Uint8Array([ESC, 0x61, 0x02]);
export const CMD_FEED4   = new Uint8Array([LF, LF, LF, LF]);

// ── Text helpers ──────────────────────────────────────────────────────────────

/**
 * Remove accents and encode to ASCII (mirrors remover_acentos() in utils.py)
 * Thermal printers often crash on non-ASCII bytes.
 */
export function encodeText(text: string): Uint8Array {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const bytes: number[] = [];
  for (const ch of normalized) {
    const code = ch.charCodeAt(0);
    bytes.push(code < 128 ? code : 0x3f); // '?' for non-ASCII
  }
  return new Uint8Array(bytes);
}

// ── QR Code (ESC/POS GS ( k) ──────────────────────────────────────────────────

/**
 * Encodes a QR code using ESC/POS GS ( k commands.
 * Mirrors the BluetoothPrinter.qr() method in Python.
 */
export function encodeQR(content: string, size: number = 6): Uint8Array {
  const data = encodeText(content);
  const n  = data.length + 3;
  const pL = n & 0xff;
  const pH = (n >> 8) & 0xff;

  const parts: Uint8Array[] = [
    CMD_ALIGN_C,
    // Model QR2
    new Uint8Array([GS, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),
    // Module size
    new Uint8Array([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size]),
    // Error correction: L
    new Uint8Array([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30]),
    // Store data
    new Uint8Array([GS, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...data]),
    // Print QR
    new Uint8Array([GS, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]),
    CMD_ALIGN_L,
  ];

  const total = parts.reduce((s, a) => s + a.length, 0);
  const out   = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

// ── Buffer builder ────────────────────────────────────────────────────────────

export function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const out   = new Uint8Array(total);
  let off = 0;
  for (const b of buffers) { out.set(b, off); off += b.length; }
  return out;
}

// ── Images (ESC/POS GS v 0) ───────────────────────────────────────────────────

/**
 * Encodes a monochrome bitmap into ESC/POS raster bit image format (GS v 0).
 * Expects a Uint8Array of 1-bit values (0 for white, 1 for black), width and height.
 */
export function encodeImage(data: Uint8Array, width: number, height: number): Uint8Array {
  // width must be multiple of 8 for bit packing
  const bytesPerRow = Math.ceil(width / 8);
  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;

  const header = new Uint8Array([0x1d, 0x76, 0x30, 0, xL, xH, yL, yH]);
  const raster = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bit = data[y * width + x]; // 1 = black, 0 = white
      if (bit) {
        const byteIdx = y * bytesPerRow + Math.floor(x / 8);
        const bitIdx = 7 - (x % 8);
        raster[byteIdx] |= (1 << bitIdx);
      }
    }
  }

  return concatBuffers([header, raster]);
}
