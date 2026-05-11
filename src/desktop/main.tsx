
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router';
import DesktopApp from "./DesktopApp";
import { Login } from "../components/Login";
import "../styles/index.css";

function Main() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} isDesktop={true} />;
  }

  return (
    <BrowserRouter>
      <DesktopApp onLogout={() => setIsAuthenticated(false)} />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<Main />);
