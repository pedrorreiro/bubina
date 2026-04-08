import sys
import json
from bluetooth import BluetoothPrinter
from cupom import imprimir_cupom_direto

def main():
    if len(sys.argv) < 3:
        print("Uso: print_worker.py <test|print> <path_impressora> [arquivo_pedido.json]")
        sys.exit(1)
        
    action = sys.argv[1]
    path = sys.argv[2]
    
    try:
        printer = BluetoothPrinter(path)
        
        if action == "test":
            # Apenas conecta e desconecta para atestar que funciona
            printer.close()
            print("Teste finalizado.")
        
        elif action == "print":
            pedido_file = sys.argv[3]
            with open(pedido_file, "r", encoding="utf-8") as f:
                pedido = json.load(f)
            imprimir_cupom_direto(printer, pedido)
            print("Impressão finalizada.")
            
    except Exception as e:
        print(f"Erro no worker: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
