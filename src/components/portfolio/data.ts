export type ProofTarget = {
  title: string;
  type: "image" | "pdf";
  src: string;
};

export type NavLink = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "leetcode";
};

export type AboutPanel = {
  label: string;
  title: string;
  body: string;
  chips: string[];
};

export type ExperienceItem = {
  period: string;
  role: string;
  company: string;
  meta: string;
  summary?: string;
  bullets: string[];
  stack?: string[];
  quote?: {
    text: string;
    author: string;
  };
};

export type ProjectItem = {
  title: string;
  description: string;
  stack: string[];
  link?: string;
  github?: string;
  apk?: string;
  image?: string;
  imageAlt?: string;
  proof?: ProofTarget;
};

export type EducationItem = {
  school: string;
  degree: string;
  period: string;
  cgpa?: string;
  detail: string;
  icon: "building" | "school";
};

export type SkillGroup = {
  title: string;
  icon: "layout" | "server" | "database" | "cloud" | "bot" | "wrench";
  skills: string[];
};

export type CertificationItem = {
  title: string;
  issuer: string;
  date: string;
  pdf: string;
  icon: "cloud" | "code" | "database" | "cog" | "trophy";
};

export type HonorItem = {
  title: string;
  detail: string;
  proof: string;
  icon: "trophy" | "award";
};

export type AchievementItem = {
  title: string;
  issuer: string;
  date: string;
  link: string;
  icon: "file" | "star" | "award" | "code";
};

export type TestimonialItem = {
  paragraphs: string[];
  name: string;
  role: string;
  initials: string;
};

export type BuildingItem = {
  title: string;
  status: string;
  description: string;
  features: string[];
  stack: string[];
  accent: "ember" | "violet" | "steel";
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#publication" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Certs", href: "#certifications" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/ShlokSathwara2",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/shlok-sathwara-4b91ab319/",
    icon: "linkedin",
  },
  {
    label: "LeetCode",
    href: "https://leetcode.com/u/Shlok_Sathwara/",
    icon: "leetcode",
  },
];

export const heroPhrases = [
  "AI-powered applications",
  "full-stack web apps",
  "intelligent systems",
  "scalable backend APIs",
  "smart automation tools",
];

export const heroStats = [
  { value: "9.44", label: "CGPA" },
  { value: "14+", label: "Projects" },
  { value: "7", label: "Certifications" },
  { value: "2", label: "Experiences" },
];

export const aboutParagraphs = [
  "I'm a Computer Science & Technology student at SRMIST with a CGPA of **9.44**, passionate about building impactful digital products. From leading a team at **Linde Engineering** to building AI-powered tools, I thrive at the intersection of design and engineering.",
  "My focus areas are **DSA & Java**, **AI Integration**, and building full-stack applications. I've delivered projects ranging from AI budget trackers and adaptive study platforms to full-stack platforms and recommendation systems, and I hold an **Oracle APEX Cloud Developer** certification.",
  "Currently seeking software engineering roles where I can apply my skills in full-stack development, AI integration, and cloud platforms. Also available for freelance engagements and open-source collaborations.",
];

export const aboutPanels: AboutPanel[] = [
  {
    label: "01",
    title: "Develop",
    body: "Full-stack and AI products: web apps, APIs, and retrieval-based AI features, built end to end and shipped.",
    chips: ["Next.js", "FastAPI", "Supabase", "pgvector", "Gemini API", "Groq"],
  },
  {
    label: "02",
    title: "Research",
    body: "Machine learning for security: published work on AI-based cloud intrusion detection, plus parallel computing with OpenMP, MPI, and CUDA.",
    chips: ["Python", "Random Forest", "PyCUDA", "OpenMP / MPI"],
  },
  {
    label: "03",
    title: "Design",
    body: "Interfaces with motion: scroll-driven animation and clean, fast UI that makes the product feel alive.",
    chips: ["Framer Motion", "Canvas", "Responsive UI", "Three.js"],
  },
];

