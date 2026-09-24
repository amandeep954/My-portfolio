import React from "react";
import { education, languages } from "../constants/portfolioData";
import { useAuth } from "../context/AuthContext";

function Resume() {
  const { skillsList } = useAuth();
  const activeSkills = Array.isArray(skillsList) ? skillsList : [];

  return (
    <section id="credentials" className="py-20 px-[6%] bg-bg2">
      <div className="max-w-[1200px] mx-auto">
        <div className="fade-up mb-10">
          <div className="sec-title text-[clamp(1.8rem,4vw,2.6rem)] font-[800] mb-4">
            Resume Details
          </div>
          <p className="text-muted text-[.9rem] leading-[1.8] max-w-[680px]">
            Education, certification, languages, and technical stack taken from
            the resume.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="cred-card fade-up rounded-[8px] bg-bg border border-[var(--border)] p-5">
            <div className="text-coral text-[.75rem] font-[700] uppercase tracking-[2px] mb-4">
              Education
            </div>
            <ul className="space-y-4">
              {education.map((item) => (
                <li
                  key={item}
                  className="text-muted text-[.86rem] leading-[1.7] border-b border-[var(--border)] pb-4 last:border-b-0 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="cred-card fade-up delay2 rounded-[8px] bg-bg border border-[var(--border)] p-5">
            <div className="text-coral text-[.75rem] font-[700] uppercase tracking-[2px] mb-4">
              Certification
            </div>
            <div className="text-text font-[700] mb-2">
              Delta Full Stack Web Development
            </div>
            <p className="text-muted text-[.86rem] leading-[1.75] mb-4">
              Apna College, Mentor: Shraddha Khapra. Credential ID:
              690a336685d50fdc7902d2d6.
            </p>
            <a
              href="https://mycourse.app/EB48IKvNurcuEIiXr"
              target="_blank"
              rel="noreferrer"
              className="text-coral text-[.85rem] font-[700] no-underline"
            >
              Verify credential
            </a>
          </div>
          <div className="cred-card fade-up delay3 rounded-[8px] bg-bg border border-[var(--border)] p-5">
            <div className="text-coral text-[.75rem] font-[700] uppercase tracking-[2px] mb-4">
              Skills & Languages
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {activeSkills.length === 0 ? (
                <span className="text-amber-400/80 text-[.75rem] font-mono italic bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  ⚠️ Backend Offline (Connect to load live DB skills)
                </span>
              ) : (
                activeSkills.map((sk) => {
                  const name = typeof sk === "string" ? sk : sk.name;
                  return (
                    <span
                      key={sk.id || name}
                      className="bg-bg3 border border-[var(--border)] text-muted text-[.73rem] px-2 py-1 rounded-full"
                    >
                      {name}
                    </span>
                  );
                })
              )}
            </div>
            <div className="grid gap-2">
              {languages.map((language) => (
                <div key={language} className="text-muted text-[.86rem]">
                  {language}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Resume;
