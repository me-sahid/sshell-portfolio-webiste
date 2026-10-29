import type { Identity, EducationItem, TechnicalSkills, ProjectItem, AchievementItem } from './types'

export const IDENTITY: Identity = {
  name: 'Sahid Al Hassan',
  shortIdentity: 'Computer Science and Engineering student focused on backend systems, systems engineering, and cybersecurity.',
  focus: 'Backend Systems | Systems Engineering | Cybersecurity',
  phone: '+91 8116282746',
  email: 'sahidzack61@gmail.com',
  linkedin: 'https://linkedin.com/in/sahid-al-hassan',
  github: 'https://github.com/me-sahid',
  website: 'https://zancrypt.in',
}

export const EDUCATION: EducationItem[] = [
  {
    institution: 'Chaitanya Deemed to be University',
    location: 'Hyderabad, India',
    degree: 'Bachelor of Technology - Computer Science and Engineering',
    cgpa: '9.38',
    dates: 'August 2024 – May 2028',
  },
  {
    institution: 'Jakir Hossain Institute of Polytechnic',
    location: 'West Bengal, India',
    degree: 'Diploma in Computer Science and Technology',
    cgpa: '8.00',
    dates: 'August 2021 – May 2024',
  },
]

export const SKILLS: TechnicalSkills = {
  programmingLanguages: ['C++', 'C', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  databasesAndCaching: ['PostgreSQL', 'MySQL', 'Redis'],
  frameworksAndWeb: ['FastAPI', 'React.js', 'Next.js', 'Node.js', 'Tailwind CSS', 'HTML/CSS'],
  toolsAndTechnologies: ['Docker', 'Linux', 'Git', 'Cloudflare', 'RESTful APIs'],
  coreConcepts: [
    'Data Structures & Algorithms',
    'Systems Engineering',
    'Cybersecurity',
    'Computer Networks',
  ],
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'zancrypt',
    name: 'Zancrypt',
    technologies: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Redis', 'Docker'],
    dates: 'May 12 – July 4, 2025',
    website: 'https://zancrypt.in',
    bullets: [
      'Architected and deployed a production-grade zero-knowledge cloud storage platform featuring client-side AES-256-GCM encryption to ensure plain-text data never reaches the server.',
      'Engineered an asynchronous FastAPI backend utilizing SQLAlchemy, Redis session management, and secure HTTP-only refresh token cookies with JWT rotation.',
      'Designed distributed storage across S3 providers using rendezvous hashing, 3-way replication, and SHA-256 integrity verification with automatic rollbacks.',
      'Implemented passkey authentication, credential rotation, origin verification, and Razorpay payment integration.',
    ],
  },
  {
    id: 'redis-lite',
    name: 'Redis-Lite',
    technologies: ['C', 'C++', 'Data Structures', 'Linux'],
    dates: 'August 5 – August 23, 2026',
    bullets: [
      'Engineered a high-performance, Redis-inspired in-memory key-value database in C/C++ supporting fundamental SET, GET, and DELETE operations.',
      'Designed dynamic hash-table indexing with custom collision handling and bucket management for low-latency memory lookup.',
      'Optimized raw pointer manipulations and memory allocations to eliminate memory leaks and ensure thread-safe key-value tracking.',
    ],
  },
  {
    id: 'allido',
    name: 'AllIDo',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    dates: '2026',
    bullets: [
      'Developed a localized service marketplace connecting rural communities with verified local service providers to improve access in underserved regions.',
      'Designed end-to-end service discovery, booking workflows, and responsive UI layouts tailored specifically for low-bandwidth mobile networks.',
    ],
  },
]

export const ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ieee-ssit',
    title: 'IEEE SSIT Hackathon',
    description:
      'Developed rapid technical prototypes under strict constraints in a competitive team setting at Vidya Jyothi Institute of Technology.',
  },
  {
    id: 'hack2skill',
    title: 'Hack2Skill Hackathon',
    description:
      'Collaborated on full-stack web application solutions addressing real-world technology challenges.',
  },
  {
    id: 'academic-excellence',
    title: 'Academic Excellence',
    description:
      'Maintained a high academic standing with a 9.38 SGPA at Chaitanya Deemed to be University.',
  },
]

export const ASCII_BANNER = `
  ____        _     _     _      _    _   _                               
 / ___|  __ _| |__ (_) __| |    / \\  | | | | __ _ ___ ___  __ _ _ __  
 \\___ \\ / _\` | '_ \\| |/ _\` |   / _ \\ | |_| |/ _\` / __/ __|/ _\` | '_ \\ 
  ___) | (_| | | | | | (_| |  / ___ \\|  _  | (_| \\__ \\__ \\ (_| | | | |
 |____/ \\__,_|_| |_|_|\\__,_| /_/   \\_\\_| |_|\\__,_|___/___/\\__,_|_| |_|
                                                                        
`

export const ASCII_NEOFETCH_LOGO = `
       _,met$$$$$gg.          
    ,g$$$$$$$$$$$$$$$P.       
  ,g$$P"     """Y$$.".        
 ,$$P'              \`$$$.     
',$$P       ,ggs.     \`$$b:   
\`d$$'     ,$P"'   .    $$$    
 $$P      d$'     ,    $$$P   
 $$:      $$.   -    ,d$$'    
 $$;      Y$b._   _,d$P'      
 Y$$.    \`."Y$$$$P"'          
 \`$$b      "-.__              
  \`Y$$                        
   \`Y$$.                      
     \`$$b.                    
       \`Y$$b.                 
          \`"Y$b._             
              \`"""            
`
