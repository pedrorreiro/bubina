import asyncio
from bleak import BleakClient
from bluetooth import BluetoothPrinter

UUID_IMPRESSORA = "A18F253D-B7C0-82EA-6F3F-F92462366138"

async def testar():
    p = BluetoothPrinter(UUID_IMPRESSORA)
    
    # Reset normal
    p._raw(b'\x1b\x40')
    p.text("TESTE FONTE NORMAL (ESC ! 0)\n")
    p._raw(b'\x1b\x21\x00') 
    p.text("123456789\n\n")

    p.text("TESTE FONTE PEQUENA (ESC ! 1)\n")
    p._raw(b'\x1b\x21\x01') 
    p.text("123456789\n\n")
    
    p._raw(b'\x1b\x21\x00') 
    
    await p._flush_async()

asyncio.run(testar())
