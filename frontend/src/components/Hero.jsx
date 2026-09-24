import React from "react";
import { useAuth } from "../context/AuthContext";

function Hero() {
  const { resumeUrl, profilePhotoUrl, locationText, skillsList, isBackendConnected } = useAuth();
  const rawSkills = Array.isArray(skillsList) ? skillsList : [];

  // Filter Hero section to display ONLY Featured / Main Skills from backend DB
  const displaySkills = rawSkills.filter((sk) => {
    if (typeof sk === "object" && sk.is_featured !== undefined) {
      return Boolean(sk.is_featured);
    }
    const name = (typeof sk === "string" ? sk : sk.name).toLowerCase().trim();
    return !["html5", "css3", "bootstrap"].includes(name);
  });

  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-[6rem] px-[6%] pb-12 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-full hero-overlay pointer-events-none"></div>
      <div className="hero-wrap grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1200px] mx-auto w-full items-center relative">
        <div className="hero-text fade-up">
          <div className="text-[.75rem] text-coral font-[700] tracking-[2px] uppercase mb-3">
            MERN Stack Developer
          </div>
          <div className="hello-line text-[2.2rem] font-[700] mb-1 flex items-center gap-1">
            Hello
            <span className="dot text-coral text-[2.5rem] ml-0.5">.</span>
          </div>
          <div className="im-line text-[1rem] text-muted font-[400] mb-1 flex items-center gap-2">
            I'm Aman Deep from {locationText || "Ghaziabad, Uttar Pradesh"}
          </div>
          <h1 className="role text-[clamp(2.2rem,6vw,4.4rem)] font-[800] mb-5 leading-[1.02]">
            I build scalable web applications.
          </h1>
          <p className="text-muted text-[.95rem] leading-[1.8] max-w-[590px] mb-8">
            Dedicated Information Technology student and certified Full Stack
            Developer specializing in MongoDB, Express, React, and Node.js. I
            turn requirements into responsive full-stack systems and real-time
            web experiences.
          </p>
          <div className="hero-btns flex flex-wrap gap-3 mb-9">
            <a
              href="#projects"
              className="btn-fill bg-coral text-white px-6 py-2 rounded-[6px] font-[600] text-[.85rem] transition-all duration-300 hover:bg-coral2 hover:-translate-y-0.5"
            >
              View Projects
            </a>
            <a
              href={resumeUrl || "#credentials"}
              target="_blank"
              rel="noreferrer"
              className="btn-outline border border-[var(--border)] text-text px-6 py-2 rounded-[6px] font-[600] text-[.85rem] transition-all duration-300 hover:border-coral hover:text-coral"
            >
              My Resume
            </a>
          </div>
          <div className="skills-row flex flex-wrap gap-3 text-muted text-[.78rem] font-[500] justify-start">
            {displaySkills.length === 0 ? (
              <span className="text-amber-400/80 text-[.75rem] font-mono italic bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>⚠️ Backend Offline (Connect to load live RDS skills)</span>
              </span>
            ) : (
              displaySkills.map((skill) => {
                const skillName = typeof skill === "string" ? skill : skill.name;
                return (
                  <span
                    key={skill.id || skillName}
                    className="skill-word inline-flex items-center rounded-full border border-[var(--border)] bg-bg3 px-3 py-2 transition-colors duration-300 hover:border-coral hover:text-coral"
                  >
                    {skillName}
                  </span>
                );
              })
            )}
          </div>
        </div>

        <div className="hero-photo fade-up delay2 flex justify-center items-center relative">
          <div className="photo-frame relative w-[330px] h-[330px]">
            <div className="circle-bg absolute inset-0 rounded-full"></div>
            <div className="circle-ring absolute inset-[-14px] rounded-full animate-spinR"></div>
            <div className="circle-ring2 absolute inset-[-26px] rounded-full animate-spinRrev"></div>
            <span className="bracket-l absolute left-[-55px] top-1/2 -translate-y-1/2 text-[5rem] font-[900] select-none">
              &lt;
            </span>
            <span className="bracket-r absolute right-[-55px] top-1/2 -translate-y-1/2 text-[5rem] font-[900] select-none">
              &gt;
            </span>
            {profilePhotoUrl ? (
              <img
                className="photo-img relative z-10 w-full h-full rounded-full object-cover object-top bg-card shadow-2xl"
                src={profilePhotoUrl}
                alt="Aman Deep"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="relative z-10 w-full h-full rounded-full bg-[#181b24] border-2 border-coral/40 flex items-center justify-center text-5xl font-black text-coral shadow-2xl select-none">
                AD
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
