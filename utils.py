import json
import unicodedata
from pixqrcode import PixQrCode


from typing import Optional


def carregar_json(caminho: str) -> dict:
    with open(caminho, 'r', encoding='utf-8') as f:
        return json.load(f)


def formatar_cpf(cpf: str) -> str:
    if cpf and len(cpf) == 11:
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"
    return cpf


def remover_acentos(texto: str) -> str:
    """Remove acentos para evitar que a impressora térmica crashe com mal encoding UTF-8."""
    try:
        texto = str(texto)
        texto = unicodedata.normalize('NFD', texto)
        return texto.encode('ascii', 'ignore').decode('utf-8')
    except Exception:
        return texto


def gerar_pix_copia_cola(chave_pix: str, valor: float, nome_loja: str, cidade_loja: str) -> Optional[str]:
    if not chave_pix:
        return None
    nome_limpo   = remover_acentos(''.join(c for c in nome_loja   if c.isalnum() or c == ' ')[:25].strip())
    cidade_limpa = remover_acentos(''.join(c for c in cidade_loja if c.isalnum() or c == ' ')[:15].strip())
    pix = PixQrCode(name=nome_limpo, key=chave_pix, city=cidade_limpa, amount=f"{valor:.2f}")
    return pix.generate_code()
