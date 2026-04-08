from datetime import datetime

from bluetooth import BluetoothPrinter
from selector import selecionar_impressora
from utils import carregar_json, formatar_cpf, gerar_pix_copia_cola, remover_acentos


class MockPrinter:
    def __init__(self, colunas=32):
        self.linhas = []
        self.align = 'left'
        self.colunas = colunas
        self._current_line = ""

    def set(self, align='left', **kwargs):
        self.align = align

    def text(self, txt: str):
        partes = txt.split('\n')
        for i, parte in enumerate(partes):
            if i < len(partes) - 1:
                linha_completa = self._current_line + parte
                if self.align == 'center':
                    self.linhas.append(linha_completa.strip().center(self.colunas))
                elif self.align == 'right':
                    self.linhas.append(linha_completa.strip().rjust(self.colunas))
                else:
                    self.linhas.append(linha_completa)
                self._current_line = ""
            else:
                self._current_line += parte

    def cut(self):
        pass

    def qr(self, content, **kwargs):
        # Desenho ASCII simulando a machadada de um QR Code pro Preview
        self.linhas.append(" ")
        self.linhas.append("██████████████".center(self.colunas))
        self.linhas.append("██ SIMULA   ██".center(self.colunas))
        self.linhas.append("██ QR CODE  ██".center(self.colunas))
        self.linhas.append("██████████████".center(self.colunas))
        self.linhas.append(" ")

    def get_text(self):
        return "\n".join(self.linhas)


def _renderizar(p, loja: dict, pedido: dict, padding: int = 2):
    """Lógica central de impressão — agnóstica à fonte do printer."""

    nome_loja = loja.get('nome', 'ESTABELECIMENTO')

    colunas_suportadas = loja.get('largura_colunas', 30)
    util = colunas_suportadas - (padding * 2)
    pad  = " " * padding

    p.set(align='center')
    p.text(f"{nome_loja}\n\n")

    data_hora = datetime.now().strftime("%d/%m/%Y %H:%M")
    p.text(f"{data_hora}\n\n")

    cpf = pedido.get('cpf')
    if cpf:
        p.text(f"CPF: {formatar_cpf(cpf)}\n")

    p.set(align='left')
    p.text(f"{pad}{'-' * util}\n")

    l_qtd      = 5
    l_preco    = 8
    l_nome_max = util - l_qtd - l_preco

    p.text(f"{pad}{'QTD':<{l_qtd}}{'ITEM':<{l_nome_max}}{'TOTAL':>{l_preco}}\n")
    p.text(f"{pad}{'-' * util}\n")

    total_geral = 0

    for item in pedido.get('itens', []):
        nome_limpo = remover_acentos(str(item['nome']))
        qtd        = item.get('qtd')
        preco      = item.get('preco_uni', 0.0)

        if qtd is None:
            qtd_str    = ""
            total_item = preco
        else:
            qtd_str    = f"{qtd}x"
            total_item = qtd * preco

        total_geral += total_item

        preco_str    = f"{total_item:.2f}"
        nome_cortado = nome_limpo[:l_nome_max - 1]

        linha = f"{pad}{qtd_str:<{l_qtd}}{nome_cortado:<{l_nome_max}}{preco_str:>{l_preco}}\n"
        p.text(linha)

    p.text(f"{pad}{'-' * util}\n")

    descontos = pedido.get('descontos', [])
    if descontos:
        txt_sub = f"SUBTOT: R$ {total_geral:.2f}"
        p.text(f"{pad}{txt_sub.rjust(util)}\n")
        
        for idx, desc in enumerate(descontos):
            nome = remover_acentos(desc.get('nome') or f"Desc {idx+1}")
            tipo = desc.get('tipo', 'valor')
            valor = float(desc.get('valor', 0.0))
            
            if tipo == 'valor':
                abatido = valor
                str_desc = f"- R$ {valor:.2f}"
            else:
                abatido = (total_geral * valor) / 100.0
                str_desc = f"-{valor:g}% ({abatido:.2f})"
            
            total_geral -= abatido
            if total_geral < 0: total_geral = 0
            
            resto = util - len(str_desc)
            nome_c = nome[:resto - 1]
            p.text(f"{pad}{nome_c:<{resto}}{str_desc}\n")
            
        p.text(f"{pad}{'-' * util}\n")

    texto_final = f"TOTAL A PAGAR: R$ {total_geral:.2f}" if descontos else f"TOTAL: R$ {total_geral:.2f}"
    p.text(f"{pad}{texto_final.rjust(util)}\n")

    p.set(align='center')
    p.text("\nObrigado pela preferencia!\n\n")

    chave_pix   = loja.get('chave_pix')
    cidade_loja = loja.get('cidade', '')

    if chave_pix and total_geral > 0:
        pix_copia_cola = gerar_pix_copia_cola(chave_pix, total_geral, nome_loja, cidade_loja)
        p.text("Pague via PIX:\n\n")
        p.qr(pix_copia_cola, size=6, center=True)

    p.cut()

    if isinstance(p, BluetoothPrinter):
        p.flush()


def imprimir_cupom(padding: int = 2):
    """Fluxo interativo via terminal (seleciona impressora pelo menu)."""
    try:
        loja   = carregar_json("loja.json")
        pedido = carregar_json("pedido.json")
        p      = selecionar_impressora()
        print("Imprimindo cupom...\n")
        _renderizar(p, loja, pedido, padding)
        print("✅ Cupom impresso!")
    except ConnectionError as e:
        print(f"\n❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"\n❌ Erro: {e}")


def imprimir_cupom_direto(printer, pedido: dict, padding: int = 2):
    """Chamada pelo servidor web — recebe printer e pedido já montados."""
    loja = carregar_json("loja.json")
    _renderizar(printer, loja, pedido, padding)
