import json
import os
import warnings
import logging
from pathlib import Path

# Oculta mensagens de "FutureWarning" (ex: google-auth avisando sobre EOL do Python 3.9)
warnings.filterwarnings("ignore", category=FutureWarning)

# Oculta o aviso do Flask/Werkzeug: "WARNING: This is a development server..."
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

from flask import Flask, jsonify, request, send_from_directory

from bluetooth import BluetoothPrinter, listar_dispositivos_bluetooth
from cupom import imprimir_cupom_direto, MockPrinter

app = Flask(__name__, static_folder="static")

BASE = Path(__file__).parent
LOJA_PATH     = BASE / "loja.json"
PRODUTOS_PATH = BASE / "produtos.json"


# ─────────────────────────────────────────
#  Helpers de I/O
# ─────────────────────────────────────────

def ler_json(path: Path, default):
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default

def salvar_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─────────────────────────────────────────
#  Frontend
# ─────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


# ─────────────────────────────────────────
#  Loja
# ─────────────────────────────────────────

@app.route("/loja", methods=["GET"])
def get_loja():
    return jsonify(ler_json(LOJA_PATH, {}))

@app.route("/loja", methods=["PUT"])
def put_loja():
    salvar_json(LOJA_PATH, request.json)
    return jsonify({"ok": True})


# ─────────────────────────────────────────
#  Catálogo de Produtos
# ─────────────────────────────────────────

@app.route("/produtos", methods=["GET"])
def get_produtos():
    return jsonify(ler_json(PRODUTOS_PATH, []))

@app.route("/produtos", methods=["POST"])
def add_produto():
    produtos = ler_json(PRODUTOS_PATH, [])
    produto = request.json
    produto["id"] = (max((p["id"] for p in produtos), default=0) + 1)
    produtos.append(produto)
    salvar_json(PRODUTOS_PATH, produtos)
    return jsonify(produto), 201

@app.route("/produtos/<int:pid>", methods=["PUT"])
def update_produto(pid):
    produtos = ler_json(PRODUTOS_PATH, [])
    for i, p in enumerate(produtos):
        if p["id"] == pid:
            produtos[i] = {**request.json, "id": pid}
            salvar_json(PRODUTOS_PATH, produtos)
            return jsonify(produtos[i])
    return jsonify({"erro": "Produto não encontrado"}), 404

@app.route("/produtos/<int:pid>", methods=["DELETE"])
def delete_produto(pid):
    produtos = ler_json(PRODUTOS_PATH, [])
    produtos = [p for p in produtos if p["id"] != pid]
    salvar_json(PRODUTOS_PATH, produtos)
    return jsonify({"ok": True})


# ─────────────────────────────────────────
#  Impressoras disponíveis
# ─────────────────────────────────────────

@app.route("/impressoras", methods=["GET"])
def get_impressoras():
    dispositivos = [
        {"tipo": "bluetooth", "label": d["nome"], "value": d["path"]}
        for d in listar_dispositivos_bluetooth()
    ]
    ip = os.environ.get("PRINTER_IP")
    if ip:
        dispositivos.insert(0, {
            "tipo": "rede",
            "label": f"Rede — {ip}",
            "value": ip
        })
    return jsonify(dispositivos)


# ─────────────────────────────────────────
#  Impressão e Teste
# ─────────────────────────────────────────

# Instância global para manter a conexão aberta (idêntico a um app mobile)
CURRENT_PRINTER = None

@app.route("/testar-impressora", methods=["POST"])
def testar_impressora():
    global CURRENT_PRINTER
    impressora_cfg = request.json
    try:
        if impressora_cfg.get("tipo") == "bluetooth":
            path = impressora_cfg["value"]
            if CURRENT_PRINTER and getattr(CURRENT_PRINTER, 'path', None) != path:
                CURRENT_PRINTER.close()
                CURRENT_PRINTER = None
                
            if not CURRENT_PRINTER:
                CURRENT_PRINTER = BluetoothPrinter(path)
            
            # Apenas envia um comando vazio / flush para atestar a conexão
            CURRENT_PRINTER.flush()
        else:
            from escpos.printer import Network
            printer = Network(impressora_cfg["value"])
            if hasattr(printer, 'close'):
                printer.close()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@app.route("/imprimir", methods=["POST"])
def imprimir():
    global CURRENT_PRINTER
    body = request.json
    # body = { impressora: {tipo, value}, pedido: {cpf, itens: [{nome, qtd, preco_uni}]} }

    impressora_cfg = body.get("impressora", {})
    pedido         = body.get("pedido", {})

    try:
        if impressora_cfg.get("tipo") == "bluetooth":
            path = impressora_cfg["value"]
            if CURRENT_PRINTER and getattr(CURRENT_PRINTER, 'path', None) != path:
                CURRENT_PRINTER.close()
                CURRENT_PRINTER = None
                
            if not CURRENT_PRINTER:
                CURRENT_PRINTER = BluetoothPrinter(path)
            
            imprimir_cupom_direto(CURRENT_PRINTER, pedido)
            CURRENT_PRINTER.flush()
        else:
            from escpos.printer import Network
            printer = Network(impressora_cfg["value"])
            imprimir_cupom_direto(printer, pedido)

        return jsonify({"ok": True})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/testar-largura", methods=["POST"])
