import { PDFDocument, rgb, LineCapStyle, degrees, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import { site } from '@/lib/site';
import { LOGO_PNG, LOGO_ASPECT } from '@/lib/certLogo';
import { DEFAULT_DESIGN } from '@/lib/certStyles';
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


// Hypotrochoid rosette (guilloche), centred at cx,cy, outer radius ~ rad.
function rosette(page: PDFPage, cx: number, cy: number, R: number, r: number, dd: number, rad: number, color: string, width: number, opacity: number) {
  const k = (R - r) / r;
  const sc = rad / (R - r + dd);
  const turns = r / gcd(R, r);
  let d = '';
  const N = 1800 * turns;
  for (let i = 0; i <= N; i++) {
    const t = (2 * Math.PI * turns * i) / N;
    const x = cx + sc * ((R - r) * Math.cos(t) + dd * Math.cos(k * t));
    const y = cy + sc * ((R - r) * Math.sin(t) - dd * Math.sin(k * t));
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + (-y).toFixed(2) + ' ';
  }
  page.drawSvgPath(d + 'Z', { x: 0, y: 0, borderColor: hex(color), borderWidth: width, borderOpacity: opacity });
}
function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

function scribble(name: string, style: number) {
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
  }


// ======================================================================
// Shared kit and the four additional designs
// ======================================================================
type Kit = {
  pdf: PDFDocument;
  page: PDFPage;
  W: number;
  H: number;
  reg: Font;
  bold: Font;
  ital: Font;
  boldItal: Font;
  putLogo: (x: number, y: number, h: number, opacity?: number) => void;
  ink: string;
  gold: string;
  muted: string;
};

async function makeKit(pdf: PDFDocument, size: [number, number], brand: Brand): Promise<Kit> {
  const page = pdf.addPage(size);
  const b64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
  const reg = await pdf.embedFont(b64(FONT_REG), { subset: true });
  const bold = await pdf.embedFont(b64(FONT_BOLD), { subset: true });
  const ital = await pdf.embedFont(b64(FONT_ITAL), { subset: true });
  const boldItal = await pdf.embedFont(b64(FONT_BI), { subset: true });
  const logo = await pdf.embedPng(b64(LOGO_PNG));
  const putLogo = (x: number, y: number, h: number, opacity = 1) => page.drawImage(logo, { x: x - (h * LOGO_ASPECT) / 2, y: y - h / 2, width: h * LOGO_ASPECT, height: h, opacity });
  return { pdf, page, W: size[0], H: size[1], reg, bold, ital, boldItal, putLogo, ink: brand.ink, gold: brand.accent, muted: brand.muted };
}

type Align = 'c' | 'l';
function tx(k: Kit) {
  const put = (text: string, y: number, size: number, font: Font, color: string, x: number, align: Align = 'c') => {
    const w = font.widthOfTextAtSize(text, size);
    k.page.drawText(text, { x: align === 'c' ? x - w / 2 : x, y, size, font, color: hex(color) });
  };
  const spaced = (text: string, y: number, size: number, font: Font, sp: number, color: string, x: number, align: Align = 'c') => {
    const w = [...text].reduce((a, ch) => a + font.widthOfTextAtSize(ch, size) + sp, -sp);
    let px = align === 'c' ? x - w / 2 : x;
    for (const ch of text) {
      k.page.drawText(ch, { x: px, y, size, font, color: hex(color) });
      px += font.widthOfTextAtSize(ch, size) + sp;
    }
  };
  return { put, spaced };
}

const dash = (page: PDFPage, x0: number, y0: number, x1: number, y1: number, color: string, th: number, op = 1) => page.drawLine({ start: { x: x0, y: y0 }, end: { x: x1, y: y1 }, thickness: th, color: hex(color), opacity: op });
const diamond = (page: PDFPage, x: number, y: number, r: number, color: string) =>
  page.drawSvgPath('M' + (x - r) + ',' + -y + ' L' + x + ',' + -(y + r) + ' L' + (x + r) + ',' + -y + ' L' + x + ',' + -(y - r) + ' Z', { x: 0, y: 0, color: hex(color) });

/** The bilingual body text. Returns the next free y. */
function body(k: Kit, c: CertificateData, o: { x: number; y: number; w: number; align: Align; nameSize?: number; examSize?: number }) {
  const { put } = tx(k);
  const { x, w, align } = o;
  let y = o.y;
  put('Настоящий сертификат подтверждает, что', y, 12, k.reg, k.ink, x, align);
  y -= 14;
  put('This is to certify that', y, 10.5, k.ital, k.muted, x, align);
  y -= 34;
  let ns = o.nameSize ?? 28;
  while (k.boldItal.widthOfTextAtSize(c.name, ns) > w && ns > 14) ns -= 1;
  put(c.name, y, ns, k.boldItal, k.ink, x, align);
  y -= 9;
  const lx0 = align === 'c' ? x - w / 2 : x;
  dash(k.page, lx0, y, lx0 + w, y, k.gold, 0.7);
  y -= 22;
  put('успешно прошёл(-а) курс обучения и сдал(-а) экзамен по программе', y, 11.5, k.reg, k.ink, x, align);
  y -= 13;
  put('has successfully completed the course of study and passed the examination in', y, 10, k.ital, k.muted, x, align);
  y -= 28;
  const es = o.examSize ?? 20;
  for (const l of wrap(c.exam, k.bold, es, w)) {
    put(l, y, es, k.bold, k.ink, x, align);
    y -= es + 4;
  }
  return y;
}

function dateLines(k: Kit, c: CertificateData, brand: Brand, x: number, y: number, align: Align) {
  const { put } = tx(k);
  const d = c.issued;
  const cityEn = brand.city.split(',')[0].trim();
  const cityRu = CITY_RU[cityEn] ?? cityEn;
  put(cityRu + ', ' + d.getUTCDate() + ' ' + MONTHS_RU[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' г.', y, 12, k.boldItal, k.ink, x, align);
  put(cityEn + ', ' + d.getUTCDate() + ' ' + MONTHS_EN[d.getUTCMonth()] + ' ' + d.getUTCFullYear(), y - 13, 10, k.ital, k.muted, x, align);
}

function signer(k: Kit, name: string, title: string, cx: number, yy: number, style: number, w = 170) {
  const { put } = tx(k);
  if (name) k.page.drawSvgPath(scribble(name, style), { x: cx - w / 2 + (style === 0 ? 14 : 30), y: yy + (style === 0 ? 22 : 12), borderColor: hex(k.ink), borderWidth: style === 0 ? 1.5 : 1.1, borderOpacity: 0.92 });
  dash(k.page, cx - w / 2, yy, cx + w / 2, yy, k.ink, 0.8);
  if (name) put(name, yy - 13, 11, k.bold, k.ink, cx);
  put((TITLE_RU[title] ?? title) + '  /  ' + title, yy - (name ? 26 : 13), 9.5, k.ital, k.muted, cx);
}

function seal(k: Kit, brand: Brand, c: CertificateData, sx: number, sy: number, s = 1, ribbons = false) {
  const { page } = k;
  const cityEn = brand.city.split(',')[0].trim();
  const cityRu = CITY_RU[cityEn] ?? cityEn;
  if (ribbons) {
    for (const dir of [-1, 1]) {
      const bx = sx + dir * 20 * s;
      page.drawSvgPath('M' + (bx - 15 * s) + ',' + -(sy - 30 * s) + ' L' + (bx + 15 * s) + ',' + -(sy - 30 * s) + ' L' + (bx + 15 * s + dir * 14 * s) + ',' + -(sy - 68 * s) + ' L' + (bx + dir * 14 * s) + ',' + -(sy - 60 * s) + ' L' + (bx - 15 * s + dir * 14 * s) + ',' + -(sy - 68 * s) + ' Z', { x: 0, y: 0, color: hex(k.ink), borderColor: hex(k.gold), borderWidth: 0.8 });
    }
  }
  poly(page, sx, sy, 40, 54 * s, 50 * s, k.gold);
  page.drawCircle({ x: sx, y: sy, size: 52 * s, borderColor: hex('#8A6A25'), borderWidth: 0.5 });
  page.drawCircle({ x: sx, y: sy, size: 46 * s, color: hex(k.ink) });
  page.drawCircle({ x: sx, y: sy, size: 43 * s, borderColor: hex(k.gold), borderWidth: 0.7 });
  page.drawCircle({ x: sx, y: sy, size: 28 * s, borderColor: hex(k.gold), borderWidth: 0.7 });
  const arc = (text: string, r: number, top: boolean) => {
    const size = 6.2 * s;
    const ws = [...text].map((ch) => k.bold.widthOfTextAtSize(ch, size));
    const total = ws.reduce((a, b) => a + b, 0) / r;
    let th = top ? Math.PI / 2 + total / 2 : (3 * Math.PI) / 2 - total / 2;
    [...text].forEach((ch, i) => {
      const half = ws[i] / r / 2;
      th += top ? -half : half;
      const rot = top ? th - Math.PI / 2 : th + Math.PI / 2;
      page.drawText(ch, { x: sx + r * Math.cos(th) - Math.cos(rot) * (ws[i] / 2), y: sy + r * Math.sin(th) - Math.sin(rot) * (ws[i] / 2), size, font: k.bold, color: hex(k.gold), rotate: degrees((rot * 180) / Math.PI) });
      th += top ? -half : half;
    });
  };
  arc(brand.name.toUpperCase(), 31 * s, true);
  arc(cityRu.toUpperCase() + ' · ' + c.issued.getUTCFullYear(), 37.5 * s, false);
  k.putLogo(sx, sy, 38 * s);
}

async function qrBlock(k: Kit, c: CertificateData, x: number, y: number, size: number, o: { light?: boolean; label?: boolean } = {}) {
  const png = await QRCode.toBuffer(c.verifyUrl, { margin: 1, width: 240, color: { dark: '#000000', light: o.light ? '#FFFFFF' : '#FFFFFF' } });
  const img = await k.pdf.embedPng(png);
  k.page.drawImage(img, { x, y, width: size, height: size });
  if (o.label !== false) {
    k.page.drawText('Проверка подлинности / Verify', { x: x + size + 6, y: y + size / 2 + 3, size: 7.5, font: k.bold, color: hex(k.muted) });
    k.page.drawText('№ ' + c.serial, { x: x + size + 6, y: y + size / 2 - 8, size: 7, font: k.reg, color: hex(k.muted) });
  }
}

function sampleMark(k: Kit) {
  k.page.drawText('SAMPLE', { x: k.W / 2 - 230, y: k.H / 2 - 150, size: 150, font: k.bold, color: hex(k.gold), opacity: 0.1, rotate: degrees(30) });
}

const GOLD_DK = '#8A6A25';
const GOLD_LT = '#E6CB82';

/** Woven gold band like the ornate edging on formal diplomas. */
function goldBand(k: Kit, x: number, y: number, w: number, h: number) {
  const { page } = k;
  page.drawRectangle({ x, y, width: w, height: h, color: hex(k.gold) });
  page.drawRectangle({ x, y: y + h * 0.62, width: w, height: h * 0.38, color: hex(GOLD_LT), opacity: 0.55 });
  page.drawRectangle({ x, y, width: w, height: h * 0.2, color: hex(GOLD_DK), opacity: 0.55 });
  for (let t = 0; t < w; t += 12) {
    dash(page, x + t, y + h * 0.18, x + t + 12, y + h * 0.82, GOLD_DK, 0.9, 0.7);
    dash(page, x + t + 12, y + h * 0.18, x + t, y + h * 0.82, GOLD_LT, 0.9, 0.8);
  }
  dash(page, x, y + 0.5, x + w, y + 0.5, GOLD_DK, 1);
  dash(page, x, y + h - 0.5, x + w, y + h - 0.5, GOLD_DK, 1);
}

// ---------------------------------------------------------------- Heritage gold (landscape)
async function drawHeritage(k: Kit, c: CertificateData, brand: Brand, opts: { sample?: boolean }) {
  const { page, W, H } = k;
  const cx = W / 2;
  const { put, spaced } = tx(k);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex('#FBF5E4') });
  rosette(page, cx, H / 2 - 4, 17, 5, 4.2, 200, GOLD_DK, 0.35, 0.16);
  rosette(page, cx, H / 2 - 4, 13, 4, 3.4, 150, GOLD_DK, 0.3, 0.14);
  page.drawCircle({ x: cx, y: H / 2 - 4, size: 205, borderColor: hex(k.gold), borderWidth: 1.2, borderOpacity: 0.25 });
  k.putLogo(cx, H / 2 - 4, 340, 0.07);
  goldBand(k, 0, H - 40, W, 26);
  goldBand(k, 0, 14, W, 26);
  page.drawRectangle({ x: 34, y: 52, width: W - 68, height: H - 104, borderColor: hex(k.gold), borderWidth: 1.2 });
  page.drawRectangle({ x: 38, y: 56, width: W - 76, height: H - 112, borderColor: hex(k.ink), borderWidth: 0.5 });
  for (const [px, py] of [[34, 52], [W - 34, 52], [34, H - 52], [W - 34, H - 52]]) {
    page.drawCircle({ x: px, y: py, size: 7, color: hex('#FBF5E4'), borderColor: hex(k.gold), borderWidth: 1.2 });
    diamond(page, px, py, 3.2, GOLD_DK);
  }
  k.putLogo(cx, H - 93, 50);
  spaced(brand.name.toUpperCase(), H - 138, 17, k.bold, 2.4, k.ink, cx);
  put('Онлайн-институт  ·  Online institute', H - 152, 9.5, k.ital, k.muted, cx);
  spaced('СЕРТИФИКАТ', H - 190, 34, k.bold, 7, k.ink, cx);
  spaced('CERTIFICATE', H - 208, 13, k.reg, 6, GOLD_DK, cx);
  put('№ ' + c.serial, H - 226, 11, k.bold, k.ink, cx);
  body(k, c, { x: cx, y: H - 250, w: 560, align: 'c', nameSize: 28, examSize: 19 });
  dateLines(k, c, brand, cx, 188, 'c');
  signer(k, brand.signatory.name, brand.signatory.title, 205, 118, 0);
  signer(k, brand.registrar.name, brand.registrar.title, W - 205, 118, 1);
  seal(k, brand, c, cx, 122, 0.9);
  await qrBlock(k, c, 56, 62, 38);
  if (opts.sample) sampleMark(k);
}