export const experiences: ExperienceItem[] = [
  {
    period: "2024 — 2028",
    role: "B.Tech CSE",
    company: "SRM Institute of Science and Technology",
    meta: "Chennai, India · CGPA 9.44",
    summary:
      "Third-year Computer Science Engineering student with a CGPA of 9.44, expected to graduate in 2028.",
    bullets: [],
  },
  {
    period: "Jun — Jul 2026",
    role: "Team Lead — Helpdesk Portal Redesign",
    company: "Linde Engineering India Pvt. Ltd.",
    meta: "Vadodara, On-site",
    bullets: [
      "Led a small team with full ownership from planning through delivery",
      "Coordinated feature planning, task delegation, and technical decisions",
      "Redesigned frontend from scratch — custom animations, interactive UI components",
      "Rebuilt backend architecture for structure, maintainability, and clean API design",
      "Added stakeholder-requested features improving workflow efficiency",
      "Introduced role-based access + admin tooling",
      "Built reporting/analytics views for leadership visibility",
    ],
    stack: [
      "React",
      ".NET",
      "SQL Server",
      "Azure AD",
      "Framer Motion",
      "Three.js",
      "Chart.js",
      "ASP.NET Web API",
      "Microsoft Entra ID",
    ],
    quote: {
      text: "His dedication, ownership, and professionalism made a positive impact on the project and the team. I am confident he has a bright future ahead in software engineering.",
      author: "Miteshkumar Mehta, IT Department, Linde Engineering",
    },
  },
  {
    period: "Aug 2025 — Present",
    role: "Quality Assurance",
    company: "Aaruush, SRM University",
    meta: "On-site",
    bullets: [
      "QA lead for Aaruush — SRM's annual technical fest (5000+ attendees)",
      "Tested and validated event registration, scheduling, and live feedback systems",
      "Identified and reported 20+ bugs across web and mobile platforms before launch",
      "Implemented automated regression testing for repeatable event workflows",
    ],
  },
  {
    period: "Now",
    role: "Building & preparing",
    company: "Independent",
    meta: "Research · products · placements",
    summary:
      "Shipping SmartStudy AI, Lecturn, Threshold, and more, while preparing for placements and continuing research in AI-based cloud security.",
    bullets: [],
  },
];

export const research = {
  title: "AI-Based Intelligent Intrusion Detection System for Cloud",
  conference:
    "ICICCS 2026 — International Conference on Intelligent Computing and Communication Systems",
  description:
    "Built an AI-driven intrusion detection framework for cloud environments achieving **98%+ accuracy** with a **1.8% false positive rate**. Evaluated Random Forest against SVM and Decision Tree classifiers on the CICIDS2017 dataset. The system learns behavioral signatures instead of static byte patterns, enabling detection of novel zero-day attacks.",
  metrics: [
    "98%+ Accuracy",
    "CICIDS2017 Dataset",
    "RF, SVM, Decision Tree",
    "1.8% FPR",
    "Accepted 2026",
  ],
  acceptancePdf: "/ICICCS-2026_Paper_Accepted.pdf",
  acceptanceImage: "/paper-acceptance.jpg",
};