def testar_largura():
    global CURRENT_PRINTER
    body = request.json
    impressora_cfg = body.get("impressora", {})
    colunas = body.get("colunas", 32)

    try:
        if impressora_cfg.get("tipo") == "bluetooth":
            path = impressora_cfg.get("value")
            if CURRENT_PRINTER and getattr(CURRENT_PRINTER, 'path', None) != path:
                CURRENT_PRINTER.close()
                CURRENT_PRINTER = None
            if not CURRENT_PRINTER:
                CURRENT_PRINTER = BluetoothPrinter(path)
            printer = CURRENT_PRINTER
        else:
            from escpos.printer import Network
            printer = Network(impressora_cfg["value"])

        regua = "".join([str(i % 10) for i in range(1, colunas + 1)])
        linha_limite = f"123{'FIM':>{colunas-3}}"
        
        printer.set(align="left")
        printer.text("--- TESTE RAPIDO ---\n")
        printer.text(f"Col: {colunas}\n")
        printer.text(f"{regua}\n")
        printer.text(f"{linha_limite}\n\n\n\n")

        if impressora_cfg.get("tipo") == "bluetooth":
            printer.flush()
            
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route("/preview", methods=["POST"])
def preview():
    body = request.json
    pedido = body.get("pedido", {})
    loja = ler_json(LOJA_PATH, {})
    colunas = loja.get("largura_colunas", 30)
    
    mock = MockPrinter(colunas)
    imprimir_cupom_direto(mock, pedido)
    
    return jsonify({"texto": mock.get_text()})


# ─────────────────────────────────────────
#  Importação de Fatura via IA
# ─────────────────────────────────────────

@app.route("/analisar-fatura", methods=["POST"])
def analisar_fatura():
    if genai is None:
        return jsonify({"erro": "O pacote google-genai não está instalado. Instale no terminal com: pip3 install google-genai"}), 500

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return jsonify({"erro": "A variável GEMINI_API_KEY não foi encontrada no arquivo .env"}), 500

    client = genai.Client(api_key=api_key)

    data = request.json
    texto = data.get("texto", "")
    imagem_b64 = data.get("imagem_base64")
    mime_type = data.get("mime_type", "image/jpeg")

    prompt = """
Você é um assistente especializado em extrair itens de compras de faturas de cartão de crédito ou recibos.
Sua tarefa principal é limpar e formatar os nomes das compras para um formato amigável, legível e bonito (o mais limpo possível).
Exemplos de limpeza:
- "Mercadopago *Fortpss" -> "Fortpss"
- "Mlp*Kabum-Jackeletroin" -> "Kabum Jackeletroin"
- "Pg *Uber Trip" -> "Uber Trip"
- "Ifd*Ifood" -> "iFood"
Remova nomes de processadoras de pagamento (MercadoPago, PagSeguro, Paypal, etc.), asteriscos e códigos sem sentido, deixando apenas o nome real do estabelecimento.

Extraia cada linha de compra, identifique o nome limpo, e o valor.
Retorne a saída estritamente em formato JSON como uma lista de objetos, usando as seguintes chaves:
"nome" (string, máximo 30 caracteres, o nome amigável/limpo do item ou loja),
"preco_uni" (float, valor da compra),
"qtd" (inteiro, use 1 a menos que claramente indicado outro valor).
Exemplo de retorno esperado: [{"nome": "Uber Trip", "preco_uni": 24.50, "qtd": 1}, {"nome": "Kabum", "preco_uni": 120.00, "qtd": 1}]

Não retorne explicações ou markdown adicionais fora do bloco JSON. Responda apenas com a lista em JSON puro.
"""

    try:
        contents = [prompt]
        if texto:
            contents.append(f"Fatura transcrita/texto:\n{texto}")
            
        if imagem_b64:
            import base64
            img_bytes = base64.b64decode(imagem_b64)
            contents.append(
                types.Part.from_bytes(
                    data=img_bytes,
                    mime_type=mime_type,
                )
            )

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        resposta_texto = response.text.strip()
        itens = json.loads(resposta_texto)
        return jsonify({"ok": True, "itens": itens})

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


if __name__ == "__main__":
    print("🖨️  Servidor da impressora rodando em http://localhost:8080")
    app.run(host="0.0.0.0", port=8080, debug=False)
