import { Code, Database, Palette, Zap, GitBranch, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Hero Section Data
export const heroData = {
  name: "Lena",
  tagline:
    "I'm a full-stack web developer passionate about creating modern, accessible, and performant digital products. Let's build something amazing together.",
  resumeUrl:
    "https://drive.google.com/file/d/1F8646dF8Kzqd6Jv4GgntJQKTTyk0enKo/view?usp=sharing",
  phrases: [
    "Full-Stack Web Developer",
    "Software Engineer",
    "Data Protection & Privacy Enthusiast",
    "Problem Solver",
    "Tech Enthusiast",
  ],
};

// Skills Section Data
export interface SkillCategory {
  icon: LucideIcon;
  title: string;
  items: string[];
}

export const skillsData: SkillCategory[] = [
  {
    icon: Code,
    title: "Frontend Development",
    items: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
  },
  {
    icon: Database,
    title: "Backend & Database",
    items: ["Node.js", "PostgreSQL", "Supabase", "REST APIs"],
  },
  {
    icon: Palette,
    title: "Design & UI/UX",
    items: ["Figma", "Responsive Design", "Accessibility", "User Experience"],
  },
  {
    icon: GitBranch,
    title: "DevOps & Tools",
    items: ["Docker & Kubernetes", "Git", "AWS", "Azure"],
  },
  {
    icon: Zap,
    title: "Performance",
    items: ["Optimization", "SEO", "Web Vitals", "Lighthouse"],
  },
  {
    icon: Globe,
    title: "Self Hosting",
    items: ["Local LMs", "Privacy", "Encryption", "Data Protection"],
  },
];

// Projects Section Data
export interface Project {
  title: string;
  description: string;
  tech: string[];
  liveUrl: string;
  githubUrl: string;
  featured?: boolean;
  screenshotUrl?: string;
}

export const projectsData: Project[] = [
  {
    title: "CentriaEventia",
    description:
      "A full-featured University event management platform platform",
    tech: ["React", "Node.js", "MongoDB"],
    liveUrl: "#",
    githubUrl: "https://github.com/yourusername/project1",
    featured: true,
    screenshotUrl: "https://i.imgur.com/Fs9oqAD.png",
  },
  {
    title: "Fziyen.dev",
    description:
      "My Portfolio website showcasing my projects, skills, and experience.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vite"],
    liveUrl: "#",
    githubUrl: "https://github.com/Fziyen/fziyenDotDev",
    featured: true,
    screenshotUrl:
      "https://i.imgur.com/c5TMh8h.jpeg",
  },
  {
    title: "AlgoVision",
    description:
      "Modern Website visualizing various sorting algorithms with animations and interactive controls.",
    tech: ["React", "TypeScript", "Framer Motion"],
    liveUrl: "#",
    githubUrl: "https://github.com/yourusername/project3",
    featured: false,
    screenshotUrl:
      "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "QR Studio",
    description:
      "A web application that generates customizable QR codes for URLs, text, and other data types.",
    tech: ["React", "TypeScript", "Vite"],
    liveUrl: "#",
    githubUrl: "https://github.com/yourusername/project4",
    featured: false,
    screenshotUrl:
      "https://i.imgur.com/JAdgj9e.png",
  },
  {
    title: "FinnTrain Tracker",
    description:
      "A web application for tracking Finnish train services and schedules.",
    tech: ["Next.js", "TypeScript", "Vercel"],
    liveUrl: "#",
    githubUrl: "https://github.com/yourusername/project5",
    featured: false,
    screenshotUrl:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fthb.tildacdn.net%2Ftild3864-3132-4334-b965-633866366534%2F-%2Fresize%2F504x%2Fpointgr_InterCity_tr.png&f=1&nofb=1&ipt=528dff5307231c27fc8fc9cbdce3877fe34b39c74ab93539f63cc27013ee6936",
  },
  {
    title: "AI Signature Detector ( Coming soon...)",
    description:
      "AI-powered fraudulent Signature detector, using machine learning algorithms to identify and flag suspicious signatures.",
    tech: ["Python", "TensorFlow", "Typescript"],
    liveUrl: "#",
    githubUrl: "https://github.com/yourusername/project6",
    featured: false,
    screenshotUrl:
      "https://images.unsplash.com/photo-1589330694653-ded6df03f754?q=80&w=3032&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Certifications Section Data
export interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialUrl: string;
  iconUrl: string;
}

export const certificationsData: Certification[] = [
  {
    title: "AWS Cloud Developing",
    issuer: "Amazon Web Services",
    date: "February 2025",
    credentialUrl:
      "https://www.credly.com/badges/2d42d87d-6b51-487d-ac1f-84a8aa8e95fd/public_url",
    iconUrl:
      "https://images.credly.com/images/bb3211c0-a562-44ec-a8b5-df54deb0e5e9/blob",
  },
  {
    title: "AWS Cloud foundations",
    issuer: "Amazon Web Services",
    date: "October 2024",
    credentialUrl:
      "https://www.credly.com/badges/3aaf55a9-a31b-471c-95b9-5412c803892a/public_url",
    iconUrl:
      "https://images.credly.com/size/160x160/images/e3541a0c-dd4a-4820-8052-5001006efc85/blob",
  },
  {
    title: "Red Hat OpenShift I: Containers & Kubernetes (DO180)",
    issuer: "Red Hat",
    date: "June 2024",
    credentialUrl:
      "https://rha.ole.redhat.com/rha/api/certificates/attendance/uuid/37249495-e5c4-446b-a683-9c356a0c659c",
    iconUrl:
      "https://media.licdn.com/dms/image/v2/C4E0BAQEto-TydTTIfQ/company-logo_100_100/company-logo_100_100/0/1630583759577/red_hat_logo?e=1787788800&v=beta&t=Gx1GQZQw3o-8MFqJb5t03MToBbs8Z5U8sB5eZF6Ijrk",
  },
  {
    title: "Javascript algorithms and data structures",
    issuer: "FreeCodeCamp",
    date: "March 2022",
    credentialUrl: "#",
    iconUrl:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGLKj3JHcof0w/company-logo_100_100/company-logo_100_100/0/1630639684997/free_code_camp_logo?e=1787788800&v=beta&t=929Gk9VXDV_kI5CAVoQLkEi1895zw3sIpjRI4OiXazU",
  },
  {
    title: "Responsive Web Design",
    issuer: "FreeCodeCamp",
    date: "January 2022",
    credentialUrl: "#",
    iconUrl:
      "https://media.licdn.com/dms/image/v2/C4E0BAQGLKj3JHcof0w/company-logo_100_100/company-logo_100_100/0/1630639684997/free_code_camp_logo?e=1787788800&v=beta&t=929Gk9VXDV_kI5CAVoQLkEi1895zw3sIpjRI4OiXazU",
  },
];

// Experience & Education Section Data
export interface ExperienceItem {
  title: string;
  company: string;
  period: string;
  description: string | string[];
  logoUrl?: string;
  logoLink?: string;
  gpa?: string;
}

export interface ExperienceEducationSection {
  education: ExperienceItem[];
  work: ExperienceItem[];
}

export const experienceEducationData: ExperienceEducationSection = {
  education: [
    {
      title: "Bachelor's in Information Technology",
      company: "Centria University of Applied Sciences",
      period: "Jan 2023 -> Jun 2025",
      description:
        "Erasmus+ & Double Degree mostly focusing on cloud architecture and AI",
      logoUrl:
        "https://storage-prtl-co.imgix.net/endor/organisations/866/logos/1725442892_fileuploads_374525_3875892_183-8e58c08d6aaa0a1860f5c9e220d90f5d_centria_c_512x512.png",
      logoLink: "https://www.centria.fi",
    },
    {
      title: "Bachelor's in Computer Science",
      company: "Mundiapolis University, Engineering School",
      period: "Sep 2021 -> Jul 2024",
      description:
        "Foundation in computer science, algorithms, and software engineering.",
      logoUrl: "https://i.imgur.com/Gry43UQ.png",
      logoLink: "",
      gpa: "GPA : 16.04 / 20",
    },
  ],
  work: [
    {
      title: "Freelance Web Developer",
      company: "Working with private clients and delivering software solutions",
      period: "Jan 2022 -> Present",
      description: [
        "Designed and developed Full-stack web applications using modern frameworks like React.JS and Node.JS",
        "Collaborated with private clients to deliver tailored software solutions, meeting their unique business needs",
        "Developed custom APIs and integrated third-party services to streamline workflows and enhance functionality",
        "Provided ongoing support and updates, ensuring high client satisfaction and long-term partnerships",
      ],
      logoUrl: "",
      logoLink: "",
    },
    {
      title: "Full-Stack web developer Intern",
      company: "FSTM",
      period: "Apr 2024 -> Jul 2024",
      description: [
        "Developed a Full stack, Multi-role and user-friendly event management platform for student event search and participation",
        "Integrated a real-time participation system ensuring accurate tracking of attendees",
        "Implemented a responsive design ensuring accessibility across devices",
        "Built a robust review system enabling feedback collection and service quality improvement",
      ],
      logoUrl: "",
      logoLink: "",
    },
  ],
};

// Contact Section Data
export const contactData = {
  socialLinks: {
    github: "https://github.com/Fziyen",
    linkedin: "https://linkedin.com/in/Fziyen",
    email: "mailto:lenafziyen@gmail.com",
  },
};
