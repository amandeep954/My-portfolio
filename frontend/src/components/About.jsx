import React from "react";
import { services } from "../constants/portfolioData";

function About() {
  return (
    <section id="about" className="py-20 px-[6%] bg-bg2">
      <div className="about-grid grid gap-16 lg:grid-cols-[.95fr_1.05fr] max-w-[1200px] mx-auto items-start">
        <div className="fade-up">
          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="svc-item flex gap-4 p-4 border border-[var(--border)] bg-bg rounded-[8px] transition-all duration-300 hover:border-coral hover:-translate-y-1"
              >
                <div className="svc-icon w-12 h-12 shrink-0 bg-bg3 border border-[var(--border)] rounded-[8px] flex items-center justify-center text-[.78rem] font-[800] text-coral">
                  {service.icon}
                </div>
                <div>
                  <div className="svc-name text-[.95rem] font-[700] mb-1">
                    {service.name}
                  </div>
                  <p className="text-muted text-[.82rem] leading-[1.7]">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fade-up delay2">
          <div className="sec-title text-[clamp(1.8rem,4vw,2.6rem)] font-[800] mb-6 leading-[1.1]">
            About me
          </div>
          <p className="about-p text-muted text-[.92rem] leading-[1.85] mb-4">
            I am an Information Technology diploma student and Apna College
            certified Full Stack Developer. My focus is building practical
            MERN stack products, including full-stack listing systems,
            real-time video calling, and React dashboard interfaces.
          </p>
          <p className="about-p text-muted text-[.92rem] leading-[1.85] mb-4">
            I enjoy translating complex requirements into scalable web
            applications, writing clear backend flows, and shaping interfaces
            that stay responsive and easy to use.
          </p>
          <div className="stats-row flex flex-wrap gap-10 mt-6">
            <div>
              <div className="stat-num text-[2rem] font-[800]">
                <span id="cnt1">0</span>
                <span className="plus text-coral">+</span>
              </div>
              <div className="stat-lbl text-[.72rem] text-muted mt-1">
                Resume Projects
              </div>
            </div>
            <div>
              <div className="stat-num text-[2rem] font-[800]">
                <span id="cnt2">0</span>
                <span className="plus text-coral">+</span>
              </div>
              <div className="stat-lbl text-[.72rem] text-muted mt-1">
                Core Skills
              </div>
            </div>
            <div>
              <div className="stat-num text-[2rem] font-[800]">
                <span id="cnt3">0</span>
                <span className="plus text-coral">+</span>
              </div>
              <div className="stat-lbl text-[.72rem] text-muted mt-1">
                Certification
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
