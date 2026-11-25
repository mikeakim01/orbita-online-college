import { PDFDocument, StandardFonts, rgb, type PDFPage } from 'pdf-lib';
import QRCode from 'qrcode';
import { site } from '@/lib/site';

export type CertificateData = {
  serial: string;
  name: string;
  exam: string;
  score: number;
  issued: Date;
  verifyUrl: string;
};

export type Brand = {
  name: string;
  short: string;
  city: string;
  disclaimer: string;
  accent: string;
  ink: string;
  muted: string;
  signatory: { name: string; title: string };
  registrar: { name: string; title: string };
};

export const siteBrand: Brand = {
  name: site.name,
  short: site.short,
  city: site.city,
  disclaimer: site.disclaimer,
  accent: site.cert.accent,
  ink: site.cert.ink,
  muted: site.cert.muted,
  signatory: site.signatory,
  registrar: site.registrar,
};

const PAPER = '#FBF8F1';

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

// The standard PDF fonts only cover Latin-1. Replace anything else.
const safe = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORD = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];
const NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function dayWord(d: number) {
  if (d < 20) return ORD[d];
  if (d === 20) return 'Twentieth';
  if (d === 30) return 'Thirtieth';
  return (d < 30 ? 'Twenty' : 'Thirty') + '-' + ORD[d % 10];
}
function yearWord(y: number) {
  const r = y - 2000;
  if (r <= 0) return 'Two Thousand';
  return 'Two Thousand and ' + (r < 20 ? NUM[r] : TENS[Math.floor(r / 10)] + (r % 10 ? ' ' + NUM[r % 10] : ''));
}
const ordinalNum = (d: number) => d + (d % 100 >= 11 && d % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]);

type Font = Awaited<ReturnType<PDFDocument['embedFont']>>;

function wrap(text: string, font: Font, size: number, maxW: number) {
  const lines: string[] = [];
  let cur = '';
  for (const w of safe(text).split(' ')) {
    const t = cur ? cur + ' ' + w : w;
    if (font.widthOfTextAtSize(t, size) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Polygon in PDF coordinates. drawSvgPath flips Y, so negate it.
function poly(page: PDFPage, cx: number, cy: number, points: number, r1: number, r2: number, color: string) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (i * Math.PI) / points;
    d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(a)).toFixed(2) + ',' + (-(cy + r * Math.sin(a))).toFixed(2) + ' ';
  }
  page.drawSvgPath(d + 'Z', { x: 0, y: 0, color: hex(color) });
}