// ---------------------------------------------------------------- Modern blue panel (landscape)
async function drawModern(k: Kit, c: CertificateData, brand: Brand, opts: { sample?: boolean }) {
  const { page, W, H } = k;
  const { put, spaced } = tx(k);
  const PW = 232;
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex('#FFFFFF') });
  page.drawRectangle({ x: PW, y: 0, width: W - PW, height: H, color: hex('#F7F9FE') });
  k.putLogo((PW + W) / 2, H / 2, 400, 0.05);
  page.drawRectangle({ x: 0, y: 0, width: PW, height: H, color: hex(k.ink) });
  for (let t = -H; t < PW + H; t += 14) dash(page, t, 0, t + H, H, k.gold, 0.5, 0.12);
  page.drawRectangle({ x: PW, y: 0, width: 6, height: H, color: hex(k.gold) });
  page.drawRectangle({ x: PW + 6, y: 0, width: 1.5, height: H, color: hex('#FFFFFF'), opacity: 0.5 });
  const px = PW / 2;
  k.putLogo(px, H - 150, 150);
  spaced('ICON', H - 270, 18, k.bold, 5, '#FFFFFF', px);
  spaced('ENGINEERING', H - 292, 12, k.bold, 3.4, '#FFFFFF', px);
  spaced('INSTITUTE', H - 310, 12, k.bold, 3.4, '#FFFFFF', px);
  dash(page, px - 30, H - 324, px + 30, H - 324, k.gold, 1.2);
  put('Онлайн-институт', H - 340, 9.5, k.ital, GOLD_LT, px);
  put('Online institute', H - 353, 9, k.ital, GOLD_LT, px);
  // verification on the panel
  page.drawRectangle({ x: px - 36, y: 74, width: 72, height: 72, color: hex('#FFFFFF') });
  const png = await QRCode.toBuffer(c.verifyUrl, { margin: 1, width: 240 });
  page.drawImage(await k.pdf.embedPng(png), { x: px - 33, y: 77, width: 66, height: 66 });
  put('Проверка подлинности / Verify', 58, 7.5, k.bold, '#FFFFFF', px);
  put('№ ' + c.serial, 47, 7.5, k.reg, GOLD_LT, px);

  const lx = PW + 52;
  spaced('СЕРТИФИКАТ', H - 112, 40, k.bold, 8, k.ink, lx, 'l');
  spaced('CERTIFICATE', H - 134, 14, k.reg, 7, BLUE, lx, 'l');
  dash(page, lx, H - 150, lx + 70, H - 150, k.gold, 2);
  put('№ ' + c.serial, H - 172, 11, k.bold, k.muted, lx, 'l');
  body(k, c, { x: lx, y: H - 208, w: W - lx - 56, align: 'l', nameSize: 30, examSize: 20 });
  dateLines(k, c, brand, lx, 214, 'l');
  signer(k, brand.signatory.name, brand.signatory.title, lx + 85, 98, 0, 160);
  signer(k, brand.registrar.name, brand.registrar.title, lx + 85 + 200, 98, 1, 160);
  seal(k, brand, c, W - 88, 112, 0.85);
  page.drawRectangle({ x: PW + 22, y: 22, width: W - PW - 44, height: H - 44, borderColor: hex(k.gold), borderWidth: 0.6, opacity: 0, borderOpacity: 0.7 });
  if (opts.sample) sampleMark(k);
}

