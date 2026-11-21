// All college-specific content lives here. Edit this file to change names, fees and copy.
type Program = { name: string; slug: string; native: string; blurb: string; careers: string; modules: string[] };
type Level = { name: string; entry: string; duration: string; fee: string };
export const site: {
  key: string; name: string; short: string; native: string; prefix: string; country: string; law: string;
  email: string; phone: string; city: string; accreditation: string; intake: string; appFee: string; disclaimer: string;
  hero: { kicker: string; title: string; text: string };
  programsHeading: string; programsIntro: string; feeNote: string;
  programs: Program[]; applyLevels: string[]; programAccess: Record<string, string[]>; levels: Level[];
  faq: { q: string; a: string }[];
  signatory: { name: string; title: string };
  registrar: { name: string; title: string };
  cert: { bg: string; ink: string; accent: string; muted: string; line: string };
} = {
  "key": "orbita",
  "name": "Orbita Online Institute",
  "short": "Orbita",
  "native": "Онлайн-институт «Орбита»",
  "prefix": "ORB",
  "country": "Russia",
  "law": "the laws of the Russian Federation",
  "email": "admissions@orbita.example",
  "phone": "+7 495 000 00 00",
  "city": "Moscow, Russia",
  "accreditation": "application in progress. Not yet accredited.",
  "intake": "February 2027",
  "appFee": "$50",
  "disclaimer": "A fictional institution created for demonstration. Not affiliated with any existing university.",
  "hero": {
    "kicker": "IT · CYBER SECURITY · SATELLITE SYSTEMS",
    "title": "Learn the systems that run the orbit.",
    "text": "Online Bachelor, Master and PhD programs in Information Technology, Cyber Security and Satellite Systems, with a remote ground-station lab."
  },
  "programsHeading": "Three faculties. One institute.",
  "programsIntro": "Three faculties, each available at Bachelor, Master and PhD level. Modules below are the core of each program.",
  "programs": [
    {
      "name": "Information Technology",
      "slug": "it",
      "native": "ИНФОРМАЦИОННЫЕ ТЕХНОЛОГИИ",
      "blurb": "Build, connect and run the software that organizations depend on.",
      "careers": "software engineer, systems architect, cloud engineer, database administrator.",
      "modules": [
        "Algorithms and data structures",
        "Operating systems",
        "Databases",
        "Computer networks",
        "Cloud and distributed systems",
        "Software engineering project"
      ]
    },
    {
      "name": "Cyber Security",
      "slug": "cyber",
      "native": "КИБЕРБЕЗОПАСНОСТЬ",
      "blurb": "Defend systems and respond when they are attacked.",
      "careers": "security analyst, incident responder, security engineer, penetration tester.",
      "modules": [
        "Cryptography",
        "Network security",
        "Malware analysis",
        "Penetration testing",
        "Security operations",
        "Digital forensics"
      ]
    },
    {
      "name": "Satellite Systems",
      "slug": "satellite",
      "native": "СПУТНИКОВЫЕ СИСТЕМЫ",
      "blurb": "Design, operate and secure satellite links and ground stations.",
      "careers": "ground-segment engineer, RF engineer, mission analyst, Earth-observation data engineer.",
      "modules": [
        "Orbital mechanics",
        "Radio communications",
        "Satellite payloads and antennas",
        "Ground-station operations",
        "Earth-observation data",
        "Mission design project"
      ]
    }
  ],
  "applyLevels": [
    "Bachelor",
    "Master",
    "PhD"
  ],
  "programAccess": {},
  "levels": [
    {
      "name": "Bachelor",
      "entry": "Secondary school certificate",
      "duration": "4 years",
      "fee": "$3,500 per year (Satellite Systems $4,100)"
    },
    {
      "name": "Master",
      "entry": "Bachelor degree",
      "duration": "2 years",
      "fee": "$4,000 per year (Satellite Systems $4,600)"
    },
    {
      "name": "PhD",
      "entry": "Master degree and research proposal",
      "duration": "3 years",
      "fee": "$4,500 per year (Satellite Systems $5,100)"
    }
  ],
  "feeNote": "Fees are indicative benchmarks drawn from published tuition at Russian technical universities. Final fees are confirmed in your offer letter.",
  "faq": [
    {
      "q": "How is tuition charged?",
      "a": "Tuition is charged per academic year. The calculator shows the total for your whole degree. Final fees are confirmed in your offer letter."
    },
    {
      "q": "Can I pay in instalments?",
      "a": "Yes. Pay in full for 5% off, pay each semester at no extra cost, or pay monthly over the 10-month academic year with a 3% administration charge."
    },
    {
      "q": "Are there scholarships?",
      "a": "Scholarships of 25% or 50% of tuition are awarded on academic merit after admission. The scholarship committee reviews awards each year and renews them subject to your results."
    },
    {
      "q": "Which currency and methods can I pay with?",
      "a": "Fees are in US dollars, paid by bank transfer or international card."
    },
    {
      "q": "What happens if I withdraw?",
      "a": "Tuition is refunded in full within 14 days of enrolment if you have not started the course, 50% within 30 days, and not after that. Application and registration fees are not refundable."
    }
  ],
  "signatory": {
    "name": "I. Sokolov",
    "title": "Rector"
  },
  "registrar": {
    "name": "M. Volkova",
    "title": "Registrar"
  },
  "cert": {
    "bg": "#0A0F1E",
    "ink": "#14203F",
    "accent": "#D9381E",
    "muted": "#5A6685",
    "line": "#24325A"
  }
};
