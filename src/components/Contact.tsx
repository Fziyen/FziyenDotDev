import { useState } from 'react';
import { Github, Linkedin, Send } from 'lucide-react';
import { contactData } from '../data';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 px-6 bg-neutral-white dark:bg-neutral-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-neutral-black dark:text-neutral-white
                       animate-slideIn">
          Get in Touch
        </h2>

        <div className="grid lg:grid-cols-3 gap-0 overflow-hidden" style={{
          animation: 'slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards',
          opacity: 0,
        }}>
          <div className="lg:col-span-1 px-6 py-10 bg-neutral-lightGray dark:bg-neutral-darkGray
                        flex flex-col justify-center items-center text-center
                        border-2 border-neutral-black dark:border-neutral-gray
                        border-b-0 lg:border-b-2 lg:border-r-0">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-black dark:text-neutral-white mb-3">
              Let's Connect !
            </h3>
            <p className="text-neutral-black/70 dark:text-neutral-lightGray text-sm mb-8 leading-relaxed">
              I'm always to new opportunities. Feel free to reach out!
            </p>
            <div className="flex gap-5 justify-center">
              <a
                href={contactData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-black/70 dark:text-neutral-lightGray hover:text-primary-pink transition-colors hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href={contactData.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-black/70 dark:text-neutral-lightGray hover:text-primary-pink transition-colors hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="flex flex-col md:flex-row gap-0">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="flex-1 px-6 py-4 bg-neutral-white dark:bg-neutral-darkGray
                           text-neutral-black dark:text-neutral-white
                           border-2 border-neutral-black dark:border-neutral-gray
                           placeholder-neutral-gray dark:placeholder-neutral-lightGray
                           focus:outline-none focus:border-primary-pink transition-colors
                           md:border-r-0"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="flex-1 px-6 py-4 bg-neutral-white dark:bg-neutral-darkGray
                           text-neutral-black dark:text-neutral-white
                           border-2 border-neutral-black dark:border-neutral-gray
                           border-t-0 md:border-t-2 placeholder-neutral-gray dark:placeholder-neutral-lightGray
                           focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>

              <textarea
                name="message"
                placeholder="Your Message *"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-6 py-4 bg-neutral-white dark:bg-neutral-darkGray
                         text-neutral-black dark:text-neutral-white
                         border-2 border-neutral-black dark:border-neutral-gray
                         border-t-0 placeholder-neutral-gray dark:placeholder-neutral-lightGray
                         focus:outline-none focus:border-primary-pink transition-colors resize-none"
              />

              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-pink to-primary-purple
                         text-white font-bold text-lg border-2 border-neutral-black dark:border-neutral-gray
                         border-t-0 hover:shadow-lg dark:hover:shadow-primary-pink/20
                         transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>

            {submitted && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 text-green-800 dark:text-green-100 text-center">
                Thank you! Your message has been received.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
