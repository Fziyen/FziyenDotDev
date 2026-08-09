import { useState, useMemo } from 'react';
import { Award, ExternalLink, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { certificationsData } from '../data';

const CERTS_PER_PAGE = 4;

export const Certifications = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(certificationsData.length / CERTS_PER_PAGE);

  const currentCerts = useMemo(() => {
    return certificationsData.slice(
      currentPage * CERTS_PER_PAGE,
      (currentPage + 1) * CERTS_PER_PAGE
    );
  }, [currentPage]);

  return (
    <section id="certifications" className="py-20 px-6 bg-neutral-white dark:bg-neutral-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-neutral-black dark:text-neutral-white
                       animate-slideIn">
          Certifications & Credentials
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCerts.map((cert, index) => (
            <div
              key={`${cert.title}-${currentPage}`}
              className="group relative"
              style={{
                animation: `slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-pink to-primary-purple
                            rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>

              <div className="relative bg-neutral-white dark:bg-neutral-darkGray rounded-lg
                            border border-neutral-lightGray dark:border-neutral-gray
                            p-6 hover:border-primary-pink/50 dark:hover:border-primary-pink/50
                            transition-all duration-300 overflow-hidden group/cert h-full flex flex-col">
                <div className="absolute inset-0 opacity-0 group-hover/cert:opacity-15 transition duration-500
                              bg-gradient-to-br from-primary-pink to-primary-purple pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-12 h-12 rounded-lg overflow-hidden border border-neutral-lightGray
                               dark:border-neutral-gray hover:border-primary-pink transition-colors flex-shrink-0"
                      aria-label={`${cert.title} certificate`}
                    >
                      <img
                        src={cert.iconUrl}
                        alt={`${cert.issuer} logo`}
                        className="w-full h-full object-contain p-1 bg-white"
                      />
                    </a>
                    <Award className="w-5 h-5 text-primary-pink group-hover/cert:drop-shadow-lg transition duration-300 flex-shrink-0" />
                  </div>

                  <h3 className="text-base font-bold text-neutral-black dark:text-neutral-white mb-2
                               group-hover/cert:text-primary-pink transition duration-300 flex-1">
                    {cert.title}
                  </h3>

                  <p className="text-sm text-primary-pink font-semibold mb-3">
                    {cert.issuer}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-neutral-black dark:text-neutral-lightGray mb-4">
                    <Calendar className="w-4 h-4 text-primary-pink flex-shrink-0" />
                    {cert.date}
                  </div>

                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-pink hover:text-primary-purple
                             font-semibold transition-colors mt-auto text-sm"
                  >
                    View Credential
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-12">
          <button
            onClick={() => setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1))}
            disabled={totalPages <= 1}
            className="p-2 rounded-lg border-2 border-neutral-black dark:border-neutral-white
                       text-neutral-black dark:text-neutral-white hover:bg-neutral-black
                       hover:text-neutral-white dark:hover:bg-neutral-white dark:hover:text-neutral-black
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Previous certifications"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentPage === index
                    ? 'bg-primary-pink w-8'
                    : 'bg-neutral-gray dark:bg-neutral-lightGray hover:bg-primary-pink'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1))}
            disabled={totalPages <= 1}
            className="p-2 rounded-lg border-2 border-neutral-black dark:border-neutral-white
                       text-neutral-black dark:text-neutral-white hover:bg-neutral-black
                       hover:text-neutral-white dark:hover:bg-neutral-white dark:hover:text-neutral-black
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Next certifications"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
