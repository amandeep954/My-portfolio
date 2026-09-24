import React from "react";
import { useAuth } from "../context/AuthContext";

function Footer() {
  const { resumeUrl, emailText } = useAuth();

  return (
    <footer className="bg-bg2 border-t border-[var(--border)] py-10 px-[6%] text-center">
      <div className="ft-name text-[1.1rem] font-[800] mb-1">
        Aman<span className="text-coral">Deep</span>
      </div>
      <div className="text-[.75rem] text-muted mb-4">
        MERN Stack Developer. All rights reserved for Aman Deep.
      </div>
      <div className="ft-socials flex justify-center gap-3 mb-3">
        <a
          href={`mailto:${emailText || "amandeep954h@gmail.com"}`}
          aria-label="Email"
          className="s-btn w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] inline-flex items-center justify-center text-coral hover:border-coral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/amandeep954"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
          className="s-btn w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] inline-flex items-center justify-center text-coral hover:border-coral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a
          href="https://github.com/amandeep954"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="s-btn w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] inline-flex items-center justify-center text-coral hover:border-coral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <a
          href={resumeUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Resume"
          className="s-btn w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] inline-flex items-center justify-center text-coral hover:border-coral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </a>
      </div>
      <div className="ft-copy text-[.75rem] text-muted">Aman Deep</div>
    </footer>
  );
}

export default Footer;
