import React, { useEffect, useMemo, useState } from 'react';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
import Admin from "./Pages/Admin";
import ProjectDetails from "./components/ProjectDetail";
import WelcomeScreen from "./Pages/WelcomeScreen";
import { AnimatePresence } from 'framer-motion';

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Navbar />
          <AnimatedBackground />
          <Home />
          <About />
          <Portofolio />
          <ContactPage />
          <footer>
            <center>
              <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
              <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
                2025{" "}
                <a href="https://flowbite.com/" className="hover:underline">
                  Ahmad Ghozali
                </a>
              </span>
            </center>
          </footer>
        </>
      )}
    </>
  );
};

const ProjectPageLayout = ({ id }) => (
  <>
    <ProjectDetails id={id} />
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          2025{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            Ahmad Ghozali
          </a>
        </span>
      </center>
    </footer>
  </>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    // Compatibility: rewrite path routes to hash routes
    if (typeof window !== 'undefined') {
      const { pathname } = window.location;
      if (pathname.startsWith('/admin')) {
        window.location.replace('/#admin');
        return;
      }
      if (pathname.startsWith('/project/')) {
        const id = pathname.split('/').pop();
        window.location.replace(`/#project/${id}`);
        return;
      }
    }
    const onHashChange = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const route = useMemo(() => {
    if (hash.startsWith('#project/')) {
      const id = hash.replace('#project/', '');
      return { name: 'project', id };
    }
    if (hash === '#admin') return { name: 'admin' };
    return { name: 'home' };
  }, [hash]);

  return (
    <>
      {route.name === 'home' && (
        <LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />
      )}
      {route.name === 'project' && (
        <ProjectPageLayout id={route.id} />
      )}
      {route.name === 'admin' && (
        <Admin />
      )}
    </>
  );
}

export default App;