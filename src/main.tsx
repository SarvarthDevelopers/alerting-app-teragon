import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router';
import App from "./app/App";
import DesktopApp from "./desktop/DesktopApp";
import { Login } from "./components/Login";
import "./styles/index.css";

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDesktop = window.location.pathname.startsWith('/desktop');

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} isDesktop={isDesktop} />;
  }

  return isDesktop
    ? <BrowserRouter><DesktopApp onLogout={() => setIsAuthenticated(false)} /></BrowserRouter>
    : <App onLogout={() => setIsAuthenticated(false)} />;
}

createRoot(document.getElementById("root")!).render(<Main />);