// All college-specific content lives here. Edit this file to change names, fees and copy.
type Program = { name: string; slug: string; native: string; blurb: string; careers: string; modules: string[] };
type Level = { name: string; entry: string; duration: string; fee: string };
type Course = { tier: string; faculty: string; name: string; weeks: number; fee: number; blurb: string; prerequisite: string };
export const site: {
  key: string; name: string; short: string; native: string; prefix: string; country: string; law: string;
  email: string; phone: string; city: string; accreditation: string; intake: string; appFee: string; disclaimer: string;
  hero: { kicker: string; title: string; text: string };
  programsHeading: string; programsIntro: string; feeNote: string;
  programs: Program[]; applyLevels: string[]; programAccess: Record<string, string[]>; levels: Level[]; courses?: Course[];
  docRules?: Record<string, { key: string; label: string; hint: string; required: boolean }[]>;
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
  "email": "",
  "phone": "",
  "city": "",
  "accreditation": "",
  "intake": "February 2027",
  "appFee": "$50",
  "disclaimer": "",
  "hero": {
    "kicker": "IT · CYBER SECURITY · SATELLITE SYSTEMS",
    "title": "Learn the systems that run the orbit.",
    "text": "Online certificates, diplomas, Bachelor, Master and PhD programs in Information Technology, Cyber Security and Satellite Systems."
  },
  "programsHeading": "Three faculties. One institute.",
  "programsIntro": "Three faculties, each available from short certificate courses and diplomas up to Bachelor, Master and PhD level. Modules below are the core of each degree.",
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
    "Certificate",
    "Diploma",
    "Bachelor",
    "Master",
    "PhD"
  ],
  "programAccess": {},
  "levels": [
    {
      "name": "Certificate",
      "entry": "None for Entry courses; Mid and Pro courses list their own prerequisites",
      "duration": "6 to 16 weeks per course",
      "fee": "$150 to $1,500 per course"
    },
    {
      "name": "Diploma",
      "entry": "Secondary school certificate",
      "duration": "2 years",
      "fee": "$2,400 per year (Satellite Systems $2,900)"
    },
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
  "docRules": {
    "Certificate": [
      {
        "key": "id",
        "label": "Passport or national ID",
        "hint": "The photo page of your passport, or both sides of your national ID.",
        "required": true
      },
      {
        "key": "prerequisite",
        "label": "Proof of prerequisite",
        "hint": "Mid and Pro courses only: a certificate, CV or letter showing the prerequisite listed on the course.",
        "required": false
      }
    ],
    "Diploma": [
      {
        "key": "id",
        "label": "Passport or national ID",
        "hint": "The photo page of your passport, or both sides of your national ID.",
        "required": true
      },
      {
        "key": "secondary",
        "label": "Secondary school certificate and results",
        "hint": "Your final school certificate with your subject results.",
        "required": true
      }
    ],
    "Bachelor": [
      {
        "key": "id",
        "label": "Passport or national ID",
        "hint": "The photo page of your passport, or both sides of your national ID.",
        "required": true
      },
      {
        "key": "secondary",
        "label": "Secondary school certificate and results",
        "hint": "Your final school certificate with your subject results.",
        "required": true
      },
      {
        "key": "english",
        "label": "Proof of English ability",
        "hint": "Only if English is not your first language, for example a test result or a letter from your last school.",
        "required": false
      }
    ],
    "Master": [
      {
        "key": "id",
        "label": "Passport or national ID",
        "hint": "The photo page of your passport, or both sides of your national ID.",
        "required": true
      },
      {
        "key": "degree",
        "label": "Previous degree certificate",
        "hint": "The certificate for your Bachelor degree (Master applicants) or Master degree (PhD applicants).",
        "required": true
      },
      {
        "key": "transcript",
        "label": "Academic transcript",
        "hint": "Official transcript from your last institution.",
        "required": true
      },
      {
        "key": "cv",
        "label": "CV or resume",
        "hint": "One or two pages.",
        "required": false
      },
      {
        "key": "english",
        "label": "Proof of English ability",
        "hint": "Only if English is not your first language, for example a test result or a letter from your last school.",
        "required": false
      }
    ],
    "PhD": [
      {
        "key": "id",
        "label": "Passport or national ID",
        "hint": "The photo page of your passport, or both sides of your national ID.",
        "required": true
      },
      {
        "key": "degree",
        "label": "Previous degree certificate",
        "hint": "The certificate for your Bachelor degree (Master applicants) or Master degree (PhD applicants).",
        "required": true
      },
      {
        "key": "transcript",
        "label": "Academic transcript",
        "hint": "Official transcript from your last institution.",
        "required": true
      },
      {
        "key": "proposal",
        "label": "Research proposal",
        "hint": "One to two pages describing the question you want to research.",
        "required": true
      },
      {
        "key": "cv",
        "label": "CV or resume",
        "hint": "One or two pages.",
        "required": false
      },
      {
        "key": "english",
        "label": "Proof of English ability",
        "hint": "Only if English is not your first language, for example a test result or a letter from your last school.",
        "required": false
      }
    ]
  },
  "courses": [
    {
      "tier": "Entry",
      "faculty": "it",
      "name": "IT Foundations",
      "weeks": 8,
      "fee": 180,
      "blurb": "Computers, files, networks and the internet explained from the ground up.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "it",
      "name": "Web Development Basics",
      "weeks": 10,
      "fee": 250,
      "blurb": "Build and publish your first web pages with HTML, CSS and a little JavaScript.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "cyber",
      "name": "Cyber Hygiene and Online Safety",
      "weeks": 6,
      "fee": 150,
      "blurb": "Passwords, phishing, privacy and safe habits for work and home.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "cyber",
      "name": "Introduction to Networks and Security",
      "weeks": 8,
      "fee": 220,
      "blurb": "How networks work and the basic ways they are attacked and defended.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "satellite",
      "name": "Introduction to Satellites and Space Systems",
      "weeks": 6,
      "fee": 200,
      "blurb": "Orbits, launch, communications and what satellites are used for.",
      "prerequisite": "None"
    },
    {
      "tier": "Mid",
      "faculty": "it",
      "name": "Python for Data and Automation",
      "weeks": 12,
      "fee": 480,
      "blurb": "Write Python scripts that clean data, call services and automate routine work.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "it",
      "name": "Cloud Fundamentals and Deployment",
      "weeks": 12,
      "fee": 600,
      "blurb": "Deploy and run applications on cloud servers, with storage and monitoring.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "cyber",
      "name": "Network Defense and Monitoring",
      "weeks": 12,
      "fee": 650,
      "blurb": "Firewalls, logging and intrusion detection for small and medium networks.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "cyber",
      "name": "Ethical Hacking Essentials",
      "weeks": 12,
      "fee": 720,
      "blurb": "Scan, test and report on weaknesses in a safe, authorised lab.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "satellite",
      "name": "Radio Communications and Antennas",
      "weeks": 12,
      "fee": 700,
      "blurb": "Signals, modulation, link budgets and antenna basics for satellite links.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Pro",
      "faculty": "it",
      "name": "DevOps and Site Reliability Engineering",
      "weeks": 16,
      "fee": 1200,
      "blurb": "Automated pipelines, infrastructure as code and keeping services reliable.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "cyber",
      "name": "Incident Response and Digital Forensics",
      "weeks": 16,
      "fee": 1300,
      "blurb": "Contain an attack, collect evidence and write the incident report.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "cyber",
      "name": "Security Operations Centre Analyst",
      "weeks": 16,
      "fee": 1250,
      "blurb": "Triage alerts, hunt threats and run a 24-hour security operations desk.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "satellite",
      "name": "Ground-Station Operations and Link Security",
      "weeks": 16,
      "fee": 1400,
      "blurb": "Operate a ground station and protect the command and data links.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "satellite",
      "name": "Earth-Observation Data Engineering",
      "weeks": 16,
      "fee": 1300,
      "blurb": "Process satellite imagery at scale into maps and analytics products.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Entry",
      "faculty": "it",
      "name": "Blockchain and Cryptocurrency Basics",
      "weeks": 6,
      "fee": 190,
      "blurb": "How blockchains, wallets and digital currencies work, and how to hold them safely.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "it",
      "name": "Computer Networking Essentials",
      "weeks": 8,
      "fee": 210,
      "blurb": "Addresses, switches, routers and Wi-Fi: build and troubleshoot a small network.",
      "prerequisite": "None"
    },
    {
      "tier": "Entry",
      "faculty": "it",
      "name": "Cloud Computing Essentials",
      "weeks": 6,
      "fee": 200,
      "blurb": "What the cloud is, the main service types and how to launch your first server.",
      "prerequisite": "None"
    },
    {
      "tier": "Mid",
      "faculty": "it",
      "name": "Smart Contracts and Blockchain Development",
      "weeks": 12,
      "fee": 650,
      "blurb": "Write, test and deploy smart contracts and build apps that talk to a blockchain.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "it",
      "name": "Routing, Switching and Network Design",
      "weeks": 12,
      "fee": 620,
      "blurb": "VLANs, dynamic routing and designing reliable networks for offices and campuses.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Mid",
      "faculty": "it",
      "name": "Cloud Architecture and Containers",
      "weeks": 12,
      "fee": 640,
      "blurb": "Containers, load balancing, storage and designing cloud systems that scale.",
      "prerequisite": "Entry-level course or equivalent experience"
    },
    {
      "tier": "Pro",
      "faculty": "it",
      "name": "Blockchain Security and Digital-Asset Custody",
      "weeks": 16,
      "fee": 1350,
      "blurb": "Audit smart contracts, secure keys and run custody for digital assets.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "it",
      "name": "Enterprise and Carrier Network Engineering",
      "weeks": 16,
      "fee": 1300,
      "blurb": "Design, automate and secure large provider and enterprise networks.",
      "prerequisite": "Mid-level course or two years of work experience"
    },
    {
      "tier": "Pro",
      "faculty": "it",
      "name": "Multi-Cloud Architecture and Cloud Security",
      "weeks": 16,
      "fee": 1400,
      "blurb": "Architect across several clouds with identity, cost control and compliance built in.",
      "prerequisite": "Mid-level course or two years of work experience"
    }
  ],
  "feeNote": "Final fees are confirmed in your offer letter.",
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
    "name": "",
    "title": "Rector"
  },
  "registrar": {
    "name": "",
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

// Production details. Set these in the Vercel project's environment variables; sections that need them stay hidden until set.
site.email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? '';
site.phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';
site.city = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? '';
site.accreditation = process.env.NEXT_PUBLIC_ACCREDITATION ?? '';
site.signatory.name = process.env.NEXT_PUBLIC_RECTOR_NAME ?? '';
site.registrar.name = process.env.NEXT_PUBLIC_REGISTRAR_NAME ?? '';
