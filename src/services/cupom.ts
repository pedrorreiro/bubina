/**
 * cupom.ts — port of cupom.py
 * Contains the full receipt layout logic and the MockPrinter for live preview.
 */

import { encodeText } from './escpos';
import { gerarPixCopiaECola } from './pix';
import { processLogo } from './image';
import type { Loja, Pedido } from '../types';

// ── Printer interface ─────────────────────────────────────────────────────────

/** Minimal interface satisfied by both BluetoothPrinter and MockPrinter. */
export interface Printer {
  set(align: 'left' | 'center' | 'right'): void;
  text(txt: string): void;
  image(base64: string): void;
  qr(content: string, size?: number): void;
  cut(): void;
}

// ── MockPrinter (live preview) ────────────────────────────────────────────────

/**
 * Implements Printer but renders to a text string instead of bytes.
 * Direct port of the Python MockPrinter class.
 */
export class MockPrinter implements Printer {
  private lines: string[] = [];
  private currentLine = '';
  private alignMode: 'left' | 'center' | 'right' = 'left';
  readonly colunas: number;

  constructor(colunas = 32) {
    this.colunas = colunas;
  }

  set(align: 'left' | 'center' | 'right' = 'left'): void {
    this.alignMode = align;
  }

  text(txt: string): void {
    const parts = txt.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i < parts.length - 1) {
        const full = this.currentLine + parts[i];
        if (this.alignMode !== 'left') {
          this.lines.push(`[ALIGN:${this.alignMode}]${full}[/ALIGN]`);
        } else {
          this.lines.push(full);
        }
        this.currentLine = '';
      } else {
        this.currentLine += parts[i];
      }
    }
  }

  image(base64: string): void {
    this.lines.push(`[IMG:${base64}]`);
  }

  qr(_content: string, _size = 6): void {
    this.lines.push(' ');
    this.lines.push('██████████████'.padStart((this.colunas + 14) / 2).padEnd(this.colunas));
    this.lines.push('██ SIMULA   ██'.padStart((this.colunas + 14) / 2).padEnd(this.colunas));
    this.lines.push('██ QR CODE  ██'.padStart((this.colunas + 14) / 2).padEnd(this.colunas));
    this.lines.push('██████████████'.padStart((this.colunas + 14) / 2).padEnd(this.colunas));
    this.lines.push(' ');
  }

  cut(): void { /* no-op */ }

  getText(): string {
    return this.lines.join('\n');
  }
}

// ── Format helpers ────────────────────────────────────────────────────────────

function formatarCpf(cpf: string): string {
  if (cpf && cpf.length === 11) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }
  return cpf;
}

function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ── Core renderer ─────────────────────────────────────────────────────────────

/**
 * Central print logic — printer-agnostic.
 * Direct port of _renderizar() from cupom.py.
 */
export function renderizarCupom(
  p: Printer,
  pedido: Pedido,
  loja: Loja,
  padding = 2,
): void {
  const nomeLoja = loja.nome || 'ESTABELECIMENTO';
  const colunas  = loja.largura_colunas || 32;
  const util     = colunas - padding * 2;
  const pad      = ' '.repeat(padding);

  p.set('center');
  if (loja.logo) {
    p.image(loja.logo);
    p.text('\n');
  }
  p.text(`${nomeLoja}\n\n`);

  const now = new Date();
  const dataHora = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  p.text(`${dataHora}\n\n`);

  if (pedido.cpf) {
    p.text(`CPF: ${formatarCpf(pedido.cpf)}\n`);
  }

  p.set('left');
  p.text(`${pad}${'-'.repeat(util)}\n`);

  const lQtd     = 5;
  const lPreco   = 8;
  const lNomeMax = util - lQtd - lPreco;

  p.text(`${pad}${'QTD'.padEnd(lQtd)}${'ITEM'.padEnd(lNomeMax)}${'TOTAL'.padStart(lPreco)}\n`);
  p.text(`${pad}${'-'.repeat(util)}\n`);

  let totalGeral = 0;

  for (const item of pedido.itens) {
    const nomeLimpo = removerAcentos(String(item.nome));
    const qtd       = item.qtd;
    const preco     = item.preco_uni ?? 0;

    const qtdStr    = qtd === null ? '' : `${qtd}x`;
    const totalItem = qtd === null ? preco : qtd * preco;
    totalGeral      += totalItem;

    const precoStr    = totalItem.toFixed(2);
    const nomeCortado = nomeLimpo.slice(0, lNomeMax - 1);

    const linha = `${pad}${qtdStr.padEnd(lQtd)}${nomeCortado.padEnd(lNomeMax)}${precoStr.padStart(lPreco)}\n`;
    p.text(linha);
  }

  p.text(`${pad}${'-'.repeat(util)}\n`);

  const descontos = pedido.descontos ?? [];
  if (descontos.length > 0) {
    const txtSub = `SUBTOT: R$ ${totalGeral.toFixed(2)}`;
    p.text(`${pad}${txtSub.padStart(util)}\n`);

    for (let idx = 0; idx < descontos.length; idx++) {
      const desc  = descontos[idx];
      const nome  = removerAcentos(desc.nome || `Desc ${idx + 1}`);
      const tipo  = desc.tipo;
      const valor = Number(desc.valor);

      let abatido: number;
      let strDesc: string;

      if (tipo === 'valor') {
        abatido = valor;
        strDesc = `- R$ ${valor.toFixed(2)}`;
      } else {
        abatido = (totalGeral * valor) / 100;
        strDesc = `-${valor}% (${abatido.toFixed(2)})`;
      }

      totalGeral -= abatido;
      if (totalGeral < 0) totalGeral = 0;

      const resto  = util - strDesc.length;
      const nomeC  = nome.slice(0, resto - 1);
      p.text(`${pad}${nomeC.padEnd(resto)}${strDesc}\n`);
    }

    p.text(`${pad}${'-'.repeat(util)}\n`);
  }

  const textoFinal =
    descontos.length > 0
      ? `TOTAL A PAGAR: R$ ${totalGeral.toFixed(2)}`
      : `TOTAL: R$ ${totalGeral.toFixed(2)}`;
  p.text(`${pad}${textoFinal.padStart(util)}\n`);

  p.set('center');
  if (loja.mensagem_rodape?.trim()) {
    p.text(`\n${loja.mensagem_rodape}\n\n`);
  } else {
    p.text('\n');
  }

  const chavePix   = loja.chave_pix;
  const cidadeLoja = loja.cidade ?? '';

  if (chavePix && totalGeral > 0) {
    const pixStr = gerarPixCopiaECola(chavePix, totalGeral, nomeLoja, cidadeLoja);
    if (pixStr) {
      p.text('Pague via PIX:\n\n');
      p.qr(pixStr, 6);
    }
  }

  p.cut();
}

// ── Public helpers ────────────────────────────────────────────────────────────

/** Returns a live-preview text string without printing. */
export function gerarPreview(pedido: Pedido, loja: Loja, isPremium = false): string {
  const mock = new MockPrinter(loja.largura_colunas);
  
  // Create a temporary loja object with the processed logo for rendering
  const lojaParaRender = { ...loja };
  
  // SÓ PROCESSA A LOGO PARA O PREVIEW SE FOR PREMIUM
  if (loja.logo_raw && isPremium) {
    lojaParaRender.logo = processLogo(loja.logo_raw, loja.logo_metodo || 'dither');
  } else {
    delete lojaParaRender.logo;
  }

  renderizarCupom(mock, pedido, lojaParaRender);
  return mock.getText();
}
