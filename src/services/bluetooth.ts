/**
 * BluetoothPrinter — TypeScript port of bluetooth.py using the Web Bluetooth API.
 *
 * Usage:
 *   const printer = await BluetoothPrinter.connect();
 *   printer.set('center');
 *   printer.text('Hello!\n');
 *   printer.cut();
 *   await printer.flush();
 */

import {
  CMD_INIT,
  CMD_ALIGN_L,
  CMD_ALIGN_C,
  CMD_ALIGN_R,
  CMD_FEED4,
  encodeText,
  encodeQR,
  encodeImage,
  concatBuffers,
} from "./escpos";

// ── Web Bluetooth type declarations ──────────────────────────────────────────

declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
      getDevices(): Promise<BluetoothDevice[]>;
    };
  }

  interface RequestDeviceOptions {
    acceptAllDevices?: boolean;
    filters?: Array<{ services?: string[]; namePrefix?: string }>;
    optionalServices?: string[];
  }

  interface BluetoothDevice {
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean;
    connect(): Promise<BluetoothRemoteGATTServer>;
    getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
  }

  interface BluetoothRemoteGATTService {
    getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
  }

  interface BluetoothRemoteGATTCharacteristic {
    uuid: string;
    properties: {
      write: boolean;
      writeWithoutResponse: boolean;
    };
    writeValue(value: BufferSource): Promise<void>;
    writeValueWithoutResponse(value: BufferSource): Promise<void>;
  }
}

// ── Printer class ─────────────────────────────────────────────────────────────

export class BluetoothPrinter {
  private buffers: Uint8Array[] = [];
  private align: "left" | "center" | "right" = "left";
  private device: BluetoothDevice;

  private constructor(device: BluetoothDevice) {
    this.device = device;
    // Start with a clean buffer
    this.buffers = [CMD_INIT];
  }

  /** Opens the Chrome device picker and builds a BluetoothPrinter instance. */
  static async connect(): Promise<BluetoothPrinter> {
    if (!navigator.bluetooth) {
      const isIOS =
        /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);

      if (isIOS) {
        throw new Error(
          "O iPhone/iPad não suporta impressão via Bluetooth neste navegador. Por favor, use o navegador gratuito 'Bluefy' ou o 'WebBLE' para imprimir.",
        );
      }

      throw new Error(
        "Web Bluetooth não suportado neste navegador. No Desktop ou Android, utilize o Google Chrome ou Microsoft Edge.",
      );
    }
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "00001910-0000-1000-8000-00805f9b34fb", // TY
        "000018f0-0000-1000-8000-00805f9b34fb", // Generic
        "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
        "49535343-fe7d-4ae5-8fa9-9fafd205e455",
        "0000fee7-0000-1000-8000-00805f9b34fb",
        "0000e781-0000-1000-8000-00805f9b34fb",
        "0000ff00-0000-1000-8000-00805f9b34fb",
      ],
    });
    return BluetoothPrinter.linkDevice(device);
  }

  /** Gets a list of devices the user has already granted permission to. */
  static async getAuthorizedDevices(): Promise<BluetoothDevice[]> {
    if (!navigator.bluetooth || !navigator.bluetooth.getDevices) return [];
    try {
      const devices = await navigator.bluetooth.getDevices();
      return devices.filter((d) => d.name);
    } catch {
      return [];
    }
  }

  /** Wraps an existing native device into our high-level BluetoothPrinter class. */
  static linkDevice(device: BluetoothDevice): BluetoothPrinter {
    return new BluetoothPrinter(device);
  }

  get name(): string {
    return this.device.name ?? "Impressora BLE";
  }

  set(align: "left" | "center" | "right" = "left"): void {
    this.align = align;
    const cmd =
      align === "center"
        ? CMD_ALIGN_C
        : align === "right"
          ? CMD_ALIGN_R
          : CMD_ALIGN_L;
    this.buffers.push(cmd);
  }

  text(txt: string): void {
    this.buffers.push(encodeText(txt));
  }

  image(dataJson: string): void {
    try {
      const { width, height, data } = JSON.parse(dataJson);
      // data is expected to be a base64 string of a Uint8Array
      const binary = atob(data);
      const uint8 = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);

      this.buffers.push(encodeImage(uint8, width, height));
    } catch (e) {
      console.error("Erro ao processar imagem para a impressora:", e);
    }
  }

  imageUrl(url: string): void {
    void url;
    // Physical printers cannot process URLs directly. 
    // The image must be fetched and processed into bits before calling image().
    console.warn("BluetoothPrinter: imageUrl called but not supported. Use pre-processed bits with image() instead.");
  }

  qr(content: string, size = 6): void {
    this.buffers.push(encodeQR(content, size));
  }

  cut(): void {
    this.buffers.push(CMD_FEED4);
  }

  /**
   * Connects via GATT, finds a writable characteristic, sends the buffer in
   * 50-byte chunks with a 30 ms delay between each (mirrors Python flush()).
   */
  async flush(): Promise<void> {
    const data = concatBuffers(this.buffers);
    if (!data.length) return;

    const gatt = this.device.gatt;
    if (!gatt) throw new Error("Dispositivo sem suporte GATT.");

    const server = await gatt.connect();
    const services = await server.getPrimaryServices();

    let characteristic: BluetoothRemoteGATTCharacteristic | null = null;

    outer: for (const svc of services) {
      const chars = await svc.getCharacteristics();
      for (const ch of chars) {
        if (ch.properties.write || ch.properties.writeWithoutResponse) {
          characteristic = ch;
          break outer;
        }
      }
    }

    if (!characteristic) {
      throw new Error(
        "Nenhuma característica BLE para escrita encontrada na impressora.",
      );
    }

    const CHUNK = 50;

    for (let i = 0; i < data.length; i += CHUNK) {
      const chunk = data.slice(i, i + CHUNK);
      // Try both methods safely - some hardware is picky
      try {
        if (characteristic.properties.writeWithoutResponse) {
          await characteristic.writeValueWithoutResponse(chunk);
        } else {
          await characteristic.writeValue(chunk);
        }
      } catch {
        // Fallback to writeValue if the first one fails
        await characteristic.writeValue(chunk);
      }

      // Delay slightly increased for hardware processing
      await new Promise((r) => setTimeout(r, 50));
    }

    // Final processing pause
    await new Promise((r) => setTimeout(r, 500));

    // Reset buffer but keep INIT for next batch
    this.buffers = [CMD_INIT];
  }
}
