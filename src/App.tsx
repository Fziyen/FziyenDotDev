import { Hero } from './components/Hero';
import { Skills } from './components/Skills';
import { Timeline } from './components/Timeline';
import { Projects } from './components/Projects';
import { Certifications } from './components/Certifications';
import { Contact } from './components/Contact';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { StickyResumeButton } from './components/StickyResumeButton';

function App() {
  return (
    <div className="min-h-screen bg-neutral-white dark:bg-neutral-black">
      <Navbar />
      <Hero />
      <Skills />
      <Timeline />
      <Projects />
      <Certifications />
      <Contact />
      <Footer />
      <StickyResumeButton />
    </div>
  );
}

export default App;
