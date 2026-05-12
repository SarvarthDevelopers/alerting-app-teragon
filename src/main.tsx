import { useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router';
import { Login } from "./components/Login";
import "./styles/index.css";

// Code Splitting: Lazy load platform-specific app versions
const App = lazy(() => import("./app/App"));
const DesktopApp = lazy(() => import("./desktop/DesktopApp"));

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const isDesktop = window.location.pathname.startsWith('/desktop');

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isDesktop={isDesktop} />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      {isDesktop
        ? <BrowserRouter><DesktopApp onLogout={handleLogout} /></BrowserRouter>
        : <App onLogout={handleLogout} />
      }
    </Suspense>
  );
}

// Mobile PWA Setup - Service Worker Registration
if (!window.location.pathname.startsWith('/desktop')) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('PWA SW registration failed: ', err);
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(<Main />);