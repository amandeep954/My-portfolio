import React, { useState, useEffect } from "react";
import { fetchProjects } from "../services/api";
import { assetUrl } from "../constants/portfolioData";

function Projects({ projectsList, setProjectsList }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjectsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (setProjectsList) setProjectsList(data);
    } catch (err) {
      console.error("Error loading projects from DB:", err);
      setError("Backend server is offline or unreachable. Please start the Node.js backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectsList && projectsList.length > 0) {
      setProjects(projectsList);
      setLoading(false);
    } else {
      loadProjectsData();
    }
  }, [projectsList]);

  const getImgSrc = (img) => {
    if (!img) return "https://placehold.co/600x350/181b24/e6e6e6?text=Project+Preview";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
      return img;
    }
    return assetUrl(img);
  };

  return (
    <section id="projects" className="py-20 px-[6%] bg-bg">
      <div className="projects-wrap max-w-[1200px] mx-auto">
        <div className="proj-header fade-up show text-center mb-12">
          <div className="sec-title text-[clamp(1.8rem,4vw,2.6rem)] font-[800] mb-4">
            Projects
          </div>
          <p className="text-muted text-[.9rem] max-w-[560px] mx-auto leading-[1.7]">
            Full-stack builds and interface clones focused on practical MERN
            workflows, real-time communication, and clean React UI.
          </p>
          <div className="proj-divider mx-auto mt-5 w-[3px] h-10 bg-coral rounded"></div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted text-sm">Loading projects from AWS RDS database...</div>
        ) : error ? (
          <div className="text-center py-12 px-6 bg-[#181b24] border border-amber-500/30 rounded-2xl max-w-lg mx-auto space-y-3 shadow-xl">
            <div className="text-3xl">📡</div>
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Backend Server Offline</h4>
            <p className="text-xs text-muted leading-relaxed">
              Live projects from AWS RDS MySQL database cannot be loaded because the Node.js backend is unreachable on port 5000.
            </p>
            <div className="pt-2">
              <button
                onClick={loadProjectsData}
                className="bg-coral hover:bg-coral2 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              >
                Retry Connecting 🔄
              </button>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm bg-[#181b24] rounded-2xl border border-[var(--border)] max-w-lg mx-auto p-6">
            No projects found in database. Add projects via Admin Dashboard.
          </div>
        ) : (
          <div className="projects-list flex flex-col gap-16">
            {projects.map((project, index) => {
              const tagsArray = Array.isArray(project.tags)
                ? project.tags
                : typeof project.tags === "string"
                ? project.tags.split(",").map((t) => t.trim())
                : [];

              return (
                <div
                  key={project.id || project.name || index}
                  className={`proj-row fade-up show grid lg:grid-cols-[.92fr_1.08fr] gap-12 items-center ${
                    index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                  }`}
                >
                  <div className="proj-info">
                    <div>
                      <div className="text-[.72rem] uppercase tracking-[2px] text-coral font-[700] mb-2">
                        {project.subtitle}
                      </div>
                      <div className="proj-name text-[1.45rem] font-[800] mb-3">
                        {project.name}
                      </div>
                    </div>

                    <div className="proj-tags2 flex flex-wrap gap-2 mb-4">
                      {tagsArray.map((tag) => (
                        <span
                          key={tag}
                          className="ptag bg-bg3 border border-[var(--border)] text-muted text-[.73rem] px-2 py-1 rounded-full transition-colors duration-300 hover:border-coral hover:text-coral"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="proj-desc text-muted text-[.9rem] leading-[1.8] mb-6">
                      {project.desc}
                    </p>

                    <div className="proj-btns flex items-center gap-6 mt-2">
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-coral text-white px-6 py-2.5 rounded-[4px] text-[.85rem] font-[600] transition-all duration-300 hover:bg-coral2 hover:-translate-y-0.5 no-underline block"
                        >
                          View Github
                        </a>
                      )}
                      {project.liveLink && (
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text hover:text-coral text-[.88rem] font-[600] transition-colors duration-200 flex items-center gap-1 border-b border-coral pb-0.5 no-underline"
                        >
                          View project <span className="text-[.95rem] leading-none">↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    className={`proj-screen rounded-[8px] overflow-hidden border border-[var(--border)] bg-card transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,.4)] hover:-translate-y-1 hover:shadow-heavy ${
                      index % 2 === 1 ? "lg:order-first" : ""
                    }`}
                  >
                    <img
                      src={getImgSrc(project.image)}
                      alt={`${project.name} preview`}
                      className="w-full h-auto object-contain max-h-[350px] mx-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/600x350/181b24/e6e6e6?text=" + encodeURIComponent(project.name);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Projects;