// ---------------------------------------------------------------- Classic gold (portrait)
async function drawClassic(k: Kit, c: CertificateData, brand: Brand, opts: { sample?: boolean }) {
  const { page, W, H } = k;
  const cx = W / 2;
  const { put, spaced } = tx(k);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex('#FBF7EC') });
  rosette(page, cx, H / 2 - 10, 17, 5, 4.2, 230, GOLD_DK, 0.35, 0.14);
  rosette(page, cx, H / 2 - 10, 13, 4, 3.4, 170, k.ink, 0.3, 0.1);
  k.putLogo(cx, H / 2 - 10, 380, 0.07);
  page.drawRectangle({ x: 22, y: 22, width: W - 44, height: H - 44, borderColor: hex(k.ink), borderWidth: 2.4 });
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: hex(k.gold), borderWidth: 1 });
  page.drawRectangle({ x: 36, y: 36, width: W - 72, height: H - 72, borderColor: hex(k.gold), borderWidth: 1.4, borderDashArray: [1.2, 3.2] });
  page.drawRectangle({ x: 44, y: 44, width: W - 88, height: H - 88, borderColor: hex(k.gold), borderWidth: 0.6 });
  page.drawRectangle({ x: 47, y: 47, width: W - 94, height: H - 94, borderColor: hex(k.ink), borderWidth: 1.2 });
  for (const [px, py, sx, sy] of [[47, 47, 1, 1], [W - 47, 47, -1, 1], [47, H - 47, 1, -1], [W - 47, H - 47, -1, -1]]) {
    page.drawCircle({ x: px, y: py, size: 12, color: hex('#FBF7EC'), borderColor: hex(k.ink), borderWidth: 1.2 });
    page.drawCircle({ x: px, y: py, size: 8, borderColor: hex(k.gold), borderWidth: 0.8 });
    diamond(page, px, py, 4, k.gold);
    for (let i = 1; i <= 3; i++) {
      dash(page, px + sx * 14, py + sy * i * 3, px + sx * (30 + i * 8), py + sy * i * 3, k.gold, 0.5);
      dash(page, px + sx * i * 3, py + sy * 14, px + sx * i * 3, py + sy * (30 + i * 8), k.gold, 0.5);
    }
  }
  k.putLogo(cx, H - 118, 84);
  spaced(brand.name.toUpperCase(), H - 186, 16, k.bold, 2.2, k.ink, cx);
  put('Онлайн-институт  ·  Online institute', H - 200, 9.5, k.ital, k.muted, cx);
  dash(page, cx - 90, H - 214, cx + 90, H - 214, k.gold, 0.8);
  diamond(page, cx, H - 214, 3.5, k.gold);
  spaced('СЕРТИФИКАТ', H - 258, 32, k.bold, 6, k.ink, cx);
  spaced('CERTIFICATE', H - 277, 13, k.reg, 6, GOLD_DK, cx);
  put('№ ' + c.serial, H - 297, 11, k.bold, k.ink, cx);
  body(k, c, { x: cx, y: H - 336, w: 400, align: 'c', nameSize: 27, examSize: 19 });
  dateLines(k, c, brand, cx, 262, 'c');
  signer(k, brand.signatory.name, brand.signatory.title, 150, 150, 0, 150);
  signer(k, brand.registrar.name, brand.registrar.title, W - 150, 150, 1, 150);
  seal(k, brand, c, cx, 158, 0.85, true);
  await qrBlock(k, c, 70, 68, 38);
  if (opts.sample) sampleMark(k);
}

