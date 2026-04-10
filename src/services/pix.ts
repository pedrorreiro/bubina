/**
 * PIX Copia e Cola generator — TypeScript port of utils.py gerar_pix_copia_cola().
 * Implements the EMVCo Merchant QR Code standard with CRC-16/CCITT-FALSE.
 */

// ── CRC-16 CCITT-FALSE ────────────────────────────────────────────────────────

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

// ── EMVCo TLV helpers ─────────────────────────────────────────────────────────

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, '0')}${value}`;
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ── Main generator ────────────────────────────────────────────────────────────

/**
 * Generates a PIX Copia e Cola string (EMVCo QRCPS-MPM format).
 * Returns null if chave_pix is empty.
 */
export function gerarPixCopiaECola(
  chavePix: string,
  valor: number,
  nomeLoja: string,
  cidadeLoja: string,
): string | null {
  if (!chavePix) return null;

  const nomeClean   = removeAccents(nomeLoja.replace(/[^a-zA-Z0-9 ]/g, '').trim()).slice(0, 25);
  const cidadeClean = removeAccents(cidadeLoja.replace(/[^a-zA-Z0-9 ]/g, '').trim()).slice(0, 15);
  const valorStr    = valor.toFixed(2);

  // Merchant Account Information (ID 26)
  const gui         = tlv('00', 'BR.GOV.BCB.PIX');
  const chave       = tlv('01', chavePix);
  const merchantAcc = tlv('26', gui + chave);

  // Build body (without CRC)
  let body = '';
  body += tlv('00', '01');                 // Payload format indicator
  body += tlv('01', '12');                 // Point of initiation (static)
  body += merchantAcc;
  body += tlv('52', '0000');              // MCC — generic
  body += tlv('53', '986');               // Currency BRL
  body += tlv('54', valorStr);            // Amount
  body += tlv('58', 'BR');               // Country
  body += tlv('59', nomeClean || 'LOJA'); // Merchant name
  body += tlv('60', cidadeClean || 'BR'); // City
  body += tlv('62', tlv('05', '***'));    // Additional data — txid wildcard
  body += '6304';                          // CRC field prefix (no value yet)

  const crc = crc16(body);
  return body + crc;
}