export async function buildCertificate(c: CertificateData, brand: Brand = siteBrand, opts: { sample?: boolean } = {}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width: W, height: H } = page.getSize();
  const reg = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const ital = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const boldItal = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const ink = brand.ink;

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(PAPER) });
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: hex(brand.accent), borderWidth: 0.8 });

  const center = (text: string, y: number, size: number, font: Font, color = ink) => {
    const t = safe(text);
    page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color: hex(color) });
  };
  // Draws wrapped, centred lines from y downwards and returns the y of the next free line.
  const block = (text: string, y: number, size: number, font: Font, lineH: number, maxW = 400, color = ink) => {
    for (const l of wrap(text, font, size, maxW)) {
      center(l, y, size, font, color);
      y -= lineH;
    }
    return y;
  };

  // Crest: a shield with the college initial.
  const cx = W / 2;
  const top = H - 62;
  const sw = 64;
  const sh = 78;
  page.drawSvgPath('M0,0 L' + sw + ',0 L' + sw + ',' + sh * 0.55 + ' C' + sw + ',' + sh * 0.86 + ' ' + sw * 0.66 + ',' + sh * 0.97 + ' ' + sw / 2 + ',' + sh + ' C' + sw * 0.34 + ',' + sh * 0.97 + ' 0,' + sh * 0.86 + ' 0,' + sh * 0.55 + ' Z', {
    x: cx - sw / 2,
    y: top,
    color: hex(brand.accent),
  });
  page.drawSvgPath('M0,0 L' + (sw - 10) + ',0 L' + (sw - 10) + ',' + (sh * 0.52) + ' C' + (sw - 10) + ',' + sh * 0.78 + ' ' + (sw - 10) * 0.66 + ',' + sh * 0.88 + ' ' + (sw - 10) / 2 + ',' + (sh - 10) + ' C' + (sw - 10) * 0.34 + ',' + sh * 0.88 + ' 0,' + sh * 0.78 + ' 0,' + sh * 0.52 + ' Z', {
    x: cx - (sw - 10) / 2,
    y: top - 5,
    color: hex(PAPER),
    opacity: 0.18,
  });
  const initial = safe(brand.short.charAt(0).toUpperCase());
  page.drawText(initial, { x: cx - bold.widthOfTextAtSize(initial, 40) / 2, y: top - 52, size: 40, font: bold, color: hex(PAPER) });

  // Title block
  center(brand.name.toUpperCase(), H - 190, 20, bold);
  center('This is to certify that', H - 228, 13, ital);
  let y = block(c.name, H - 268, 28, boldItal, 34, 440);
  y -= 6;
  y = block('having successfully completed the prescribed course of study and passed the proctored examination of the ' + brand.name + ' and was awarded the Certificate of Competence in', y, 13, ital, 22, 410);
  y -= 8;
  y = block(c.exam, y, 26, boldItal, 32, 440);
  y -= 4;
  center('with a score of ' + c.score + ' per cent', y, 13, ital);
  y -= 34;
  center('on', y, 12, ital);
  y -= 24;
  const d = c.issued;
  center(ordinalNum(d.getUTCDate()) + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(), y, 15, boldItal);
  y -= 38;
  center('Witness our hands at the online convocation held in ' + brand.city.split(',')[0], y, 12, ital);
  y -= 20;
  center('on the ' + dayWord(d.getUTCDate()) + ' day of ' + MONTHS[d.getUTCMonth()] + ' ' + yearWord(d.getUTCFullYear()), y, 12, ital);

  // Wax seal, bottom left
  const sx = 130;
  const sy = 178;
  poly(page, sx, sy, 36, 62, 56, brand.accent);
  page.drawCircle({ x: sx, y: sy, size: 46, borderColor: hex(PAPER), borderWidth: 0.8, opacity: 0, borderOpacity: 0.55 });
  page.drawCircle({ x: sx, y: sy, size: 40, borderColor: hex(PAPER), borderWidth: 0.5, opacity: 0, borderOpacity: 0.45 });
  const label = safe(brand.short.toUpperCase());
  page.drawText(label, { x: sx - bold.widthOfTextAtSize(label, 11) / 2, y: sy + 2, size: 11, font: bold, color: hex(PAPER) });
  const yr = String(d.getUTCFullYear());
  page.drawText(yr, { x: sx - reg.widthOfTextAtSize(yr, 8) / 2, y: sy - 11, size: 8, font: reg, color: hex(PAPER) });

  // Signatures, bottom right
  // Handwritten-style signatures: two deliberately different pen styles
  const scribble = (name: string, style: number) => {
    const s = name.replace(/[^A-Za-z]/g, '');
    let seed = 2166136261;
    for (const ch of name) seed = Math.imul(seed ^ ch.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => { seed = (seed + 0x6d2b79f5) >>> 0; let z = Math.imul(seed ^ (seed >>> 15), 1 | seed); z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z; return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };
    const n = s.length;
    if (style === 0) {
      // Rector: large looping initial, tall upright strokes, long swooping underline
      const step = 118 / Math.max(n, 1);
      let d = 'M4,4 C-18,-6 -6,-44 14,-40 C34,-36 20,-2 6,6 C26,-10 44,-30 46,-8';
      let x = 46;
      for (let i = 1; i < n; i++) {
        const h = 14 + rnd() * 26;
        d += ' C' + (x + step * 0.2) + ',' + (-h) + ' ' + (x + step * 0.45) + ',' + (-h * 0.3) + ' ' + (x + step * 0.5) + ',-4 C' + (x + step * 0.7) + ',6 ' + (x + step * 0.9) + ',-2 ' + (x + step) + ',-6';
        x += step;
      }
      d += ' C' + (x + 20) + ',-12 ' + (x + 34) + ',-4 ' + (x + 30) + ',4';
      d += ' M' + (x + 30) + ',4 C' + (x * 0.7) + ',16 ' + (x * 0.3) + ',12 -4,14';
      return d;
    }
    // Registrar: compact, slanted, rounded cursive with a looped tail and a dot
    const step = 92 / Math.max(n, 1);
    let d = 'M0,2 C6,-24 22,-30 26,-14 C30,2 14,4 18,-10';
    let x = 26;
    for (let i = 1; i < n; i++) {
      const h = 6 + rnd() * 12;
      const sl = 8;
      d += ' C' + (x + sl) + ',' + (-h - 6) + ' ' + (x + sl + 6) + ',' + (-h) + ' ' + (x + step * 0.5) + ',' + (-h * 0.4) + ' S' + (x + step * 0.9) + ',2 ' + (x + step) + ',-3';
      x += step;
    }
    d += ' C' + (x + 18) + ',-14 ' + (x + 30) + ',10 ' + (x + 10) + ',8 C' + (x - 4) + ',6 ' + (x + 8) + ',-6 ' + (x + 24) + ',-2';
    d += ' M' + (x + 34) + ',-18 L' + (x + 36) + ',-17';
    return d;
  };
  const sig = (name: string, title: string, yy: number, style: number) => {
    page.drawSvgPath(scribble(name, style), { x: style === 0 ? 335 : 350, y: yy + (style === 0 ? 22 : 12), borderColor: hex(ink), borderWidth: style === 0 ? 1.5 : 1.1, borderOpacity: 0.92 });
    page.drawLine({ start: { x: 320, y: yy }, end: { x: 520, y: yy }, thickness: 0.8, color: hex(ink) });
    const pn = safe(name + ', ' + title);
    page.drawText(pn, { x: 420 - ital.widthOfTextAtSize(pn, 11) / 2, y: yy - 14, size: 11, font: ital, color: hex(brand.muted) });
  };
  sig(brand.signatory.name, brand.signatory.title, 214, 0);
  sig(brand.registrar.name, brand.registrar.title, 150, 1);

  // Verification
  const qrPng = await QRCode.toBuffer(c.verifyUrl, { margin: 1, width: 240 });
  const qr = await pdf.embedPng(qrPng);
  page.drawImage(qr, { x: cx - 26, y: 66, width: 52, height: 52 });
  center('Certificate ID ' + c.serial, 54, 8.5, reg, brand.muted);
  const vu = safe(c.verifyUrl.replace(/^https?:\/\//, ''));
  center('Verify at ' + (vu.length > 70 ? vu.slice(0, 70) + '...' : vu), 43, 8, reg, brand.muted);
  center(brand.disclaimer, 30, 7, reg, brand.muted);

  if (opts.sample) {
    const t = 'SAMPLE';
    page.drawText(t, {
      x: W / 2 - 150,
      y: H / 2 - 130,
      size: 130,
      font: bold,
      color: hex(brand.accent),
      opacity: 0.09,
      rotate: { type: 'degrees' as const, angle: 40 } as never,
    });
  }
  return pdf.save();
}
