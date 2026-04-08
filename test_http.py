import requests
import json

try:
    with open("pedido.json", "r") as f:
        pedido = json.load(f)

    # assuming path is /dev/tty.KA-1445 based on test.py
    payload = {
        "impressora": {"tipo": "bluetooth", "label": "KA-1445", "value": "/dev/tty.KA-1445"},
        "pedido": pedido
    }

    print("Sending POST request to /imprimir...")
    r = requests.post("http://localhost:8080/imprimir", json=payload, timeout=10)
    print("Status:", r.status_code)
    print("Response:", r.text)
except Exception as e:
    print("Error:", e)