// ---------------------------------------------------------------- Royal navy (portrait)
async function drawRoyal(k: Kit, c: CertificateData, brand: Brand, opts: { sample?: boolean }) {
  const { page, W, H } = k;
  const cx = W / 2;
  const { put, spaced } = tx(k);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(k.ink) });
  for (let t = -H; t < W + H; t += 10) dash(page, t, 0, t + H, H, k.gold, 0.4, 0.1);
  page.drawRectangle({ x: 26, y: 26, width: W - 52, height: H - 52, color: hex('#FBF8F1') });
  page.drawRectangle({ x: 26, y: 26, width: W - 52, height: H - 52, borderColor: hex(k.gold), borderWidth: 2 });
  page.drawRectangle({ x: 34, y: 34, width: W - 68, height: H - 68, borderColor: hex(k.ink), borderWidth: 1.4 });
  page.drawRectangle({ x: 38, y: 38, width: W - 76, height: H - 76, borderColor: hex(k.gold), borderWidth: 0.6 });
  const mid = 50;
  for (const [x0, y0, x1, y1] of [[48, H - mid, W - 48, H - mid], [48, mid, W - 48, mid], [mid, 48, mid, H - 48], [W - mid, 48, W - mid, H - 48]] as [number, number, number, number][]) {
    wave(page, x0, y0, x1, y1, 3, 30, 0, BLUE, 0.6, 0.8);
    wave(page, x0, y0, x1, y1, 3, 30, Math.PI, k.gold, 0.6, 0.9);
  }
  rosette(page, cx, H / 2 - 20, 17, 5, 4.2, 220, BLUE, 0.35, 0.13);
  k.putLogo(cx, H / 2 - 20, 360, 0.06);
  // crest badge
  for (let a = 0; a < 72; a++) {
    const t = (a / 72) * Math.PI * 2;
    dash(page, cx + Math.cos(t) * 66, H - 122 + Math.sin(t) * 66, cx + Math.cos(t) * (a % 2 ? 84 : 94), H - 122 + Math.sin(t) * (a % 2 ? 84 : 94), k.gold, 0.7, 0.8);
  }
  page.drawCircle({ x: cx, y: H - 122, size: 66, color: hex(k.ink), borderColor: hex(k.gold), borderWidth: 2.4 });
  page.drawCircle({ x: cx, y: H - 122, size: 60, borderColor: hex(k.gold), borderWidth: 0.7 });
  k.putLogo(cx, H - 122, 84);
  spaced(brand.name.toUpperCase(), H - 232, 16, k.bold, 2.2, k.ink, cx);
  put('Онлайн-институт  ·  Online institute', H - 246, 9.5, k.ital, k.muted, cx);
  spaced('СЕРТИФИКАТ', H - 290, 32, k.bold, 6, k.ink, cx);
  spaced('CERTIFICATE', H - 308, 13, k.reg, 6, BLUE, cx);
  put('№ ' + c.serial, H - 326, 11, k.bold, '#B3261E', cx);
  body(k, c, { x: cx, y: H - 362, w: 400, align: 'c', nameSize: 27, examSize: 19 });
  dateLines(k, c, brand, cx, 252, 'c');
  signer(k, brand.signatory.name, brand.signatory.title, 150, 150, 0, 150);
  signer(k, brand.registrar.name, brand.registrar.title, W - 150, 150, 1, 150);
  seal(k, brand, c, cx, 156, 0.85, true);
  await qrBlock(k, c, 70, 66, 38);
  if (opts.sample) sampleMark(k);
}

