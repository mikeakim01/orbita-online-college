/** Year-by-year module outlines for the degree programs. */
export type Block = { title: string; items: string[] };

const BACHELOR: Record<string, Block[]> = {
  it: [
    { title: 'Year 1', items: ['Mathematical Analysis', 'Linear Algebra and Analytic Geometry', 'Discrete Mathematics', 'Physics', 'Programming Fundamentals (C/C++, Python)', 'Informatics', 'Professional English'] },
    { title: 'Year 2', items: ['Probability and Statistics', 'Algorithms and Data Structures', 'Object-Oriented Programming (Java, C#)', 'Computer Architecture', 'Operating Systems', 'Databases (SQL)', 'Computer Networks', 'Philosophy'] },
    { title: 'Year 3', items: ['Web Technologies', 'Software Engineering', 'Information Systems Design', 'Information Security Fundamentals', 'Distributed Systems', 'Introduction to Machine Learning', 'Industrial Practicum'] },
    { title: 'Year 4', items: ['Cloud and DevOps', 'Enterprise Information Systems', 'Big Data', 'IT Project Management', 'Pre-graduation Practicum', 'Final Examination and Graduation Thesis'] },
  ],
  cyber: [
    { title: 'Year 1', items: ['Mathematical Analysis', 'Algebra', 'Discrete Mathematics', 'Physics', 'Programming', 'Informatics', 'Fundamentals of Information Security', 'Professional English'] },
    { title: 'Year 2', items: ['Number Theory', 'Probability', 'Computer Networks', 'Operating Systems', 'Databases', 'Electronics and Circuits', 'Organizational and Legal Aspects of Information Security'] },
    { title: 'Year 3', items: ['Cryptographic Methods', 'Network Security', 'Software and Hardware Protection', 'Technical Protection of Information (anti-eavesdropping, side-channel attacks)', 'Vulnerability Analysis', 'Information Security Management'] },
    { title: 'Year 4', items: ['Penetration Testing', 'Incident Response and Security Operations', 'Reverse Engineering', 'Security Regulation and Data-Protection Law', 'Practicums', 'Final Examination and Graduation Thesis'] },
  ],
  satellite: [
    { title: 'Year 1', items: ['Mathematical Analysis', 'Analytic Geometry', 'Physics', 'Engineering Graphics and CAD', 'Programming (C, MATLAB)', 'Chemistry', 'Professional English'] },
    { title: 'Year 2', items: ['Differential Equations', 'Theoretical Mechanics', 'Strength of Materials', 'Electrical Engineering and Electronics', 'Thermodynamics', 'Introduction to Astronautics'] },
    { title: 'Year 3', items: ['Orbital Mechanics and Ballistics', 'Spacecraft Design', 'Onboard Systems (power, thermal, attitude control)', 'Radio Engineering and Antennas', 'Satellite Communications', 'Rocket Propulsion'] },
    { title: 'Year 4', items: ['Small Satellite and CubeSat Design', 'Flight Control Centre Operations', 'Earth Remote Sensing', 'Satellite Navigation (GNSS)', 'Spacecraft Testing', 'Industry Practicum', 'Final Examination and Graduation Thesis'] },
  ],
};

const MASTER: Record<string, Block[]> = {
  it: [
    { title: 'Core modules', items: ['Advanced Methods of Information Systems Design', 'Research Methodology', 'Data Mining and AI', 'High-Performance Computing', 'Digital Transformation Management'] },
    { title: 'Research and thesis', items: ['Research work every semester', 'Research practicum', 'Master’s dissertation and defence'] },
  ],
  cyber: [
    { title: 'Specializations', items: ['Computer System Information Security', 'Cryptographic Methods of Information Security', 'Analytical Management of Information Security'] },
    { title: 'Core modules', items: ['Cyber Threat Assessment', 'Cloud and IoT Security', 'Applied Cryptography', 'Security of AI Systems', 'Information Security Risk Management', 'Research Methodology'] },
    { title: 'Practical work and thesis', items: ['Capture the Flag (CTF) competitions', 'Research work', 'Master’s dissertation and defence'] },
  ],
  satellite: [
    { title: 'Core modules', items: ['Advanced Spacecraft Dynamics', 'Mission Design', 'Satellite Communication Systems', 'Space Systems Reliability', 'Earth Remote Sensing Data Processing', 'Geoinformatics'] },
    { title: 'Applied focus', items: ['The design, assembly, testing and flight-operations cycle of small spacecraft'] },
    { title: 'Research and thesis', items: ['Research work', 'Master’s dissertation and defence'] },
  ],
};

const PHD: Block[] = [
  { title: 'Year 1', items: ['Coursework: history and philosophy of science, academic English, your specialty discipline and research methods', 'Choose your supervisor and dissertation topic'] },
  { title: 'Years 1 to 2', items: ['Qualifying examinations in philosophy of science, foreign language and your specialty'] },
  { title: 'Years 2 to 3', items: ['Original research', 'Publish at least two or three articles in peer-reviewed journals, and present at conferences'] },
  { title: 'Year 3', items: ['Teaching practicum', 'Full dissertation draft', 'Pre-defence at the department, then public defence before a dissertation panel'] },
];

export function curriculum(faculty: string, level: string): Block[] | null {
  if (level === 'Bachelor') return BACHELOR[faculty] ?? null;
  if (level === 'Master') return MASTER[faculty] ?? null;
  if (level === 'PhD') return PHD;
  return null;
}
