import { useCallback, useState } from 'react';
import Backdrop from './components/Backdrop';
import Trace from './components/Trace';
import Navbar from './components/Navbar';
import FloatingPortrait from './components/FloatingPortrait';
import CustomScrollbar from './components/CustomScrollbar';
import Home from './components/Home';
import Skills from './components/Skills';
import Creation from './components/Creation';
import Terminal from './components/Terminal';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import { navLinks } from './data/content';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useHomeScroll } from './hooks/useHomeScroll';
import { useScrollingClass } from './hooks/useScrollingClass';

const SECTION_IDS = navLinks.map(l => l.id);

export default function App() {
  const { progress, activeId, scrolled } = useScrollProgress(SECTION_IDS);
  const scrollRatio = useHomeScroll();
  const [brandShiftMax, setBrandShiftMax] = useState(48);
  useScrollingClass();

  const navigate = useCallback(id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="app-shell">
      <Backdrop />
      <Navbar
        activeId={activeId}
        scrolled={scrolled}
        scrollRatio={scrollRatio}
        onNavigate={navigate}
        onShiftMaxChange={setBrandShiftMax}
      />
      <Trace progress={progress} activeId={activeId} onNavigate={navigate} />
      <CustomScrollbar />

      {/* Floating portrait that morphs from hero to navbar on scroll */}
      <FloatingPortrait scrollRatio={scrollRatio} brandShiftMax={brandShiftMax} />

      <main>
        <Home scrollRatio={scrollRatio} />
        <Skills />
        <Creation />
        <Terminal />
        <Testimonials />
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
}
