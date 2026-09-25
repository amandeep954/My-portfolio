import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { assetUrl } from "../../constants/portfolioData";
import {
  fetchProjects,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  fetchContactMessages,
  toggleMessageReadApi,
  deleteMessageApi,
  fetchSkills,
  createSkillApi,
  toggleFeaturedSkillApi,
  deleteSkillApi,
  uploadFileApi,
} from "../../services/api";

function AdminDashboardModal({ onProjectsUpdated }) {
  const {
    isAdminDashboardOpen,
    setIsAdminDashboardOpen,
    logout,
    user,
    resumeUrl,
    updateResumeUrl,
    profilePhotoUrl,
    updateProfilePhotoUrl,
    locationText,
    updateLocationText,
    emailText,
    updateEmailText,
    phoneText,
    updatePhoneText,
    refreshSkills,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("projects"); // "projects" | "messages" | "skills" | "resume" | "bio"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  // Uploading Loading States
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Data states
  const [projectsList, setProjectsList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  // Project Form state
  const [editingId, setEditingId] = useState(null);
  const [projForm, setProjForm] = useState({
    name: "",
    subtitle: "",
    tags: "",
    desc: "",
    image: "",
    liveLink: "",
    githubLink: "",
  });

  // Skill Form state
  const [skillForm, setSkillForm] = useState({
    name: "",
    category: "Frontend",
    proficiency: 85,
    is_featured: true,
  });

  // Resume & Bio Form states
  const [resumeInput, setResumeInput] = useState(resumeUrl || "");
  const [locationInput, setLocationInput] = useState(locationText || "");
  const [emailInput, setEmailInput] = useState(emailText || "");
  const [phoneInput, setPhoneInput] = useState(phoneText || "");

  useEffect(() => {
    if (isAdminDashboardOpen) {
      loadData();
    }
  }, [isAdminDashboardOpen, activeTab]);

  useEffect(() => {
    setResumeInput(resumeUrl || "");
  }, [resumeUrl]);

  useEffect(() => {
    setLocationInput(locationText || "");
  }, [locationText]);

  useEffect(() => {
    setEmailInput(emailText || "");
  }, [emailText]);

  useEffect(() => {
    setPhoneInput(phoneText || "");
  }, [phoneText]);

  const loadData = async () => {
    setLoading(true);
    setMsg({ text: "", type: "" });
    try {
      if (activeTab === "projects") {
        const projs = await fetchProjects();
        setProjectsList(projs);
      } else if (activeTab === "messages") {
        const msgs = await fetchContactMessages();
        setMessagesList(msgs);
      } else if (activeTab === "skills") {
        const sks = await fetchSkills();
        setSkillsList(sks);
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.error || "Failed to load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getPreviewImgSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
      return img;
    }
    return assetUrl(img);
  };

  if (!isAdminDashboardOpen) return null;

  // ------------ File Upload Handlers (AWS S3 Anti-Duplicate) ------------
  const handleProjectImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await uploadFileApi(file, "project", projForm.image);
      setProjForm((prev) => ({ ...prev, image: res.fileUrl }));
      setMsg({ text: "Project image uploaded to S3 successfully!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || "Image upload failed.", type: "error" });
    } finally {
      setUploadingImg(false);
    }
  };

  const handleResumePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPdf(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await uploadFileApi(file, "resume", resumeInput);
      setResumeInput(res.fileUrl);
      updateResumeUrl(res.fileUrl);
      setMsg({ text: "Resume PDF uploaded & saved to S3!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || "PDF upload failed.", type: "error" });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMsg({ text: "", type: "" });

    try {
      const res = await uploadFileApi(file, "profile", profilePhotoUrl);
      updateProfilePhotoUrl(res.fileUrl);
      setMsg({ text: "Profile Photo uploaded to S3 & updated live!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || "Profile photo upload failed.", type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ------------ Project Handlers ------------
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    try {
      const payload = {
        ...projForm,
        tags: typeof projForm.tags === "string"
          ? projForm.tags.split(",").map((t) => t.trim())
          : projForm.tags,
      };

      if (editingId) {
        await updateProjectApi(editingId, payload);
        setMsg({ text: "Project updated successfully!", type: "success" });
      } else {
        await createProjectApi(payload);
        setMsg({ text: "New project created successfully!", type: "success" });
      }

      setEditingId(null);
      setProjForm({ name: "", subtitle: "", tags: "", desc: "", image: "", liveLink: "", githubLink: "" });
      const updated = await fetchProjects();
      setProjectsList(updated);
      if (onProjectsUpdated) onProjectsUpdated();
    } catch (err) {
      setMsg({ text: err.response?.data?.error || "Failed to save project.", type: "error" });
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setProjForm({
      name: p.name || "",
      subtitle: p.subtitle || "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
      desc: p.desc || "",
      image: p.image || "",
      liveLink: p.liveLink || "",
      githubLink: p.githubLink || "",
    });
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProjectApi(id);
      setMsg({ text: "Project deleted.", type: "success" });
      const updated = await fetchProjects();
      setProjectsList(updated);
      if (onProjectsUpdated) onProjectsUpdated();
    } catch (err) {
      setMsg({ text: "Failed to delete project.", type: "error" });
    }
  };

  // ------------ Contact Messages Handlers ------------
  const handleToggleRead = async (id) => {
    try {
      await toggleMessageReadApi(id);
      const msgs = await fetchContactMessages();
      setMessagesList(msgs);
    } catch (err) {
      setMsg({ text: "Failed to update read status.", type: "error" });
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessageApi(id);
      const msgs = await fetchContactMessages();
      setMessagesList(msgs);
    } catch (err) {
      setMsg({ text: "Failed to delete message.", type: "error" });
    }
  };

  // ------------ Skill Handlers ------------
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.name.trim()) return;
    try {
      await createSkillApi(skillForm);
      setSkillForm({ name: "", category: "Frontend", proficiency: 85, is_featured: true });
      setMsg({ text: "Skill added successfully!", type: "success" });
      const sks = await fetchSkills();
      setSkillsList(sks);
      if (refreshSkills) refreshSkills();
    } catch (err) {
      setMsg({ text: "Failed to add skill.", type: "error" });
    }
  };

  const handleToggleFeaturedSkill = async (id) => {
    try {
      await toggleFeaturedSkillApi(id);
      const sks = await fetchSkills();
      setSkillsList(sks);
      if (refreshSkills) refreshSkills();
    } catch (err) {
      setMsg({ text: "Failed to toggle skill featured status.", type: "error" });
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await deleteSkillApi(id);
      setMsg({ text: "Skill deleted successfully.", type: "success" });
      const sks = await fetchSkills();
      setSkillsList(sks);
      if (refreshSkills) refreshSkills();
    } catch (err) {
      setMsg({ text: "Failed to delete skill.", type: "error" });
    }
  };

  // ------------ Resume Handler ------------
  const handleSaveResume = (e) => {
    e.preventDefault();
    if (!resumeInput.trim()) return;
    updateResumeUrl(resumeInput.trim());
    setMsg({ text: "Resume URL updated successfully!", type: "success" });
  };

  // ------------ Bio & Contact Handler ------------
  const handleSaveBioDetails = (e) => {
    e.preventDefault();
    if (emailInput.trim()) updateEmailText(emailInput.trim());
    if (phoneInput.trim()) updatePhoneText(phoneInput.trim());
    if (locationInput.trim()) updateLocationText(locationInput.trim());
    setMsg({ text: "Profile contact details (Email, Phone & Location) updated successfully!", type: "success" });
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-8 animate-fadeIn">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl sm:rounded-2xl w-full max-w-5xl h-[94vh] sm:h-[90vh] flex flex-col overflow-hidden shadow-2xl text-[var(--text)] transition-colors">
        {/* Header */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg2)] shrink-0 transition-colors">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shrink-0"></span>
            <div className="overflow-hidden">
              <h2 className="text-sm sm:text-lg font-bold truncate text-[var(--text)]">Admin Control Center</h2>
              <p className="text-[.7rem] sm:text-xs text-[var(--muted)] truncate">
                Logged in as <span className="text-coral font-semibold">{user?.username || "Admin"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={logout}
              className="text-[.7rem] sm:text-xs bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
            <button
              onClick={() => setIsAdminDashboardOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--text)] text-lg sm:text-xl font-bold px-1.5"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)] bg-[var(--bg2)] px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none transition-colors">
          <button
            onClick={() => setActiveTab("projects")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "projects"
                ? "border-coral text-coral"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            💻 Projects ({projectsList.length})
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "messages"
                ? "border-coral text-coral"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            📬 Inbox ({messagesList.length})
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "skills"
                ? "border-coral text-coral"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            ⚡ Skills
          </button>

          <button
            onClick={() => setActiveTab("resume")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "resume"
                ? "border-coral text-coral"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            📄 Resume
          </button>

          <button
            onClick={() => setActiveTab("bio")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "bio"
                ? "border-coral text-coral"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            👤 Profile & Bio
          </button>
        </div>

        {/* Notifications */}
        {msg.text && (
          <div
            className={`mx-3 sm:mx-6 mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg text-[.75rem] sm:text-xs font-semibold text-center shrink-0 ${
              msg.type === "success"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          {loading && <div className="text-center py-8 text-[var(--muted)] text-sm">Loading MySQL database data...</div>}

          {/* TAB 1: PROJECTS */}
          {!loading && activeTab === "projects" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 sm:gap-8 w-full min-w-0 overflow-hidden">
              {/* Add/Edit Form */}
              <div className="bg-[var(--bg2)] p-3.5 sm:p-5 rounded-xl border border-[var(--border)] w-full min-w-0 overflow-hidden">
                <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider mb-3 sm:mb-4">
                  {editingId ? "✏️ Edit Project" : "➕ Add New Project"}
                </h3>
                <form onSubmit={handleSaveProject} className="flex flex-col gap-2.5 sm:gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Project Name *"
                    value={projForm.name}
                    onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subtitle (e.g. MERN Fullstack App)"
                    value={projForm.subtitle}
                    onChange={(e) => setProjForm({ ...projForm, subtitle: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated: React, Node.js, MySQL)"
                    value={projForm.tags}
                    onChange={(e) => setProjForm({ ...projForm, tags: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] text-xs"
                  />
                  <textarea
                    placeholder="Description *"
                    value={projForm.desc}
                    onChange={(e) => setProjForm({ ...projForm, desc: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] h-20 sm:h-24 resize-none text-xs"
                    required
                  />

                  {/* S3 Image File Upload Input */}
                  <div className="border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-3.5 rounded-lg flex flex-col gap-2 w-full min-w-0 overflow-hidden">
                    <label className="text-[.7rem] sm:text-[.75rem] font-bold text-coral uppercase tracking-wider">
                      ☁️ Upload Project Image to AWS S3
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProjectImageUpload}
                      disabled={uploadingImg}
                      className="text-[.75rem] text-[var(--muted)] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[.7rem] file:font-semibold file:bg-coral file:text-white hover:file:bg-coral2 cursor-pointer w-full min-w-0"
                    />
                    {uploadingImg && (
                      <span className="text-[.7rem] text-amber-400 font-semibold animate-pulse">
                        ⏳ Uploading image file to AWS S3 bucket...
                      </span>
                    )}

                    {projForm.image && (
                      <div className="mt-1 p-2 sm:p-2.5 bg-[var(--bg2)] border border-coral/30 rounded-lg flex items-center gap-2.5 w-full min-w-0 overflow-hidden">
                        <img
                          src={getPreviewImgSrc(projForm.image)}
                          alt="Uploaded Preview"
                          className="w-14 h-10 sm:w-16 sm:h-12 object-cover rounded border border-coral/40 shrink-0 bg-black/40"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="flex-1 min-w-0 overflow-hidden text-[.7rem]">
                          <span className="text-emerald-400 font-bold block truncate">
                            ✓ Image Uploaded
                          </span>
                        </div>
                      </div>
                    )}

                    <input type="hidden" value={projForm.image} />
                  </div>

                  <input
                    type="text"
                    placeholder="Live Link URL"
                    value={projForm.liveLink}
                    onChange={(e) => setProjForm({ ...projForm, liveLink: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] w-full min-w-0 font-mono text-[.75rem] truncate"
                  />
                  <input
                    type="text"
                    placeholder="GitHub Repo URL"
                    value={projForm.githubLink}
                    onChange={(e) => setProjForm({ ...projForm, githubLink: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] w-full min-w-0 font-mono text-[.75rem] truncate"
                  />

                  <div className="flex gap-2 mt-1">
                    <button
                      type="submit"
                      disabled={uploadingImg}
                      className="flex-1 bg-coral hover:bg-coral2 text-white font-semibold py-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                    >
                      {editingId ? "Update Project" : "Save Project"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setProjForm({ name: "", subtitle: "", tags: "", desc: "", image: "", liveLink: "", githubLink: "" });
                        }}
                        className="bg-[var(--bg3)] text-[var(--text)] hover:bg-[var(--border)] font-semibold px-3 py-2 rounded-lg text-xs transition-colors border border-[var(--border)]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Projects List */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Existing Projects in MySQL</h3>
                {projectsList.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">No projects found.</p>
                ) : (
                  projectsList.map((p) => (
                    <div
                      key={p.id || p.name}
                      className="bg-[var(--bg2)] p-3 sm:p-4 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-coral/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={getPreviewImgSrc(p.image)}
                          alt={p.name}
                          className="w-12 h-10 object-cover rounded border border-[var(--border)] shrink-0 bg-black/40"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="text-xs font-bold text-[var(--text)] truncate">
                            {p.name}
                          </div>
                          <p className="text-[.75rem] text-[var(--muted)] truncate">{p.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-[.75rem] bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white px-2.5 py-1 rounded transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="text-[.75rem] bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTACT MESSAGES */}
          {!loading && activeTab === "messages" && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider mb-2">Inquiries & Leads Inbox</h3>
              {messagesList.length === 0 ? (
                <div className="text-center py-10 text-[var(--muted)] text-xs bg-[var(--bg2)] rounded-xl border border-[var(--border)]">
                  No messages received yet.
                </div>
              ) : (
                messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-[var(--bg2)] p-3.5 sm:p-4 rounded-xl border transition-all ${
                      msg.is_read ? "border-[var(--border)] opacity-80" : "border-coral shadow-lg"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                      <div className="flex flex-wrap items-center gap-2 overflow-hidden">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${msg.is_read ? "bg-gray-500" : "bg-coral animate-ping"}`}></span>
                        <span className="font-bold text-xs sm:text-sm text-[var(--text)] truncate">{msg.name}</span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-[.75rem] text-coral hover:underline font-mono truncate"
                        >
                          &lt;{msg.email}&gt;
                        </a>
                      </div>
                      <span className="text-[.68rem] sm:text-[.7rem] text-[var(--muted)] self-end sm:self-auto">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text)] bg-[var(--bg)] p-2.5 sm:p-3 rounded-lg border border-[var(--border)] my-2 leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-end gap-2 sm:gap-3 text-xs mt-2.5">
                      <button
                        onClick={() => handleToggleRead(msg.id)}
                        className={`px-2.5 py-1 rounded text-[.75rem] font-medium transition-colors ${
                          msg.is_read
                            ? "bg-[var(--bg3)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"
                            : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                        }`}
                      >
                        {msg.is_read ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded text-[.75rem] transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SKILLS MANAGER */}
          {!loading && activeTab === "skills" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Add Skill Form */}
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-[var(--border)]">
                <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider mb-3">➕ Add New Skill</h3>
                <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 text-xs">
                  <input
                    type="text"
                    placeholder="Skill Name (e.g. Docker, CI/CD, AWS, React)"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] flex-1 min-w-[160px] text-xs"
                    required
                  />
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                    className="bg-[var(--bg)] border border-[var(--border)] p-2 sm:p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] text-xs"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Cloud/DevOps">Cloud/DevOps</option>
                    <option value="Tools">Tools</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer bg-[var(--bg)] border border-[var(--border)] px-3 py-2 rounded-lg text-coral font-semibold text-xs justify-center sm:justify-start">
                    <input
                      type="checkbox"
                      checked={skillForm.is_featured}
                      onChange={(e) => setSkillForm({ ...skillForm, is_featured: e.target.checked })}
                      className="accent-coral cursor-pointer"
                    />
                    <span>⭐ Main Skill (Hero Section)</span>
                  </label>
                  <button
                    type="submit"
                    className="bg-coral hover:bg-coral2 text-white font-semibold px-4 py-2 sm:py-2.5 rounded-lg text-xs transition-colors"
                  >
                    Add Skill
                  </button>
                </form>
              </div>

              {/* Section 1: Featured / Main Skills (Hero Section) */}
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-coral/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-2 gap-1">
                  <h3 className="text-[.75rem] sm:text-xs font-bold text-coral uppercase tracking-wider flex items-center gap-2">
                    <span>⭐ Hero Main Skills (Top Skills)</span>
                  </h3>
                  <span className="text-[.68rem] text-[var(--muted)] font-mono">
                    Shown in Hero Section pill list
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsList.filter((sk) => typeof sk === "object" && Boolean(sk.is_featured)).length === 0 ? (
                    <span className="text-xs text-[var(--muted)]">No skills marked as main/featured yet. Click "☆ Normal" below to feature a skill.</span>
                  ) : (
                    skillsList
                      .filter((sk) => typeof sk === "object" && Boolean(sk.is_featured))
                      .map((sk) => {
                        const skillName = typeof sk === "string" ? sk : sk.name;
                        const skillId = typeof sk === "object" ? sk.id : null;
                        return (
                          <span
                            key={`feat-${skillId || skillName}`}
                            className="bg-[var(--bg)] border border-coral/50 text-[var(--text)] text-[.75rem] px-2.5 py-1 rounded-full flex items-center gap-1.5"
                          >
                            <span className="text-coral font-bold">⭐ {skillName}</span>
                            {skillId && (
                              <button
                                type="button"
                                onClick={() => handleToggleFeaturedSkill(skillId)}
                                title="Unstar from Hero section"
                                className="text-[var(--muted)] hover:text-coral font-bold ml-0.5 text-[.75rem]"
                              >
                                ☆
                              </button>
                            )}
                            {skillId && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSkill(skillId)}
                                title="Delete Skill"
                                className="text-[var(--muted)] hover:text-red-400 font-bold ml-0.5"
                              >
                                ✕
                              </button>
                            )}
                          </span>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Section 2: All Skills List */}
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-[var(--border)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-2 gap-1">
                  <h3 className="text-[.75rem] sm:text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                    📚 All Portfolio Skills ({skillsList.length})
                  </h3>
                  <span className="text-[.68rem] text-[var(--muted)] font-mono">
                    Shown across full portfolio & marquee
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsList.map((sk) => {
                    const skillName = typeof sk === "string" ? sk : sk.name;
                    const skillId = typeof sk === "object" ? sk.id : null;
                    const isFeat = typeof sk === "object" ? Boolean(sk.is_featured) : true;
                    return (
                      <span
                        key={`all-${skillId || skillName}`}
                        className={`border text-[var(--text)] text-[.75rem] px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
                          isFeat ? "bg-[var(--bg)] border-coral/40" : "bg-[var(--bg)] border-[var(--border)] opacity-80"
                        }`}
                      >
                        <span>{skillName}</span>
                        {skillId && (
                          <button
                            type="button"
                            onClick={() => handleToggleFeaturedSkill(skillId)}
                            title={isFeat ? "Unstar from Hero section" : "Star to Hero section"}
                            className="text-xs hover:scale-125 transition-transform"
                          >
                            {isFeat ? "⭐" : "☆"}
                          </button>
                        )}
                        {skillId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skillId)}
                            title="Delete Skill"
                            className="text-[var(--muted)] hover:text-red-400 font-bold ml-0.5"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESUME MANAGER */}
          {!loading && activeTab === "resume" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4 sm:gap-6 items-start">
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-[var(--border)]">
                <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider mb-2">📄 Update Resume PDF (AWS S3)</h3>
                <p className="text-xs text-[var(--muted)] mb-3 sm:mb-4 leading-relaxed">
                  Upload your Resume PDF file directly to AWS S3 bucket.
                </p>

                {/* S3 PDF Upload Input */}
                <div className="border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-4 rounded-lg flex flex-col gap-2.5 mb-2 w-full min-w-0 overflow-hidden">
                  <label className="text-[.7rem] sm:text-[.75rem] font-bold text-coral uppercase tracking-wider">
                    ☁️ Upload Resume PDF File to S3
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumePdfUpload}
                    disabled={uploadingPdf}
                    className="text-[.75rem] text-[var(--muted)] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[.7rem] file:font-semibold file:bg-coral file:text-white hover:file:bg-coral2 cursor-pointer w-full min-w-0"
                  />
                  {uploadingPdf && (
                    <span className="text-[.7rem] text-amber-400 font-semibold animate-pulse">
                      ⏳ Uploading Resume PDF to AWS S3 bucket...
                    </span>
                  )}

                  {resumeInput && (
                    <div className="text-[.75rem] text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
                      <span>✓ Active Resume PDF Uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live PDF Resume Preview inside Admin Dashboard */}
              {resumeInput && (
                <div className="bg-[var(--bg2)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[.75rem] font-semibold text-coral uppercase tracking-wider">
                    <span>📄 Live Resume Document Preview</span>
                    <a
                      href={resumeInput}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-coral hover:underline font-mono"
                    >
                      Open Full Screen ↗
                    </a>
                  </div>

                  <div className="w-full h-[300px] sm:h-[450px] rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
                    <iframe
                      src={`${resumeInput}#toolbar=0`}
                      title="Admin Resume PDF Preview"
                      className="w-full h-full border-none rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE PHOTO & LOCATION MANAGER */}
          {!loading && activeTab === "bio" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-start">
              {/* Profile Photo Uploader */}
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-[var(--border)] space-y-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider">
                  🖼️ Profile Photo Manager (AWS S3)
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Upload a new profile photo file to AWS S3. It will update the main Hero avatar in real time.
                </p>

                <div className="flex items-center gap-3.5 bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-coral shrink-0 bg-black/40">
                    <img
                      src={getPreviewImgSrc(profilePhotoUrl)}
                      alt="Current Profile Photo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    <span className="text-xs font-bold text-[var(--text)] block truncate">Current Profile Avatar</span>
                    <span className="text-[.7rem] sm:text-[.75rem] text-emerald-400 font-semibold block truncate">
                      ✓ Profile Photo Active
                    </span>
                  </div>
                </div>

                <div className="border border-[var(--border)] bg-[var(--bg)] p-3 sm:p-3.5 rounded-lg flex flex-col gap-2">
                  <label className="text-[.7rem] sm:text-[.75rem] font-bold text-coral uppercase tracking-wider">
                    ☁️ Upload New Profile Photo to S3
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    disabled={uploadingAvatar}
                    className="text-[.75rem] text-[var(--muted)] file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[.7rem] file:font-semibold file:bg-coral file:text-white hover:file:bg-coral2 cursor-pointer w-full min-w-0"
                  />
                  {uploadingAvatar && (
                    <span className="text-[.7rem] text-amber-400 font-semibold animate-pulse">
                      ⏳ Uploading profile photo to AWS S3 bucket...
                    </span>
                  )}
                </div>
              </div>

              {/* Contact & Location Details Manager */}
              <div className="bg-[var(--bg2)] p-4 sm:p-5 rounded-xl border border-[var(--border)] space-y-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-coral uppercase tracking-wider">
                  📍 Contact & Location Details
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  Update your contact email, phone number, and location text across the entire portfolio website.
                </p>

                <form onSubmit={handleSaveBioDetails} className="flex flex-col gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Email Address:</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="e.g. amandeep954h@gmail.com"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] font-medium text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Phone / WhatsApp Number:</label>
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +91 9548690146"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] font-medium text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[var(--muted)]">Location Text:</label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g. Ghaziabad, Uttar Pradesh"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] p-2.5 rounded-lg outline-none focus:border-coral text-[var(--text)] font-medium text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-coral hover:bg-coral2 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors mt-1"
                  >
                    Save Contact & Location Details
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardModal;
