import { PDFDocument, rgb, LineCapStyle, degrees, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import { site } from '@/lib/site';
import { LOGO_PNG, LOGO_ASPECT } from '@/lib/certLogo';
import { FONT_REG, FONT_BOLD, FONT_ITAL, FONT_BI } from '@/lib/certFonts';

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

const PAPER = '#FFFEFA';
const BLUE = '#2F4F9E';

const hex = (h: string) => {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const TITLE_RU: Record<string, string> = { Rector: 'Ректор', Registrar: 'Регистратор' };
const CITY_RU: Record<string, string> = { Moscow: 'Москва' };

type Font = Awaited<ReturnType<PDFDocument['embedFont']>>;

function wrap(text: string, font: Font, size: number, maxW: number) {
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
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

// The institute emblem (hexagon with an E), drawn in PDF coordinates. k = scale (hexagon is 26 x 30 units).
function emblem(page: PDFPage, cx: number, cy: number, k: number, o: { fill?: string; fillOp?: number; stroke: string; strokeOp?: number; w?: number; eColor?: string; eOp?: number }) {
  const P = (px: number, py: number) => (cx + (px - 17) * k).toFixed(2) + ',' + (-(cy - (py - 17) * k)).toFixed(2);
  const hexPath = 'M' + P(17, 2) + ' L' + P(30, 9.5) + ' L' + P(30, 24.5) + ' L' + P(17, 32) + ' L' + P(4, 24.5) + ' L' + P(4, 9.5) + ' Z';
  page.drawSvgPath(hexPath, {
    x: 0,
    y: 0,
    ...(o.fill ? { color: hex(o.fill), opacity: o.fillOp ?? 1 } : {}),
    borderColor: hex(o.stroke),
    borderWidth: o.w ?? 1.2 * k,
    borderOpacity: o.strokeOp ?? 1,
  });
  const e = 'M' + P(12.5, 11) + ' L' + P(21.5, 11) + ' M' + P(12.5, 17) + ' L' + P(19.5, 17) + ' M' + P(12.5, 23) + ' L' + P(21.5, 23) + ' M' + P(12.5, 11) + ' L' + P(12.5, 23);
  page.drawSvgPath(e, { x: 0, y: 0, borderColor: hex(o.eColor ?? o.stroke), borderWidth: 2.3 * k, borderOpacity: o.eOp ?? o.strokeOp ?? 1, borderLineCap: LineCapStyle.Round });
}

// Wavy guilloche line along one side of the border frame.
function wave(page: PDFPage, x0: number, y0: number, x1: number, y1: number, amp: number, period: number, phase: number, color: string, width: number, opacity: number) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const nx = -uy;
  const ny = ux;
  let d = '';
  for (let t = 0; t <= len; t += 1.5) {
    const o = amp * Math.sin((2 * Math.PI * t) / period + phase);
    const x = x0 + ux * t + nx * o;
    const y = y0 + uy * t + ny * o;
    d += (t === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + (-y).toFixed(2) + ' ';
  }
  page.drawSvgPath(d, { x: 0, y: 0, borderColor: hex(color), borderWidth: width, borderOpacity: opacity });
}

export async function buildCertificate(c: CertificateData, brand: Brand = siteBrand, opts: { sample?: boolean } = {}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const page = pdf.addPage([841.89, 595.28]);
  const { width: W, height: H } = page.getSize();
  const b64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
  const reg = await pdf.embedFont(b64(FONT_REG), { subset: true });
  const bold = await pdf.embedFont(b64(FONT_BOLD), { subset: true });
  const ital = await pdf.embedFont(b64(FONT_ITAL), { subset: true });
  const boldItal = await pdf.embedFont(b64(FONT_BI), { subset: true });
  const logo = await pdf.embedPng(Uint8Array.from(Buffer.from(LOGO_PNG, 'base64')));
  const putLogo = (x: number, y: number, h: number, opacity = 1) => page.drawImage(logo, { x: x - (h * LOGO_ASPECT) / 2, y: y - h / 2, width: h * LOGO_ASPECT, height: h, opacity });
  const ink = brand.ink;
  const gold = brand.accent;
  const cx = W / 2;

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(PAPER) });

  // ---- Watermark: large emblem with fine rings ----
  const wy = H / 2 - 6;
  page.drawCircle({ x: cx, y: wy, size: 215, borderColor: hex(BLUE), borderWidth: 0.6, borderOpacity: 0.07 });
  page.drawCircle({ x: cx, y: wy, size: 205, borderColor: hex(BLUE), borderWidth: 2.4, borderOpacity: 0.05 });
  page.drawCircle({ x: cx, y: wy, size: 160, borderColor: hex(BLUE), borderWidth: 0.5, borderOpacity: 0.06 });
  putLogo(cx, wy, 360, 0.06);

  // ---- Ornamental border ----
  const mid = 27;
  const A = 5.5;
  const sides: [number, number, number, number][] = [
    [18, H - mid, W - 18, H - mid],
    [18, mid, W - 18, mid],
    [mid, 18, mid, H - 18],
    [W - mid, 18, W - mid, H - 18],
  ];
  for (const [x0, y0, x1, y1] of sides) {
    wave(page, x0, y0, x1, y1, A, 38, 0, BLUE, 0.7, 0.85);
    wave(page, x0, y0, x1, y1, A, 38, Math.PI, ink, 0.7, 0.85);
    wave(page, x0, y0, x1, y1, A * 0.55, 19, 0, gold, 0.5, 0.9);
    wave(page, x0, y0, x1, y1, A * 0.55, 19, Math.PI / 2, BLUE, 0.4, 0.55);
  }
  page.drawRectangle({ x: 14, y: 14, width: W - 28, height: H - 28, borderColor: hex(ink), borderWidth: 1.6 });
  page.drawRectangle({ x: 17, y: 17, width: W - 34, height: H - 34, borderColor: hex(gold), borderWidth: 0.6 });
  page.drawRectangle({ x: 37, y: 37, width: W - 74, height: H - 74, borderColor: hex(gold), borderWidth: 0.6 });
  page.drawRectangle({ x: 39.5, y: 39.5, width: W - 79, height: H - 79, borderColor: hex(ink), borderWidth: 1.3 });
  // corner plates
  for (const [px, py] of [[14, 14], [W - 56, 14], [14, H - 56], [W - 56, H - 56]]) {
    page.drawRectangle({ x: px, y: py, width: 42, height: 42, color: hex(PAPER), borderColor: hex(ink), borderWidth: 1.6 });
    page.drawRectangle({ x: px + 3, y: py + 3, width: 36, height: 36, borderColor: hex(gold), borderWidth: 0.6 });
    putLogo(px + 21, py + 21, 32);
  }

  // ---- Text helpers ----
  const center = (text: string, y: number, size: number, font: Font, color = ink, x = cx) => {
    page.drawText(text, { x: x - font.widthOfTextAtSize(text, size) / 2, y, size, font, color: hex(color) });
  };
  const spaced = (text: string, y: number, size: number, font: Font, sp: number, color = ink) => {
    const w = [...text].reduce((a, ch) => a + font.widthOfTextAtSize(ch, size) + sp, -sp);
    let x = cx - w / 2;
    for (const ch of text) {
      page.drawText(ch, { x, y, size, font, color: hex(color) });
      x += font.widthOfTextAtSize(ch, size) + sp;
    }
  };
  const block = (text: string, y: number, size: number, font: Font, lineH: number, maxW: number, color = ink) => {
    for (const l of wrap(text, font, size, maxW)) {
      center(l, y, size, font, color);
      y -= lineH;
    }
    return y;
  };

  // ---- Header ----
  putLogo(cx, H - 73, 58);
  spaced(brand.name.toUpperCase(), H - 116, 15, bold, 2.2);
  center('Онлайн-институт  ·  Online institute', H - 130, 9.5, ital, brand.muted);

  // ---- Title ----
  spaced('СЕРТИФИКАТ', H - 172, 36, bold, 7, ink);
  spaced('CERTIFICATE', H - 192, 14, reg, 6, BLUE);
  center('№ ' + c.serial, H - 212, 11, bold, ink);

  // ---- Body (bilingual) ----
  center('Настоящий сертификат подтверждает, что', H - 238, 12, reg);
  center('This is to certify that', H - 252, 10.5, ital, brand.muted);

  let nameSize = 28;
  while (boldItal.widthOfTextAtSize(c.name, nameSize) > 600 && nameSize > 16) nameSize -= 1;
  center(c.name, H - 284, nameSize, boldItal);
  page.drawLine({ start: { x: cx - 280, y: H - 292 }, end: { x: cx + 280, y: H - 292 }, thickness: 0.6, color: hex(gold) });

  center('успешно прошёл(-а) курс обучения и сдал(-а) экзамен по программе', H - 312, 11.5, reg);
  center('has successfully completed the course of study and passed the examination in', H - 325, 10, ital, brand.muted);

  let y = block(c.exam, H - 344, 20, bold, 23, 640);

  const d = c.issued;
  const cityEn = brand.city.split(',')[0].trim();
  const cityRu = CITY_RU[cityEn] ?? cityEn;
  center(cityRu + ', ' + d.getUTCDate() + ' ' + MONTHS_RU[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' г.', 198, 12, boldItal);
  center(cityEn + ', ' + d.getUTCDate() + ' ' + MONTHS_EN[d.getUTCMonth()] + ' ' + d.getUTCFullYear(), 185, 10, ital, brand.muted);

  // ---- Seal (centre bottom) ----
  const sx = cx;
  const sy = 122;
  poly(page, sx, sy, 40, 54, 50, gold);
  page.drawCircle({ x: sx, y: sy, size: 46, color: hex(ink) });
  page.drawCircle({ x: sx, y: sy, size: 43, borderColor: hex(gold), borderWidth: 0.7 });
  page.drawCircle({ x: sx, y: sy, size: 28, borderColor: hex(gold), borderWidth: 0.7 });
  const arc = (text: string, r: number, top: boolean) => {
    const size = 6.2;
    const ws = [...text].map((ch) => bold.widthOfTextAtSize(ch, size));
    const total = ws.reduce((a, b) => a + b, 0) / r;
    let th = top ? Math.PI / 2 + total / 2 : (3 * Math.PI) / 2 - total / 2;
    [...text].forEach((ch, i) => {
      const half = ws[i] / r / 2;
      th += top ? -half : half;
      const px = sx + r * Math.cos(th);
      const py = sy + r * Math.sin(th);
      const rot = top ? th - Math.PI / 2 : th + Math.PI / 2;
      const dx = Math.cos(rot) * (ws[i] / 2);
      const dy = Math.sin(rot) * (ws[i] / 2);
      page.drawText(ch, { x: px - dx, y: py - dy, size, font: bold, color: hex(gold), rotate: degrees((rot * 180) / Math.PI) });
      th += top ? -half : half;
    });
  };
  arc(brand.name.toUpperCase(), 31, true);
  arc(cityRu.toUpperCase() + ' · ' + d.getUTCFullYear(), 37.5, false);
  putLogo(sx, sy, 38);

  // ---- Signatures ----
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
  const sig = (name: string, title: string, cxs: number, yy: number, style: number) => {
    const sw = 190;
    if (name) page.drawSvgPath(scribble(name, style), { x: cxs - sw / 2 + (style === 0 ? 20 : 40), y: yy + (style === 0 ? 22 : 12), borderColor: hex(ink), borderWidth: style === 0 ? 1.5 : 1.1, borderOpacity: 0.92 });
    page.drawLine({ start: { x: cxs - sw / 2, y: yy }, end: { x: cxs + sw / 2, y: yy }, thickness: 0.8, color: hex(ink) });
    if (name) center(name, yy - 13, 11, bold, ink, cxs);
    center((TITLE_RU[title] ?? title) + '  /  ' + title, yy - (name ? 26 : 13), 9.5, ital, brand.muted, cxs);
  };
  sig(brand.signatory.name, brand.signatory.title, 215, 112, 0);
  sig(brand.registrar.name, brand.registrar.title, W - 215, 112, 1);

  // ---- Verification ----
  const qrPng = await QRCode.toBuffer(c.verifyUrl, { margin: 1, width: 240 });
  const qr = await pdf.embedPng(qrPng);
  page.drawImage(qr, { x: 62, y: 50, width: 40, height: 40 });
  page.drawText('Проверка подлинности / Verify', { x: 108, y: 72, size: 7.5, font: bold, color: hex(brand.muted) });
  page.drawText('№ ' + c.serial, { x: 108, y: 60, size: 7, font: reg, color: hex(brand.muted) });
  if (brand.disclaimer) center(brand.disclaimer, 46, 6.5, reg, brand.muted);

  if (opts.sample) {
    page.drawText('SAMPLE', {
      x: W / 2 - 230,
      y: H / 2 - 150,
      size: 150,
      font: bold,
      color: hex(gold),
      opacity: 0.1,
      rotate: degrees(30),
    });
  }
  return pdf.save();
}
