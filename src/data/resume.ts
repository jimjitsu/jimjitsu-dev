export const person = {
  name: "Jim Tierney",
  title: "Technical Team Lead · Senior Interface Developer",
  email: "jimbo.c.tierney@gmail.com",
  linkedin: "https://www.linkedin.com/in/jimbo-c-tierney/",
  summary:
    "I’m looking for an opportunity to join an engineering team with hard problems to solve, plenty of things to learn, and goals to regularly work to make sites, apps, and software better and incrementally improve everything.",
};

export const skillGroups = [
  {
    label: "Frontend core",
    items: ["HTML", "CSS", "JavaScript"],
  },
  {
    label: "Frameworks",
    items: ["React", "Next.js", "Vue", "Svelte", "jQuery"],
  },
  {
    label: "Styling systems",
    items: ["Tailwind CSS", "Bootstrap", "Foundation"],
  },
  {
    label: "Tooling & workflow",
    items: ["Git", "Subversion", "Webpack", "Node / npm", "Grunt", "Gulp"],
  },
  {
    label: "Craft",
    items: ["GSAP animation", "Web performance", "Accessibility", "Design systems", "Agile / Jira"],
  },
];

export type Role = {
  company: string;
  location: string;
  range: string;
  titles: string;
  highlights: string[];
};

export const roles: Role[] = [
  {
    company: "Hanson Dodge",
    location: "Milwaukee · remote (post-COVID)",
    range: "Apr 2016 — Aug 2025",
    titles: "Senior Interface Developer → Technical Team Lead",
    highlights: [
      "Partnered with strategists on UI/UX roadmaps with mobile-first, performance, and accessibility in mind.",
      "Worked with a Sitecore MVP on headless patterns: Next.js + React vs. Gatsby, GraphQL, and alternatives.",
      "Modernized FE architecture: VS + on-server Less → Node/npm, Webpack/Gulp/Pattern Lab, SASS, ES modules, Babel, atomic design, BEM.",
      "Led the shift from Adobe to Figma with rigorous component workflows aligned to engineering.",
      "Delivered dual-brand Kentico builds from one shared frontend codebase.",
      "Led Visit Utah: custom design system with elaborate parallax and configurable page-builder-style sections.",
      "Embedded FE in agile cycles (Jira, monthly sprints); code reviews; estimates from ballpark to ticket-level.",
      "Interviewed and managed freelance FE talent; QA overflow on Sitecore, WordPress, and Kentico.",
    ],
  },
  {
    company: "Ascedia",
    location: "Milwaukee",
    range: "Aug 2010 — Apr 2016",
    titles: "Interface Developer → FE Supervisor → Technical Team Lead",
    highlights: [
      "Led a PHP/WordPress team: minimalist starters, security hardening, disciplined plugin choices.",
      "Lead FE on Sub-Zero Wolf replatform to Sitecore with responsive, progressively enhanced UI.",
      "Lead FE on Visit Wisconsin — Ascedia’s first large responsive build on a custom .NET CMS.",
      "Mentored developers; set standards for CSS architecture, preprocessors (Less/SASS), and component-based UI.",
    ],
  },
];

export const education = {
  degree: "BFA, Fine Arts",
  school: "Southern Illinois University",
  location: "Carbondale, IL",
};

export const portfolioLinks = [
  {
    name: "Case studies",
    description: "Deep dives on systems, performance, and craft — coming soon.",
    href: "#portfolio",
    status: "soon" as const,
  },
  {
    name: "GitHub",
    description: "Repos and experiments — link TBD when you publish.",
    href: "#portfolio",
    status: "placeholder" as const,
  },
  {
    name: "LinkedIn",
    description: "Experience, recommendations, and contact.",
    href: person.linkedin,
    status: "live" as const,
  },
];