export const buildingItems: BuildingItem[] = [
  {
    title: "FRIDAY — AI Voice Assistant",
    status: "In Progress",
    description:
      "A full-featured personal AI assistant with voice biometric authentication, emotion detection, multi-model intelligence (Gemini + Ollama), RAG pipeline, screen OCR, smart home control, encrypted vault, and proactive scheduling.",
    features: [
      "Voice & Wake Word",
      "Gemini + Ollama AI",
      "Screen OCR & Vision",
      "Face Auth & Vault",
      "Smart Home Control",
      "Smart Scheduling",
    ],
    stack: [
      "Python",
      "Gemini",
      "Ollama",
      "Whisper",
      "OpenCV",
      "Tesseract",
      "SQLite",
      "FastAPI",
    ],
    accent: "ember",
  },
  {
    title: "ATS Resume Analyzer",
    status: "In Progress",
    description:
      "Hybrid rule-engine + LLM system that detects layout/format issues ATS parsers choke on — multi-column layouts, tables, text boxes, non-standard fonts, missing selectable text. Scores parseability, structure, and content strength with a weighted model. Tracks score history across resume versions.",
    features: [
      "Layout Rule Engine",
      "Parseability Scoring",
      "Section Detection",
      "Content Quality Checks",
      "Score History",
      "Version Diffing",
    ],
    stack: [
      "Next.js",
      "FastAPI",
      "Supabase",
      "Gemini 2.5 Flash",
      "pdfplumber",
      "python-docx",
      "SpaCy",
      "Framer Motion",
    ],
    accent: "steel",
  },
  {
    title: "Resume Tailor",
    status: "In Progress",
    description:
      "Per-application resume tailoring engine. Parses JDs to extract required skills and seniority signals, matches your master resume items via keyword + semantic scoring (pgvector), flags overqualification risk, and rewrites bullets to mirror the target role's language. Outputs ATS-friendly docx/PDF.",
    features: [
      "JD Skill Extraction",
      "Semantic Matching",
      "Overqualification Flags",
      "Bullet Rewrite AI",
      "ATS Template Output",
      "Master Resume DB",
    ],
    stack: [
      "Next.js",
      "FastAPI",
      "Supabase",
      "pgvector",
      "Gemini",
      "Groq",
      "python-docx",
      "Framer Motion",
    ],
    accent: "violet",
  },
];

