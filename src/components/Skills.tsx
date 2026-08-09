import { skillsData } from '../data';

export const Skills = () => {
  return (
    <section id="skills" className="py-20 px-6 bg-neutral-white dark:bg-neutral-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-neutral-black dark:text-neutral-white
                       animate-slideIn">
          Skills & Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {skillsData.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={index}
                className="group relative h-full"
                style={{
                  animation: `slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-pink to-primary-purple
                              rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>

                <div className="relative bg-neutral-white dark:bg-neutral-darkGray rounded-lg
                              border border-neutral-lightGray dark:border-neutral-gray
                              p-6 h-full flex flex-col
                              hover:border-primary-pink/50 dark:hover:border-primary-pink/50
                              transition-all duration-300 overflow-hidden group/card">
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-15 transition duration-500
                                bg-gradient-to-br from-primary-pink to-primary-purple pointer-events-none"></div>

                  <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-pink/10 rounded-lg group-hover/card:bg-primary-pink/20 transition duration-300">
                      <Icon className="w-6 h-6 text-primary-pink group-hover/card:drop-shadow-lg transition duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-black dark:text-neutral-white">
                      {skill.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 relative z-10 flex-1">
                    {skill.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-neutral-black dark:text-neutral-lightGray
                                 flex items-center gap-2 group-hover/card:text-primary-pink transition duration-300"
                      >
                        <span className="w-1.5 h-1.5 bg-primary-purple rounded-full group-hover/card:bg-primary-pink transition duration-300"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
