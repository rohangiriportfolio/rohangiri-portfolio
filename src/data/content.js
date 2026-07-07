// ──────────────────────────────────────────────────────────────
// All editable site content lives here.
// ──────────────────────────────────────────────────────────────

export const profile = {
  name: 'Rohan Giri',
  typingWords: ['Rohan Giri.', 'a Technical Enthusiast.', 'a Developer.'],
  location: 'Narayan Chak, Purba Medinipur, W.B.',
  photo: '/profile.jpg',

  // ── Hexagon bio display (3 lines each: [narrow, wide, narrow]) ──
  // Lines are deliberately SHORT so each fits on ONE visual row,
  // creating the hexagon shape: narrow top — wide middle — narrow bottom.
  bioSlidesDesktop: [
    [
      'Originally From Narayan Chak, West Bengal, India',
      'Completed My Academic Foundation at Poura Pathabhaban School',
      'Achieved Secondary 89%  ·  Higher Secondary 87%',
    ],
    [
      'A Great Journey Built on Curiosity and Learning ✦',
      'Completed B.Tech in CSE at HIT Haldia · Achieved 9.11 CGPA',
      'Eager to learn & grasp new skills and technology',
    ],
    [
      'Passionate about Full-Stack Software Development',
      'Building Intelligent Full-Stack, AI, RPA & Software Products',
      'Open to Great Opportunities · Drawing Enthusiast ♥',
    ],
  ],
  bioSlidesMobile: [
    [
      'Originally From',
      'Narayan Chak, West Bengal',
      'School Education',
    ],
    [
      'Poura Pathabhaban',
      'Secondary 89% · H.S. 87%',
      'Academic Excellence',
    ],
    [
      'Curiosity & Growth ✦',
      'Completed B.Tech CSE at HIT',
      'Haldia · CGPA 9.11',
    ],
    [
      'Technology Lover',
      'Eager to learn Modern Skill',
      'AI · RPA · Web-Dev',
    ],
    [
      'Software Developer',
      'Deliver Full-Stack Solution',
      'Open to Great Roles ♥',
    ],
  ],

  // ── Full bio paragraphs used by the terminal 'about' command ──
  bioFull: [
    "I'm from Narayan Chak, Purba Medinipur, West Bengal. I completed my Secondary Examination with 87% marks and my Higher Secondary Examination with 93% marks from Poura Pathabhaban School.",
    "I am a student at Haldia Institute of Technology, Haldia, pursuing a B.Tech. degree in Computer Science and Engineering. I have coding skills in C, C++, Java, Python, and JavaScript.",
    "I have gained intermediate knowledge of the MERN Stack and App Development. My goal is to become a professional developer and secure a well-paying job. In my free time, I enjoy drawing and crafting.",
  ],

  socials: {
    github:    'https://github.com/rohangiriportfolio',
    linkedin:  'https://www.linkedin.com/in/rohan-giri-264a44302',
    twitter:   'https://x.com/Rohan_Giri_2004',
    instagram: 'https://www.instagram.com/1nsta_rohan',
  },
  cvLink: '#',
  email:  'rohangiri1884@gmail.com',
};

export const skillGroups = [
  {
    id: 'languages', label: 'Languages', tag: '01',
    skills: [
      { name: 'C',          icon: 'SiC',          lib: 'si', color: '#A8B9CC' },
      { name: 'C++',        icon: 'SiCplusplus',  lib: 'si', color: '#00599C' },
      { name: 'Java',       icon: 'DiJava',        lib: 'di', color: '#f89820' },
      { name: 'Python',     icon: 'SiPython',      lib: 'si', color: '#3776AB' },
      { name: 'JavaScript', icon: 'SiJavascript',  lib: 'si', color: '#F7DF1E' },
    ],
  },
  {
    id: 'web', label: 'MERN / Web Stack', tag: '02',
    skills: [
      { name: 'MongoDB',    image: '/logos/mongodb.svg' },
      { name: 'Express.js', icon: 'SiExpress',   lib: 'si', color: '#888888' },
      { name: 'React.js',   icon: 'SiReact',     lib: 'si', color: '#61DAFB' },
      { name: 'Node.js',    icon: 'SiNodedotjs', lib: 'si', color: '#339933' },
      { name: 'EJS',        icon: 'SiEjs',       lib: 'si', color: '#B4CA65' },
      { name: 'Bootstrap',  icon: 'SiBootstrap', lib: 'si', color: '#7952B3' },
    ],
  },
  {
    id: 'app', label: 'App Development', tag: '03',
    skills: [
      { name: 'Android',    icon: 'SiAndroid',    lib: 'si', color: '#3DDC84' },
      { name: 'TensorFlow', icon: 'SiTensorflow', lib: 'si', color: '#FF6F00' },
      { name: 'OpenCV',     icon: 'SiOpencv',     lib: 'si', color: '#5C3EE8' },
    ],
  },
  {
    id: 'tools', label: 'Frameworks & Tools', tag: '04',
    skills: [
      { name: 'Django',   icon: 'SiDjango',   lib: 'si', color: '#0a4b28' },
      { name: 'Flask',    icon: 'SiFlask',    lib: 'si', color: '#888888' },
      { name: 'Git',      icon: 'SiGit',      lib: 'si', color: '#F05032' },
      { name: 'GitHub',   icon: 'SiGithub',   lib: 'si', color: '#e0e0e0' },
      { name: 'Azure AI', image: '/logos/azure-ai.svg' },
    ],
  },
  {
    id: 'rpa', label: 'RPA & Automation', tag: '05',
    skills: [
      { name: 'Power Automate Desktop', image: '/logos/power-automate.svg' },
      { name: 'Automation Anywhere',    image: '/logos/automation-anywhere.svg' },
      { name: 'UiPath',                 image: '/logos/uipath.svg' },
      { name: 'Blue Prism',             image: '/logos/blue-prism.svg' },
    ],
  },
];

