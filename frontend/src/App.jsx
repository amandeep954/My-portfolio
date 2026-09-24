import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ThemeToggle from "./components/ThemeToggle";
import LoginModal from "./components/Admin/LoginModal";
import AdminDashboardModal from "./components/Admin/AdminDashboardModal";
import BackendStatusBanner from "./components/BackendStatusBanner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { fetchProjects } from "./services/api";

function AppContent() {
  const { skillsList } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsList, setProjectsList] = useState([]);
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } catch (e) {
      return "dark";
    }
  });

  const handleProjectsUpdated = async () => {
    const data = await fetchProjects();
    setProjectsList(data);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    document.body?.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("show");
        });
      },
      { threshold: 0.12 },
    );

    document
      .querySelectorAll(".fade-up")
      .forEach((el) => fadeObserver.observe(el));

    const animCount = (id, target) => {
      const el = document.getElementById(id);
      if (!el || el.dataset.done) return;
      el.dataset.done = "true";
      let n = 0;
      const step = Math.ceil(target / 38);
      const timer = setInterval(() => {
        n = Math.min(n + step, target);
        el.textContent = n;
        if (n >= target) clearInterval(timer);
      }, 36);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animCount("cnt1", projectsList.length || 5);
            animCount("cnt2", skillsList.length || 10);
            animCount("cnt3", 1);
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );

    const aboutSection = document.querySelector("#about");
    if (aboutSection) statsObserver.observe(aboutSection);

    const handleScroll = () => {
      let cur = "";
      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) cur = section.id;
      });
      navLinks.forEach((link) => {
        link.style.color =
          link.getAttribute("href") === `#${cur}` ? "var(--coral)" : "";
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      fadeObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <>
      <BackendStatusBanner />
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <Marquee />
      <About />
      <Projects projectsList={projectsList} setProjectsList={setProjectsList} />
      <Resume />
      <Contact />
      <Footer />
      <ThemeToggle theme={theme} setTheme={setTheme} />
      <LoginModal />
      <AdminDashboardModal onProjectsUpdated={handleProjectsUpdated} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
