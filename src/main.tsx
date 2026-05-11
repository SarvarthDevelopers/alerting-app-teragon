import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router';
import App from "./app/App";
import DesktopApp from "./desktop/DesktopApp";
import { Login } from "./components/Login";
import "./styles/index.css";

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

  return isDesktop
    ? <BrowserRouter><DesktopApp onLogout={handleLogout} /></BrowserRouter>
    : <App onLogout={handleLogout} />;
}

createRoot(document.getElementById("root")!).render(<Main />);