export const projects = [
  {
    id: 'annatra',
    title: 'Annatra',
    subtitle: 'Group Ordering & Vendor Management Platform',
    description: 'Full-stack web app that simplifies group food ordering — multiple users collaborate on a single order. Includes vendor management, dynamic cart sync, secure auth, real-time updates and dashboards.',
    stack: ['MERN Stack', 'EJS', 'Bootstrap', 'MongoDB', 'Express.js', 'Node.js'],
    codeLink: 'https://github.com/rohangiriportfolio/Annatra', liveLink: '#',
  },
  {
    id: 'cropdr',
    title: 'CropDR',
    subtitle: 'AI-Powered Crop Disease Detection App',
    description: 'Android app identifying crop diseases from leaf images via TensorFlow Lite on-device inference. Provides predictions, confidence scores and treatment recommendations for farmers.',
    stack: ['Android (Java)', 'TensorFlow Lite', 'OpenCV', 'Firebase'],
    codeLink: 'https://github.com/rohangiriportfolio/CropDr-V2.0', liveLink: '#',
  },
  {
    id: 'weather-forecast',
    title: 'Weather Forecast',
    subtitle: 'Climate Trend Analysis & Forecasting',
    description: 'Web app analysing historical climate data via Open-Meteo API and predicting future conditions using Facebook Prophet, with interactive trend visualisations.',
    stack: ['Django', 'Python', 'Prophet', 'Open-Meteo API', 'JavaScript'],
    codeLink: 'https://github.com/rohangiriportfolio/Django-Weather-App', liveLink: '#',
  },
  {
    id: 'nexahr',
    title: 'NexaHR',
    subtitle: 'Employee Onboarding Management System',
    description: 'Comprehensive onboarding platform — manage employee details, verify documents, assign tasks and track progress through a role-based access dashboard.',
    stack: ['MERN Stack', 'React.js', 'Node.js', 'Express.js', 'MongoDB'],
    codeLink: 'https://github.com/rohangiriportfolio/NexaHR#', liveLink: '#',
  },
  {
    id: 'sentimentscope',
    title: 'SentimentScope',
    subtitle: 'YouTube Comment Analyzer',
    description: 'Web app analysing YouTube comment sentiment using Azure AI Language and the YouTube Data API — classifies comments as positive, negative or neutral with interactive visualisations.',
    stack: ['Python', 'Flask', 'Azure AI Language', 'YouTube Data API'],
    codeLink: '#', liveLink: '#',
  },
];

export const testimonials = [
  {
    quote: 'Rohan is a highly motivated developer who delivers clean, thoughtful solutions. His work on our group ordering platform was impressive — he handled both backend and frontend with ease.',
    name: 'Prof. Amit Roy', role: 'Faculty Advisor, HIT', initial: 'A',
  },
  {
    quote: 'Working with Rohan on CropDR was a great experience. He picked up TensorFlow Lite quickly and built a solid offline inference pipeline that worked seamlessly on device.',
    name: 'Sourav Mondal', role: 'Project Teammate, HIT', initial: 'S',
  },
  {
    quote: "Rohan's attention to design and UX is rare among developers. The NexaHR dashboard he built was intuitive and well-structured. Looking forward to collaborating again.",
    name: 'Priya Das', role: 'HR Tech Hackathon Collaborator', initial: 'P',
  },
];

export const terminalHelp = [
  { cmd: 'help',      desc: 'list all available commands' },
  { cmd: 'whoami',    desc: 'who is Rohan?' },
  { cmd: 'about',     desc: 'a short bio' },
  { cmd: 'education', desc: 'academic background' },
  { cmd: 'skills',    desc: 'technical skill set' },
  { cmd: 'projects',  desc: 'things I have built' },
  { cmd: 'contact',   desc: 'how to reach me' },
  { cmd: 'sudo',      desc: '???' },
  { cmd: 'clear',     desc: 'clear the terminal' },
];

export const navLinks = [
  { id: 'home',         label: 'Home' },
  { id: 'skills',       label: 'Skills' },
  { id: 'creation',     label: 'Creation' },
  { id: 'terminal',     label: 'Terminal' },
  { id: 'testimonials', label: 'Testimonials' },
];
