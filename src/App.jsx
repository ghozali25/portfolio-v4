import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Navbar from "./components/Navbar";
import { AnimatePresence } from 'framer-motion';

const Home = React.lazy(() => import("./Pages/Home"));
const About = React.lazy(() => import("./Pages/About"));
const AnimatedBackground = React.lazy(() => import("./components/Background"));
const Portofolio = React.lazy(() => import("./Pages/Portofolio"));
const ContactPage = React.lazy(() => import("./Pages/Contact"));
const Admin = React.lazy(() => import("./Pages/Admin"));
const ProjectDetails = React.lazy(() => import("./components/ProjectDetail"));
const WelcomeScreen = React.lazy(() => import("./Pages/WelcomeScreen"));

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <Suspense fallback={null}>
            <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Navbar />
          <Suspense
            fallback={
              <div className="w-full flex justify-center py-10 text-gray-400 text-sm">
                Loading experience...
              </div>
            }
          >
            <AnimatedBackground />
            <Home />
            <About />
            <Portofolio />
            <ContactPage />
          </Suspense>
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
    <Suspense
      fallback={
        <div className="w-full flex justify-center py-10 text-gray-400 text-sm">
          Loading project details...
        </div>
      }
    >
      <ProjectDetails id={id} />
    </Suspense>
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
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.add('dark');
    try { localStorage.removeItem('theme'); } catch (_) {}
  }, []);

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
        <Suspense
          fallback={
            <div className="w-full flex justify-center py-10 text-gray-400 text-sm">
              Loading admin panel...
            </div>
          }
        >
          <Admin />
        </Suspense>
      )}
    </>
  );
}

export default App;