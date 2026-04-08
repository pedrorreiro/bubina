import asyncio
from bleak import BleakClient
from bluetooth import BluetoothPrinter

# Usaremos o mesmo UUID que o log acusa: A18F253D-B7C0-82EA-6F3F-F92462366138
UUID_IMPRESSORA = "A18F253D-B7C0-82EA-6F3F-F92462366138"

async def testar_fontes():
    print(f"📠 Conectando à impressora {UUID_IMPRESSORA} para teste de fontes...")
    try:
        p = BluetoothPrinter(UUID_IMPRESSORA)
        
        # 1. Teste da Fonte A (Normal)
        p.font_size('normal')
        p.text("--- FONTE A (Normal) ---\n")
        p.text("12345678901234567890123456789012\n") # 32 colunas régua
        p.text("ABCDEFGHIJ ABCDEFGHIJ ABCDEFGHIJ\n")
        p.text("Pizza M Calabreza e Mussarela 99\n")
        p.text("\n")
        
        # 2. Teste da Fonte B (Pequena)
        p.font_size('pequena')
        p.text("--- FONTE B (Pequena / Compacta) ---\n")
        p.text("123456789012345678901234567890123456789012\n") # 42 colunas régua
        p.text("ABCDEFGHIJ ABCDEFGHIJ ABCDEFGHIJ ABCDEFGHI\n")
        p.text("Pizza M Calabreza e Mussarela         99.0\n")
        p.text("\n\n\n\n")
        
        # Como o método flush() original era síncrono e estamos num contexto asyncio (no script nativo foi feito pra API web),
        # podemos chamar a função assíncrona raiz `_flush_async` pra despachar os dados aqui no nosso teste
        await p._flush_async()
        print("✅ Impressão de teste enviada com sucesso!")

    except Exception as e:
        print(f"❌ Erro ao conectar/imprimir: {e}")

if __name__ == "__main__":
    asyncio.run(testar_fontes())
