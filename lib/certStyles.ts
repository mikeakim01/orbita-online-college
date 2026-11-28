// The certificate designs an administrator can choose from. No PDF code here, so pages can import it.
export const CERT_DESIGNS = [
  { id: 'navy-landscape', name: 'Navy guilloche', orientation: 'Landscape', note: 'Ornamental navy, blue and gold border, security-print background, ribbon seal.' },
  { id: 'heritage-landscape', name: 'Heritage gold', orientation: 'Landscape', note: 'Cream parchment with woven gold bands, corner rosettes and a centred crest watermark.' },
  { id: 'modern-landscape', name: 'Modern blue panel', orientation: 'Landscape', note: 'Clean white page with a navy side panel for the crest and the verification QR code.' },
  { id: 'classic-portrait', name: 'Classic gold portrait', orientation: 'Portrait', note: 'Traditional double gold frame with dotted rule, corner ornaments and a ribbon seal.' },
  { id: 'royal-portrait', name: 'Royal navy portrait', orientation: 'Portrait', note: 'Navy page frame, radiant crest badge, guilloche edging and a red serial number.' },
] as const;

export type DesignId = (typeof CERT_DESIGNS)[number]['id'];
export const DEFAULT_DESIGN: DesignId = 'navy-landscape';
export const isDesign = (v: unknown): v is DesignId => CERT_DESIGNS.some((d) => d.id === v);
