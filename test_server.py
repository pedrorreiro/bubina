import requests
import json

with open("pedido.json", "r") as f:
    pedido = json.load(f)

# assuming path is /dev/tty.KA-1445 based on test.py
payload = {
    "impressora": {"tipo": "bluetooth", "label": "KA-1445", "value": "/dev/tty.KA-1445"},
    "pedido": pedido
}

r = requests.post("http://localhost:8080/imprimir", json=payload)
print(r.status_code)
print(r.text)