export const projects: ProjectItem[] = [
  {
    title: "SurplusShare",
    description:
      "Full-stack surplus food sharing platform connecting donors (restaurants, hostels, caterers) with receivers (NGOs, shelters). Pickup workflow with auto-reject of competing requests, notifications, ratings, and an admin moderation dashboard. JWT-secured REST API with a 36-check end-to-end smoke test.",
    stack: [
      "React",
      "Vite",
      "Spring Boot",
      "Java 21",
      "Spring Security",
      "JWT",
      "MySQL",
      "JPA",
    ],
    link: "https://frontend-gray-two-c2lribev7e.vercel.app",
    github: "https://github.com/ShlokSathwara2/Surplusshare",
    image: "/posters/surplusshare.svg",
    imageAlt: "SurplusShare platform preview",
  },
  {
    title: "Shopwise",
    description:
      "Recommendation-driven e-commerce platform with a storefront, admin console, and live recommender API. Five recommenders (popularity, TF-IDF, item-CF, SVD, tuned hybrid) trained on 7,463 orders from the UCI Online Retail II dataset, with the best model served through FastAPI at under 16 ms median latency. Admin dashboard includes model comparison and one-click retraining.",
    stack: [
      "Python",
      "FastAPI",
      "Machine Learning",
      "Recommender Systems",
      "E-commerce",
    ],
    github: "https://github.com/ShlokSathwara2/Shopwise",
    image: "/posters/shopwise.svg",
    imageAlt: "Shopwise recommender engine preview",
  },
  {
    title: "Threshold Website",
    description:
      "Official web experience for Threshold — a modern, fast, student-focused website showcasing attendance, marks, CGPA, exams, timetable.",
    stack: ["React", "UI/UX", "Frontend", "Responsive"],
    github: "https://github.com/ShlokSathwara2/Threshold",
    image: "/threshold-website.webp",
    imageAlt: "Threshold Website preview",
    proof: {
      title: "Threshold Website",
      type: "image",
      src: "/threshold-website.jpg",
    },
  },
  {
    title: "Lecturn",
    description:
      "Mobile-first PWA that transforms lecture slide photos into organized, searchable notes. AI extracts verbatim text via Gemini, groups into chapters, supports semantic search + Whisper audio transcription. Offline-first with sync.",
    stack: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "FastAPI",
      "Supabase",
      "Gemini",
      "Groq Whisper",
    ],
    link: "https://lecturn-app.vercel.app",
    github: "https://github.com/ShlokSathwara2/Lecturn",
    image: "/posters/lecturn.svg",
    imageAlt: "Lecturn PWA preview",
  },
  {
    title: "Global Deal Finder",
    description:
      "AI-powered tool that calculates the true cheapest way to buy any product across 7 countries. Compares local, imported, and traveler-carried prices with real card offers, VAT refunds, customs duty.",
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "FastAPI",
      "Supabase",
      "Groq",
      "Gemini",
    ],
    link: "https://global-deal-finder-tau.vercel.app",
    github: "https://github.com/ShlokSathwara2/Global-Deal-Finder",
    image: "/posters/global-deal-finder.svg",
    imageAlt: "Global Deal Finder preview",
  },
  {
    title: "LearnPath",
    description:
      "AI-driven adaptive study-path platform with real-time quiz injection. Built with Aditya Bhambhani (Rutgers). Co-developed at Linde.",
    stack: ["Next.js", "Supabase", "Gemini API", "AI/ML"],
    link: "https://learnpath-ai-nuiw.vercel.app",
    image: "/posters/learnpath.svg",
    imageAlt: "LearnPath study platform preview",
  },
  {
    title: "Threshold",
    description:
      "SRMIST student companion app that unifies attendance, marks, CGPA, and timetable data from multiple college portals into one clean interface.",
    stack: [
      "Next.js",
      "Python",
      "FastAPI",
      "Capacitor",
      "Render",
      "Vercel",
    ],
    github: "https://github.com/ShlokSathwara2/Threshold",
    apk: "https://github.com/ShlokSathwara2/Threshold_APK",
    image: "/threshold-apk.webp",
    imageAlt: "Threshold app preview",
    proof: {
      title: "Threshold APK",
      type: "image",
      src: "/threshold-apk.jpg",
    },
  },
  {
    title: "SmartStudy AI",
    description:
      "Real-time collaborative study rooms with SM-2 spaced repetition, voice input via Groq Whisper, offline-first IndexedDB. $0/month infra.",
    stack: [
      "Next.js 14",
      "TypeScript",
      "Supabase",
      "Groq",
      "Gemini",
      "Ollama",
    ],
    link: "https://smart-flow-ai-delta.vercel.app",
    github: "https://github.com/ShlokSathwara2/Smart-Study-Planner-with-AI",
    image: "/posters/smartstudy-ai.svg",
    imageAlt: "SmartStudy AI preview",
  },
  {
    title: "TRIKIA",
    description:
      "AI-powered budget tracker with voice commands, anomaly detection, family shared budgets, financial simulator, and bill reminders. Includes React Native mobile app.",
    stack: ["React", "Node/Express", "MongoDB", "React Native", "JWT"],
    link: "https://ai-budget-tracker-9d2e.vercel.app",
    github: "https://github.com/ShlokSathwara2/AI-BUDGET-TRACKER",
    image: "/posters/trikia.svg",
    imageAlt: "TRIKIA AI budget tracker preview",
  },
  {
    title: "PipeStressRM",
    description:
      "Automated resource/scheduling system for pipe-stress engineering. Skill/workload-based task matching, 2-year Gantt schedules generated in under a minute.",
    stack: ["Python", "OpenPyXL", "Excel Automation"],
    image: "/posters/pipestressrm.svg",
    imageAlt: "PipeStressRM engineering scheduler preview",
  },
  {
    title: "Smart Attendance System",
    description:
      "GPS-verified attendance with entity-repo-service-controller backend. Geofencing, real-time tracking, role-based dashboards.",
    stack: ["Java", "JDBC", "MySQL", "HTML", "JavaScript"],
    github: "https://github.com/ShlokSathwara2/GPS-ATTENDANCE-SYSTEM",
    image: "/posters/smart-attendance.svg",
    imageAlt: "Smart Attendance System preview",
  },
  {
    title: "CineMatch",
    description:
      "AI movie recommendation engine with personalized suggestions based on user preferences and viewing history.",
    stack: ["React/Next.js", "Flask", "TMDB API"],
    image: "/posters/cinematch.svg",
    imageAlt: "CineMatch recommendation engine preview",
  },
  {
    title: "Smart Study Planner",
    description:
      "Python + AI planning logic with Streamlit interface. Task prioritization and schedule generation.",
    stack: ["Python", "Streamlit", "AI"],
    github: "https://github.com/ShlokSathwara2/Smart-Study-Planner",
    image: "/posters/smart-study-planner.svg",
    imageAlt: "Smart Study Planner preview",
  },
  {
    title: "College Database System",
    description:
      "DBMS mini-project with MySQL. Normalization, CRUD operations, and comprehensive data management.",
    stack: ["MySQL", "JavaScript", "Node.js"],
    github: "https://github.com/ShlokSathwara2/College-Database-System",
    image: "/posters/college-database.svg",
    imageAlt: "College Database System preview",
  },
];

