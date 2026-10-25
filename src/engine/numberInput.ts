/**
 * ============================================================================
 * Modul       : numberInput
 * Lapisan     : Mesin (Parser Nilai Variabel)
 *
 * Deskripsi:
 * Mengubah teks yang diketik pengguna pada tabel variabel menjadi nilai riil.
 * Mendukung bilangan bulat, desimal gaya Indonesia (0,5) maupun internasional
 * (0.5), pemisah ribuan (1.234,56), pecahan (1/2), dan ekspresi matematika
 * sederhana yang aman seperti 2^3 atau sqrt(2).
 * ============================================================================
 */

import { evaluate, parse } from 'mathjs';
import { KNOWN_CONSTANTS, KNOWN_FUNCTIONS } from './mathConstants';

/** Angka biasa: 12, -3.5, .25, 1e-3 */
const PLAIN_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

/** Teks yang hanya berisi digit dan pemisah: 1.234,56 / 0,5 / 2.000.000 */
const LOCALIZED_NUMBER = /^[+-]?[\d.,]+(?:[eE][+-]?\d+)?$/;

/**
 * Menguraikan angka dengan pemisah desimal/ribuan lokal.
 *
 * Aturan:
 * - Jika hanya ada koma, koma dianggap desimal (0,5 -> 0.5).
 * - Jika ada titik dan koma, pemisah terakhir dianggap desimal
 *   (1.234,56 -> 1234.56 dan 1,234.56 -> 1234.56).
 * - Jika hanya ada beberapa titik tanpa koma, titik dianggap pemisah ribuan
 *   (1.234.567 -> 1234567).
 * - Satu titik tanpa koma tetap dianggap desimal (1.234 -> 1.234).
 */
function parseLocalizedNumber(text: string): number | null {
  if (PLAIN_NUMBER.test(text)) {
    const plain = Number(text);
    return Number.isFinite(plain) ? plain : null;
  }

  if (!LOCALIZED_NUMBER.test(text)) return null;

  const hasComma = text.includes(',');
  const hasDot = text.includes('.');
  let normalized = text;

  if (hasComma && hasDot) {
    const lastComma = text.lastIndexOf(',');
    const lastDot = text.lastIndexOf('.');

    normalized =
      lastComma > lastDot
        ? text.replace(/\./g, '').replace(/,/g, '.')
        : text.replace(/,/g, '');
  } else if (hasComma) {
    normalized = text.replace(/,/g, '.');
  } else if (hasDot) {
    const dotCount = (text.match(/\./g) ?? []).length;
    if (dotCount < 2) return null;
    normalized = text.replace(/\./g, '');
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Mengevaluasi ekspresi matematika sederhana dengan daftar simbol terbatas.
 * Variabel bebas dan penugasan ditolak agar input tetap deterministik dan aman.
 */
function evaluateExpression(text: string): number | null {
  try {
    const node = parse(text);
    let isAllowed = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.traverse((child: any) => {
      if (!isAllowed) return;

      if (child.isAssignmentNode || child.isFunctionAssignmentNode || child.isBlockNode) {
        isAllowed = false;
        return;
      }

      if (child.isSymbolNode) {
        const name = String(child.name);
        if (!KNOWN_CONSTANTS.has(name) && !KNOWN_FUNCTIONS.has(name.toLowerCase())) {
          isAllowed = false;
        }
      }
    });

    if (!isAllowed) return null;

    // mathjs 15 tidak lagi menerima AST langsung pada evaluate(), jadi teks
    // dievaluasi ulang setelah AST dipastikan hanya memakai simbol yang aman.
    const result = evaluate(text);
    return typeof result === 'number' && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * Mengubah input pengguna menjadi nilai riil (real number).
 *
 * @param raw Teks mentah dari sel tabel variabel.
 * @returns Nilai riil, atau `null` jika input kosong/tidak dapat diurai.
 */
export function parseNumericInput(raw?: string | null): number | null {
  if (raw === null || raw === undefined) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Normalisasi simbol yang sering diketik pengguna.
  const normalized = trimmed
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'pi');

  return parseLocalizedNumber(normalized) ?? evaluateExpression(normalized);
}

/**
 * Memeriksa apakah teks dapat dibaca sebagai satu nilai riil.
 */
export function isValidNumericInput(raw?: string | null): boolean {
  return parseNumericInput(raw) !== null;
}
