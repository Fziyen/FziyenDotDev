import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { ArrowUpRight, Github, Linkedin, Send } from "lucide-react";
import { contactData } from "../data";
import { GlitchyText } from "./GlitchyText";

export const Contact = ({ animate = true }: { animate?: boolean }) => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.current || status === "sending") return;
    const service = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const template = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const key = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!service || !template || !key) {
      setError(
        "The form is currently offline. You can email me directly at lenafziyen@gmail.com.",
      );
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      await emailjs.sendForm(service, template, form.current, key);
      form.current.reset();
      setStatus("sent");
    } catch {
      setError(
        "Your message could not be sent. Please try again or email me directly.",
      );
      setStatus("error");
    }
  };
  return (
    <div className="contact-grid">
      <div className="contact-intro">
        <p className="eyebrow">06 / CONTACT</p>
        <h2>
          <GlitchyText text="Get in Touch" enabled={animate} />
        </h2>
        <p className="body-copy">
          I'm always open to new opportunities. Feel free to reach out!
        </p>
        <a className="email-link" href={contactData.socialLinks.email}>
          lenafziyen@gmail.com <ArrowUpRight size={19} />
        </a>
        <div className="social-links">
          <a
            href={contactData.socialLinks.github}
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} /> GitHub <ArrowUpRight size={13} />
          </a>
          <a
            href={contactData.socialLinks.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            <Linkedin size={17} /> LinkedIn <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <form className="contact-form glass-panel" ref={form} onSubmit={submit}>
        <span className="eyebrow">Let's Connect!</span>
        <div className="form-row">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              required
              placeholder="Your Name *"
              maxLength={100}
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email *"
            />
          </label>
        </div>
        <label>
          Your message
          <textarea
            name="message"
            required
            placeholder="Your Message *"
            rows={4}
            maxLength={5000}
          />
        </label>
        <button
          className="button button-primary"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send message"}{" "}
          <Send size={16} />
        </button>
        <p
          className={`form-status ${status === "error" ? "error" : ""}`}
          role="status"
        >
          {status === "sent"
            ? "Message received. Thank you for reaching out!"
            : status === "error"
              ? error
              : ""}
        </p>
      </form>
    </div>
  );
};
