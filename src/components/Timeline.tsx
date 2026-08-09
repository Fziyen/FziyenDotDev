import { GraduationCap, Briefcase, Calendar } from 'lucide-react';
import { experienceEducationData } from '../data';

export const Timeline = () => {
  return (
    <section id="experience" className="py-20 px-6 bg-neutral-white dark:bg-neutral-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slideIn">
          <p className="text-sm font-semibold text-primary-pink mb-2 uppercase tracking-wider">Journey</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-pink to-primary-purple bg-clip-text text-transparent">
            Experience & Education
          </h2>
          <p className="text-neutral-black dark:text-neutral-lightGray text-lg max-w-2xl mx-auto">
            My professional growth and learning path
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Education Column */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary-pink rounded-xl">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-black dark:text-neutral-white">Education</h3>
            </div>

            <div className="relative space-y-6">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-pink to-primary-pink/30"></div>

              {experienceEducationData.education.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-16"
                  style={{
                    animation: `slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div className="absolute left-0 top-1.5 w-9 h-9 bg-primary-pink rounded-full flex items-center justify-center border-4 border-neutral-white dark:border-neutral-black">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-pink to-primary-purple rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>

                    <div className="relative bg-neutral-white dark:bg-neutral-darkGray rounded-lg border border-neutral-lightGray dark:border-neutral-gray p-6 hover:border-primary-pink/50 dark:hover:border-primary-pink/50 transition-all duration-300 overflow-hidden group/card">
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-15 transition duration-500 bg-gradient-to-br from-primary-pink to-primary-purple pointer-events-none"></div>

                      <div className="relative z-10">
                        {item.logoUrl && (
                          <div className="mb-4">
                            {item.logoLink ? (
                              <a
                                href={item.logoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                                aria-label={`${item.company} website`}
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-lightGray dark:border-neutral-gray hover:border-primary-pink transition-colors">
                                  <img
                                    src={item.logoUrl}
                                    alt={`${item.company} logo`}
                                    className="w-full h-full object-contain p-1 bg-white"
                                  />
                                </div>
                              </a>
                            ) : (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-lightGray dark:border-neutral-gray">
                                <img
                                  src={item.logoUrl}
                                  alt={`${item.company} logo`}
                                  className="w-full h-full object-contain p-1 bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-bold text-neutral-black dark:text-neutral-white mb-1">
                          {item.title}
                        </h3>

                        <p className="text-sm text-primary-pink font-semibold mb-2">
                          {item.company}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-neutral-black dark:text-neutral-lightGray mb-3">
                          <Calendar className="w-4 h-4 text-primary-pink flex-shrink-0" />
                          {item.period}
                        </div>

                        <p className="text-sm text-neutral-black dark:text-neutral-lightGray leading-relaxed">
                          {item.description}
                        </p>

                        {item.gpa && (
                          <p className="text-sm text-primary-pink font-semibold mt-3">
                            {item.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience Column */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-primary-purple rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-black dark:text-neutral-white">Work Experience</h3>
            </div>

            <div className="relative space-y-6">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-purple to-primary-purple/30"></div>

              {experienceEducationData.work.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-16"
                  style={{
                    animation: `slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div className="absolute left-0 top-1.5 w-9 h-9 bg-primary-purple rounded-full flex items-center justify-center border-4 border-neutral-white dark:border-neutral-black">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-pink to-primary-purple rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>

                    <div className="relative bg-neutral-white dark:bg-neutral-darkGray rounded-lg border border-neutral-lightGray dark:border-neutral-gray p-6 hover:border-primary-pink/50 dark:hover:border-primary-pink/50 transition-all duration-300 overflow-hidden group/card">
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-15 transition duration-500 bg-gradient-to-br from-primary-pink to-primary-purple pointer-events-none"></div>

                      <div className="relative z-10">
                        {item.logoUrl && (
                          <div className="mb-4">
                            {item.logoLink ? (
                              <a
                                href={item.logoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                                aria-label={`${item.company} website`}
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-lightGray dark:border-neutral-gray hover:border-primary-pink transition-colors">
                                  <img
                                    src={item.logoUrl}
                                    alt={`${item.company} logo`}
                                    className="w-full h-full object-contain p-1 bg-white"
                                  />
                                </div>
                              </a>
                            ) : (
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-lightGray dark:border-neutral-gray">
                                <img
                                  src={item.logoUrl}
                                  alt={`${item.company} logo`}
                                  className="w-full h-full object-contain p-1 bg-white"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-bold text-neutral-black dark:text-neutral-white mb-1">
                          {item.title}
                        </h3>

                        <p className="text-sm text-primary-pink font-semibold mb-2">
                          {item.company}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-neutral-black dark:text-neutral-lightGray mb-4">
                          <Calendar className="w-4 h-4 text-primary-pink flex-shrink-0" />
                          {item.period}
                        </div>

                        {typeof item.description === 'string' ? (
                          <p className="text-sm text-neutral-black dark:text-neutral-lightGray leading-relaxed">
                            {item.description}
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {item.description.map((point, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-neutral-black dark:text-neutral-lightGray flex gap-2"
                              >
                                <span className="text-primary-pink font-bold mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.gpa && (
                          <p className="text-sm text-primary-pink font-semibold mt-3">
                            {item.gpa}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