async function drawNavy(pdf: PDFDocument, c: CertificateData, brand: Brand, opts: { sample?: boolean }) {
  const kit = await makeKit(pdf, [841.89, 595.28], brand);
  const { page, W, H, reg, bold, ital, boldItal, putLogo } = kit;
  const ink = brand.ink;
  const gold = brand.accent;
  const cx = W / 2;

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: hex(PAPER) });

  // ---- Security background: fine line tint and guilloche rosettes ----
  for (let yy = 46; yy < H - 46; yy += 2.6) {
    page.drawLine({ start: { x: 46, y: yy }, end: { x: W - 46, y: yy }, thickness: 0.25, color: hex(BLUE), opacity: 0.045 });
  }
  const wy = H / 2 - 6;
  rosette(page, cx, wy, 17, 5, 4.2, 215, BLUE, 0.35, 0.16);
  rosette(page, cx, wy, 13, 4, 3.4, 170, gold, 0.35, 0.22);
  rosette(page, cx, wy, 19, 7, 5, 120, BLUE, 0.3, 0.14);
  // ---- Watermark: large emblem with fine rings ----
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

  // Microtext along the inner frame (readable only under magnification)
  const micro = ((brand.name.toUpperCase() + ' · ' + c.serial + ' · ').repeat(40));
  const mt = (x: number, y: number, len: number, rot: number) => {
    let t = '';
    let w = 0;
    for (const ch of micro) {
      const cw = reg.widthOfTextAtSize(ch, 2.6);
      if (w + cw > len) break;
      t += ch;
      w += cw;
    }
    page.drawText(t, { x, y, size: 2.6, font: reg, color: hex(ink), opacity: 0.75, rotate: degrees(rot) });
  };
  mt(70, H - 44.2, W - 140, 0);
  mt(70, 41.2, W - 140, 0);
  mt(44.4, 70, H - 140, 90);
  mt(W - 41.4, H - 70, H - 140, -90);

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
  page.drawText('№ ' + c.serial, { x: W - 52, y: H / 2 - 60, size: 11, font: bold, color: hex('#B3261E'), rotate: degrees(90) });
  page.drawText('№ ' + c.serial, { x: 52 + 8, y: H / 2 + 60, size: 11, font: bold, color: hex('#B3261E'), rotate: degrees(-90) });

  // ---- Body (bilingual) ----
  center('Настоящий сертификат подтверждает, что', H - 238, 12, reg);
  center('This is to certify that', H - 252, 10.5, ital, brand.muted);

  let nameSize = 28;
  while (boldItal.widthOfTextAtSize(c.name, nameSize) > 600 && nameSize > 16) nameSize -= 1;
  center(c.name, H - 284, nameSize, boldItal);
  page.drawLine({ start: { x: cx - 280, y: H - 292 }, end: { x: cx + 280, y: H - 292 }, thickness: 0.6, color: hex(gold) });

  for (const sx0 of [cx - 280, cx + 280]) {
    page.drawSvgPath('M' + (sx0 - 4) + ',' + -(H - 292) + ' L' + sx0 + ',' + -(H - 288) + ' L' + (sx0 + 4) + ',' + -(H - 292) + ' L' + sx0 + ',' + -(H - 296) + ' Z', { x: 0, y: 0, color: hex(gold) });
  }
  center('успешно прошёл(-а) курс обучения и сдал(-а) экзамен по программе', H - 312, 11.5, reg);
  center('has successfully completed the course of study and passed the examination in', H - 325, 10, ital, brand.muted);

  let y = block(c.exam, H - 344, 20, bold, 23, 640);

  const d = c.issued;
  const cityEn = brand.city.split(',')[0].trim();
  const cityRu = CITY_RU[cityEn] ?? cityEn;
  center(cityRu + ', ' + d.getUTCDate() + ' ' + MONTHS_RU[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ' г.', 208, 12, boldItal);
  center(cityEn + ', ' + d.getUTCDate() + ' ' + MONTHS_EN[d.getUTCMonth()] + ' ' + d.getUTCFullYear(), 195, 10, ital, brand.muted);

  // ---- Seal (centre bottom) ----
  const sx = cx;
  const sy = 122;
  for (const dir of [-1, 1]) {
    const bx = sx + dir * 20;
    page.drawSvgPath('M' + (bx - 15) + ',' + -(sy - 30) + ' L' + (bx + 15) + ',' + -(sy - 30) + ' L' + (bx + 15 + dir * 14) + ',' + -(sy - 68) + ' L' + (bx + dir * 14) + ',' + -(sy - 60) + ' L' + (bx - 15 + dir * 14) + ',' + -(sy - 68) + ' Z', { x: 0, y: 0, color: hex(ink), borderColor: hex(gold), borderWidth: 0.8 });
  }
  poly(page, sx, sy, 40, 54, 50, gold);
  page.drawCircle({ x: sx, y: sy, size: 52, borderColor: hex('#8A6A25'), borderWidth: 0.5 });
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
}

export async function buildCertificate(c: CertificateData, brand: Brand = siteBrand, opts: { sample?: boolean; design?: string } = {}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const design = opts.design ?? DEFAULT_DESIGN;
  const o = { sample: opts.sample };
  if (design === 'heritage-landscape') await drawHeritage(await makeKit(pdf, [841.89, 595.28], brand), c, brand, o);
  else if (design === 'modern-landscape') await drawModern(await makeKit(pdf, [841.89, 595.28], brand), c, brand, o);
  else if (design === 'classic-portrait') await drawClassic(await makeKit(pdf, [595.28, 841.89], brand), c, brand, o);
  else if (design === 'royal-portrait') await drawRoyal(await makeKit(pdf, [595.28, 841.89], brand), c, brand, o);
  else await drawNavy(pdf, c, brand, o);
  return pdf.save();
}
