import { useState, useEffect, useRef } from "react";
import { sendContactMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Contact() {
  const { resumeUrl, locationText, emailText, phoneText } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    setIsSubmitting(true);

    try {
      await sendContactMessage(data);
      form.reset();
      setNotification({
        show: true,
        type: "success",
        message: "Message sent successfully!",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to send message. Please try again.";

      setNotification({
        show: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
      }, 5000);
    }
  };

  const cleanPhoneNum = (phoneText || "9548690146").replace(/[^0-9]/g, "");

  return (
    <section id="contact" className="py-20 px-[6%] bg-bg">
      <div className="contact-wrap max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
        <div>
          <div className="text-[.7rem] text-muted tracking-[2px] uppercase mb-2">
            Contact
          </div>
          <div className="contacts-title text-[clamp(1.8rem,4vw,3rem)] font-[800] leading-[1.2] mb-4">
            Have a project?
            <br />
            <span className="text-coral">Let's talk.</span>
          </div>
          <p className="text-muted text-[.9rem] leading-[1.8] max-w-[460px]">
            Open to MERN stack opportunities, internships, and collaborative web
            application work.
          </p>
          <div className="contact-links flex flex-col gap-3 mt-6">
            <a
              href={`mailto:${emailText || "amandeep954h@gmail.com"}`}
              className="c-link flex items-center gap-3 text-muted text-[.88rem] no-underline hover:text-text transition-colors duration-200"
            >
              <div className="c-icon w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] flex items-center justify-center text-coral">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              {emailText || "amandeep954h@gmail.com"}
            </a>
            <a
              href={`https://wa.me/${cleanPhoneNum}?text=Hello%20Aman%2C%20I%20visited%20your%20portfolio%20website%20and%20would%20like%20to%20hire%20you%20for%20a%20project.`}
              target="_blank"
              rel="noreferrer"
              className="c-link flex items-center gap-3 text-muted text-[.88rem] no-underline hover:text-text transition-colors duration-200"
            >
              <div className="c-icon w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] flex items-center justify-center text-coral">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              {phoneText || "+91 9548690146"}
            </a>
            <div className="c-link flex items-center gap-3 text-muted text-[.88rem]">
              <div className="c-icon w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] flex items-center justify-center text-coral">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              {locationText || "Ghaziabad, Uttar Pradesh"}
            </div>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="c-link flex items-center gap-3 text-muted text-[.88rem] no-underline hover:text-text transition-colors duration-200"
            >
              <div className="c-icon w-9 h-9 bg-card border border-[var(--border)] rounded-[8px] flex items-center justify-center text-coral">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              Download Resume
            </a>
          </div>
        </div>
        <form
          className="contact-form flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {notification.show && (
            <div
              className={`p-3 rounded-lg text-center text-[0.85rem] font-[600] transition-all duration-300 ${
                notification.type === "success"
                  ? "bg-[#2ea043]/20 border border-[#2ea043] text-[#2ea043]"
                  : "bg-[#cf2222]/20 border border-[#cf2222] text-[#cf2222]"
              }`}
            >
              {notification.message}
            </div>
          )}
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="form-input w-full rounded-lg px-4 py-3 outline-none"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="form-input w-full rounded-lg px-4 py-3 outline-none"
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            className="form-ta w-full rounded-lg px-4 py-3 outline-none h-32 resize-none"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-fill w-full bg-coral text-white rounded-[6px] px-4 py-3 text-[.9rem] font-[600] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
