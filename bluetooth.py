import asyncio
from bleak import BleakScanner, BleakClient

def listar_dispositivos_bluetooth() -> list[dict]:
    """
    Lista dispositivos BLE próximos que podem ser impressoras.
    Utiliza asyncio.run para manter a interface síncrona.
    """
    async def _scan():
        try:
            # discover() retorna lista de BLEDevice
            devices = await BleakScanner.discover(timeout=5.0)
            resultado = []
            for d in devices:
                nome = d.name if d.name else "Dispositivo sem nome"
                # No macOS, d.address é o UUID
                resultado.append({"nome": nome, "path": d.address})
            return resultado
        except Exception as e:
            print(f"Erro ao escanear dispositivos BLE: {e}")
            return []

    return asyncio.run(_scan())


class BluetoothPrinter:
    """
    Acumula comandos ESC/POS em um buffer e, quando flush() é chamado,
    conecta assincronamente (via Bleak) à impressora BLE, transmite tudo 
    e desconecta.
    """

    INIT    = b'\x1b\x40'
    ALIGN_L = b'\x1b\x61\x00'
    ALIGN_C = b'\x1b\x61\x01'
    ALIGN_R = b'\x1b\x61\x02'
    FEED4   = b'\x0a\x0a\x0a\x0a'

    def __init__(self, path: str):
        self.path = path  # UUID da impressora no mac
        self.buffer = bytearray()
        self._raw(self.INIT)

    def _raw(self, data: bytes):
        """Apenas acumula os bytes no buffer."""
        self.buffer.extend(data)

    def set(self, align: str = 'left', **kwargs):
        cmds = {'center': self.ALIGN_C, 'right': self.ALIGN_R}
        self._raw(cmds.get(align, self.ALIGN_L))

    def text(self, txt: str):
        self._raw(txt.encode('ascii', errors='replace'))

    def qr(self, content: str, size: int = 6, **kwargs):
        """Gera QR Code via comandos ESC/POS nativos (GS ( k)."""
        data = content.encode('ascii', errors='replace')
        n = len(data) + 3
        pL = n & 0xFF
        pH = (n >> 8) & 0xFF

        self._raw(self.ALIGN_C)
        self._raw(b'\x1d\x28\x6b\x04\x00\x31\x41\x32\x00')  # Modelo QR 2
        self._raw(bytes([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, size]))  # Tamanho módulo
        self._raw(b'\x1d\x28\x6b\x03\x00\x31\x45\x30')       # Correção de erro: L
        self._raw(bytes([0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]) + data)  # Dados
        self._raw(b'\x1d\x28\x6b\x03\x00\x31\x51\x30')       # Imprimir QR
        self._raw(self.ALIGN_L)

    def cut(self):
        self._raw(self.FEED4)

    async def _flush_async(self):
        if not self.buffer:
            return

        print(f"📠 Conectando BLE à impressora (UUID: {self.path})...")
        try:
            async with BleakClient(self.path) as client:
                enviado = False
                # Procura por uma característica que aceite escrita
                for service in client.services:
                    for char in service.characteristics:
                        if "write" in char.properties or "write-without-response" in char.properties:
                            # Envia o buffer em pedaços (chunks) pequenos
                            # Impressoras térmicas baratas não aguentam receber 500 bytes de uma vez via BLE 
                            # sem Ack (response=False), pois o buffer interno dá wrap-around e corrompe a impressão.
                            chunk_size = 50
                            data = bytes(self.buffer)
                            for i in range(0, len(data), chunk_size):
                                chunk = data[i:i+chunk_size]
                                await client.write_gatt_char(char.uuid, chunk, response=False)
                                await asyncio.sleep(0.03) # Pausa para a impressora respirar e digerir os bits
                            enviado = True
                            break
                    if enviado: 
                        break

                if enviado:
                    await asyncio.sleep(1)  # Tempo para a impressora processar
                else:
                    raise ConnectionError("Nenhuma característica BLE para escrita encontrada na impressora.")

        except Exception as e:
            raise ConnectionError(f"Erro ao comunicar com a impressora BLE: {e}")
        finally:
            self.buffer.clear()

    def flush(self):
        """
        Bloqueia a thread atual e roda o loop assíncrono para enviar 
        os bytes à impressora BLE.
        """
        asyncio.run(self._flush_async())

    def close(self):
        """
        O Bleak gerencia as conexões na cláusula 'async with', 
        logo o close sincrono apenas limpa o buffer pendente (se houver).
        """
        self.buffer.clear()
