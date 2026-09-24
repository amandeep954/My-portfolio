export const assetUrl = (path) => {
  const cleanPath = path.replace(/^\/+/, "");
  const base =
    import.meta.env.BASE_URL === "./" ? "/" : import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;

  return `${normalizedBase}${cleanPath}`;
};

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#credentials", label: "Resume" },
  { href: "#contact", label: "Contact" },
];

export const services = [
  {
    icon: "</>",
    name: "MERN Stack Web Development",
    desc: "Responsive full-stack applications with React, Node.js, Express, and MongoDB.",
  },
  {
    icon: "API",
    name: "Backend APIs & Authentication",
    desc: "CRUD systems, REST APIs, secure auth, authorization, and server-side validation.",
  },
  {
    icon: "UI",
    name: "Frontend Interfaces",
    desc: "Clean dashboards, clone UIs, and reusable component-based React screens.",
  },
];

export const education = [
  "Diploma, Information Technology - Government Polytechnic Ghaziabad - Expected 2026",
  "Class XII (Science) - Janta College, Bakewar (Etawah) - 2023",
  "Class X - Janta College, Bakewar (Etawah) - 2021",
];

export const languages = [
  "Hindi: Native / First Language",
  "English: Intermediate (B1)",
];