export const education: EducationItem[] = [
  {
    school: "SRM Institute of Science and Technology (SRMIST)",
    degree: "B.Tech — Computer Science and Technology",
    period: "Aug 2024 — Jun 2028",
    cgpa: "9.44",
    detail: "Sem 1: 9.33 · Sem 2: 9.48 · Sem 3: 9.2 · Sem 4: 9.7",
    icon: "building",
  },
  {
    school: "Delhi Public School Vadodara",
    degree: "Higher Secondary Education",
    period: "Apr 2009 — May 2022",
    detail: "Proficiency in English (2021-22), Mathematics (2017-19)",
    icon: "school",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    icon: "layout",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Three.js",
      "HTML/CSS",
    ],
  },
  {
    title: "Backend",
    icon: "server",
    skills: [
      "Spring Boot",
      "Spring Security",
      "JWT",
      "FastAPI",
      "Node.js",
      "Express",
      ".NET",
      "ASP.NET Web API",
      "Python",
      "Java",
      "Flask",
    ],
  },
  {
    title: "Database",
    icon: "database",
    skills: [
      "SQL Server",
      "MongoDB",
      "MySQL",
      "Supabase",
      "SQLite",
      "pgvector",
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: "cloud",
    skills: [
      "Azure AD",
      "Microsoft Entra ID",
      "Oracle APEX",
      "Git",
      "GitHub Actions",
    ],
  },
  {
    title: "AI & ML",
    icon: "bot",
    skills: [
      "Recommender Systems",
      "Gemini API",
      "Groq",
      "Ollama",
      "AI Integration",
      "Spaced Repetition",
    ],
  },
  {
    title: "Languages & Tools",
    icon: "wrench",
    skills: [
      "Java",
      "Python",
      "C",
      "JavaScript",
      "DSA",
      "Streamlit",
      "OpenPyXL",
    ],
  },
];

export const physicsSkills = [
  "React",
  "Next.js",
  "TypeScript",
  "Spring Boot",
  "Spring Security",
  "JWT",
  "FastAPI",
  "Recommender Systems",
  "Node.js",
  "Python",
  "Java",
  "SQL Server",
  "MongoDB",
  "Supabase",
  "pgvector",
  "Gemini API",
  "Groq",
  "Ollama",
  "Azure AD",
  "Oracle APEX",
  "Git",
  "Framer Motion",
  "Three.js",
  "Tailwind CSS",
  "C",
  "OpenMP",
];

export const allSkills = Array.from(
  new Set(skillGroups.flatMap((group) => group.skills))
).sort((a, b) => a.localeCompare(b));

export const certifications: CertificationItem[] = [
  {
    title: "Oracle APEX Cloud Developer",
    issuer: "Oracle",
    date: "Oct 2025 — Oct 2027",
    pdf: "/Oracle_APEX_Cert.pdf",
    icon: "cloud",
  },
  {
    title: "DSA using Java",
    issuer: "NPTEL",
    date: "Nov 2025",
    pdf: "/NPTEL_DSA_Java.pdf",
    icon: "code",
  },
  {
    title: "Database Management System",
    issuer: "NPTEL",
    date: "Jan 2026",
    pdf: "/NPTEL_DBMS.pdf",
    icon: "database",
  },
  {
    title: "OOP Fundamentals",
    issuer: "NPTEL",
    date: "Apr 2025",
    pdf: "/NPTEL_OOP.pdf",
    icon: "cog",
  },
  {
    title: "C For Beginners",
    issuer: "Great Learning",
    date: "Aug 2024",
    pdf: "/Great_Learning_C.pdf",
    icon: "code",
  },
  {
    title: "HackTrax 2.0",
    issuer: "Alexa Developers SRM",
    date: "Hackathon Participation",
    pdf: "/HackTrax_Certificate.pdf",
    icon: "trophy",
  },
  {
    title: "Programming in C",
    issuer: "Baroda Institute of Technology",
    date: "Apr 2025",
    pdf: "/C_Language_BIT_Cert.pdf",
    icon: "code",
  },
];

