import sys
import multiprocessing
import json
from bluetooth import BluetoothPrinter
from cupom import imprimir_cupom_direto

def _mp_imprimir_bluetooth(path, pedido):
    try:
        printer = BluetoothPrinter(path)
        imprimir_cupom_direto(printer, pedido)
        print(f"Subprocesso terminou de enviar para impressora: {path}")
    except Exception as e:
        print(f"Erro no subprocesso: {e}", file=sys.stderr)
        raise

if __name__ == '__main__':
    from bluetooth import listar_dispositivos_bluetooth
    dispos = listar_dispositivos_bluetooth()
    if not dispos:
        print("Nenhum dispositivo bluetooth pareado/encontrado.")
        sys.exit(1)
        
    path = dispos[0]['path']
    print(f"Usando dispositivo: {path}")
    
    try:
        with open("pedido.json", "r", encoding="utf-8") as f:
            pedido = json.load(f)
    except FileNotFoundError:
        pedido = {"cpf": "", "itens": [{"nome": "Item Teste", "qtd": 1, "preco_uni": 1.99}]}
        
    print("Iniciando processo paralelo...")
    p = multiprocessing.Process(target=_mp_imprimir_bluetooth, args=(path, pedido))
    p.start()
    p.join()
    
    print(f"Processo paralelo finalizou com código {p.exitcode}")
