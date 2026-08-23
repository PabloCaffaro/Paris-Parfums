import { Link, useLocation } from "react-router-dom";
import logo from "../assets/paris-parfums-logo.svg";

// Envuelve cada pagina con la cabecera del logo y la estructura visual comun.
export default function Layout({ children }) {
  const location = useLocation();
  const disableLogoNavigation =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/acceso");

  return (
    <div className="site-shell">
      <div className="page-frame">
        <header className="topbar reveal-on-scroll" data-reveal>
          {disableLogoNavigation ? (
            <div className="logo-link logo-static" aria-label="Paris Parfums">
              <img className="logo" src={logo} alt="Paris Parfums" />
            </div>
          ) : (
            <Link
              to="/"
              className="logo-link"
              aria-label="Ir al inicio"
            >
              <img className="logo" src={logo} alt="Paris Parfums" />
            </Link>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
