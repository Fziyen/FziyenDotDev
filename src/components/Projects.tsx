import { ProjectCarousel } from './ProjectCarousel';
import { projectsData } from '../data';

export const Projects = () => {
  return (
    <section id="projects" className="py-20 px-6 bg-neutral-white dark:bg-neutral-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-neutral-black dark:text-neutral-white
                       animate-slideIn">
          Featured Projects
        </h2>

        <ProjectCarousel projects={projectsData} />
      </div>
    </section>
  );
};