export const honors: HonorItem[] = [
  {
    title: "Toppers of 4th Semester — D1 Section (SRM)",
    detail: "SGPA 9.7 · Jun 2026",
    proof: "/SEM1_Toppers.jpg",
    icon: "trophy",
  },
  {
    title: "Toppers of 2nd Semester — D1 Section (SRM)",
    detail: "SGPA 9.476 · Jun 2025",
    proof: "/SEM2_Toppers.jpg",
    icon: "trophy",
  },
  {
    title: "Toppers of 1st Semester — D1 Section (SRM)",
    detail: "SGPA 9.33 · Jan 2025",
    proof: "/SEM1_Toppers.jpg",
    icon: "trophy",
  },
  {
    title: "Proficiency in English",
    detail: "Delhi Public School Vadodara · 2021-22",
    proof: "/Proficiency_English.jpg",
    icon: "award",
  },
  {
    title: "Proficiency in Mathematics",
    detail: "Delhi Public School Vadodara · 2017-19",
    proof: "/Proficiency_Math_17.jpg",
    icon: "award",
  },
];

export const achievements: AchievementItem[] = [
  {
    title: "Internship Completion Certificate",
    issuer: "Linde Engineering India Pvt. Ltd.",
    date: "Jun — Jul 2026",
    link: "/Internship_Completion_Certificate_of_Shlok_Sathwara.pdf",
    icon: "file",
  },
  {
    title: "Certificate of Appreciation",
    issuer: "Linde Engineering India Pvt. Ltd.",
    date: "Jul 2026",
    link: "/Certification of Appreciation.pdf",
    icon: "star",
  },
  {
    title: "Letter of Recommendation",
    issuer: "Linde Engineering India Pvt. Ltd.",
    date: "Jul 2026",
    link: "/Certification of Recommendation.pdf",
    icon: "award",
  },
  {
    title: "HackTrax 2.0 — Certificate of Participation",
    issuer: "Alexa Developers SRM",
    date: "Hackathon",
    link: "/HackTrax_Certificate.pdf",
    icon: "code",
  },
];

export const testimonials: TestimonialItem[] = [
  {
    paragraphs: [
      "Shlok consistently demonstrated a strong desire to understand the purpose and business value behind the Linde Helpdesk Portal before starting development. His curiosity and eagerness to learn enabled him to quickly grasp both frontend and backend technologies and deliver high-quality solutions.",
      "He approached challenges with a positive attitude, remained composed under pressure, and adapted quickly to changing requirements without losing momentum. His dedication, ownership, and professionalism made a positive impact on the project and the team.",
    ],
    name: "Miteshkumar Mehta",
    role: "IT Department, Linde Engineering India",
    initials: "MM",
  },
  {
    paragraphs: [
      "During your six-week internship, you demonstrated a commendable level of enthusiasm, commitment, and aptitude for application development. You successfully developed a prototype application and consistently exhibited a proactive approach toward understanding user requirements.",
      "Your willingness to listen, learn, and incorporate feedback reflected a mature and professional approach. You left a positive impression as a reliable, dedicated, and capable IT professional in the making.",
    ],
    name: "Mehul Vaidya",
    role: "Dy. Manager - Facility Management, Linde Engineering India",
    initials: "MV",
  },
];

export const contact = {
  email: "shloksathwara2@gmail.com",
  location: "Vadodara, Gujarat, India",
  intro:
    "Have a project in mind or just want to chat? I'm always open to new opportunities and interesting conversations.",
  resume: "/Resume_2608.pdf",
};
