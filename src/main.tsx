  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import DesktopApp from "./desktop/DesktopApp";
  import "./styles/index.css";

  const isDesktop = window.location.pathname.startsWith('/desktop');
  createRoot(document.getElementById("root")!).render(isDesktop ? <DesktopApp /> : <App />);