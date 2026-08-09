import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Github, Sparkles } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tech: string[];
  liveUrl: string;
  githubUrl: string;
  featured?: boolean;
  screenshotUrl?: string;
}

interface ProjectCarouselProps {
  projects: Project[];
}

const PROJECTS_PER_PAGE = 4;

export const ProjectCarousel = ({ projects }: ProjectCarouselProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const allTechs = useMemo(() => {
    const techs = new Set<string>();
    projects.forEach(p => p.tech.forEach(t => techs.add(t)));
    return Array.from(techs).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!selectedTech) return projects;
    return projects.filter(p => p.tech.includes(selectedTech));
  }, [projects, selectedTech]);

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const currentProjects = filteredProjects.slice(
    currentPage * PROJECTS_PER_PAGE,
    (currentPage + 1) * PROJECTS_PER_PAGE
  );

  const handlePrevious = () => {
    setCurrentPage(prev => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleTechFilter = (tech: string) => {
    setSelectedTech(selectedTech === tech ? null : tech);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {allTechs.map(tech => (
          <button
            key={tech}
            onClick={() => handleTechFilter(tech)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedTech === tech
                ? 'bg-gradient-to-r from-primary-pink to-primary-purple text-white'
                : 'bg-neutral-lightGray dark:bg-neutral-gray text-neutral-black dark:text-neutral-white hover:bg-neutral-gray dark:hover:bg-neutral-lightGray'
            }`}
          >
            {tech}
          </button>
        ))}
        {selectedTech && (
          <button
            onClick={() => {
              setSelectedTech(null);
              setCurrentPage(0);
            }}
            className="px-3 py-1 rounded-full text-sm font-semibold text-primary-pink hover:text-primary-purple transition-colors"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentProjects.map((project, index) => (
          <div
            key={`${project.title}-${index}`}
            className="group relative"
            style={{
              animation: `slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`,
              opacity: 0,
            }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-pink to-primary-purple
                          rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>

            <div className="relative bg-neutral-white dark:bg-neutral-darkGray rounded-lg
                          border border-neutral-lightGray dark:border-neutral-gray
                          hover:border-primary-pink/50 dark:hover:border-primary-pink/50
                          transition-all duration-300 overflow-hidden group/project">
              <div className="absolute inset-0 opacity-0 group-hover/project:opacity-20 transition duration-500
                            bg-gradient-to-br from-primary-pink to-primary-purple pointer-events-none"></div>

              {project.screenshotUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative w-full h-48 overflow-hidden"
                >
                  <img
                    src={project.screenshotUrl}
                    alt={`${project.title} screenshot`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/project:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/60 via-transparent to-transparent"></div>
                  {project.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1
                                  bg-primary-pink/90 backdrop-blur-sm rounded text-white text-xs font-bold">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </div>
                  )}
                </a>
              )}

              <div className="relative z-10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-neutral-black dark:text-neutral-white
                                 group-hover/project:drop-shadow-lg transition duration-300">
                      {project.title}
                    </h3>
                    {project.featured && !project.screenshotUrl && (
                      <Sparkles className="w-5 h-5 text-primary-pink animate-pulse group-hover/project:scale-125 transition duration-300" />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-pink hover:text-primary-purple transition-colors"
                      aria-label="View live project"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-pink hover:text-primary-purple transition-colors"
                      aria-label="View source code"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <p className="text-sm text-neutral-black dark:text-neutral-lightGray mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-br from-primary-pink to-primary-purple
                                 text-neutral-white text-xs font-bold rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-12">
        <button
          onClick={handlePrevious}
          disabled={totalPages <= 1}
          className="p-2 rounded-lg border-2 border-neutral-black dark:border-neutral-white
                     text-neutral-black dark:text-neutral-white hover:bg-neutral-black
                     hover:text-neutral-white dark:hover:bg-neutral-white dark:hover:text-neutral-black
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          aria-label="Previous projects"
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
          onClick={handleNext}
          disabled={totalPages <= 1}
          className="p-2 rounded-lg border-2 border-neutral-black dark:border-neutral-white
                     text-neutral-black dark:text-neutral-white hover:bg-neutral-black
                     hover:text-neutral-white dark:hover:bg-neutral-white dark:hover:text-neutral-black
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          aria-label="Next projects"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-black dark:text-neutral-lightGray">
            No projects found with that technology. Try a different filter!
          </p>
        </div>
      )}
    </div>
  );
};
