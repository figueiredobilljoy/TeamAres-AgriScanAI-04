import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import DetectPage from './pages/DetectPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handleNavigation = (event) => {
      const link = event.target.closest('a[href^="/"]');

      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      const nextPath = normalizePath(new URL(link.href).pathname);
      window.history.pushState({}, '', nextPath);
      setCurrentPath(nextPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePopState = () => setCurrentPath(normalizePath(window.location.pathname));

    document.addEventListener('click', handleNavigation);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleNavigation);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcefc6,transparent_32%),linear-gradient(135deg,#f6fbf2_0%,#dfead7_50%,#c6d8b8_100%)] text-leaf-900">
      <Navbar currentPath={currentPath} />
      {renderPage(currentPath)}
    </main>
  );
}

function normalizePath(pathname) {
  if (pathname === '/detect' || pathname === '/community') {
    return pathname;
  }

  return '/';
}

function renderPage(currentPath) {
  if (currentPath === '/detect') {
    return <DetectPage />;
  }

  if (currentPath === '/community') {
    return <CommunityPage />;
  }

  return <HomePage />;
}

export default App;
