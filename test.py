import json
from bluetooth import BluetoothPrinter
from cupom import imprimir_cupom_direto

try:
    with open("loja.json", "r") as f:
        loja = json.load(f)
        
    with open("pedido.json", "r") as f:
        pedido = json.load(f)
        
    print("Connecting...")
    # hardcoded or take from list?
    from bluetooth import listar_dispositivos_bluetooth
    dispositivos = listar_dispositivos_bluetooth()
    if not dispositivos:
        print("No bluetooth devices found")
        exit(1)
        
    path = dispositivos[0]['path']
    print(f"Connecting to {path}")
    printer = BluetoothPrinter(path)
    
    print("Printing...")
    imprimir_cupom_direto(printer, pedido)
    print("Done")
except Exception as e:
    print(f"Error: {e}")
