import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ADMIN_INACTIVITY_TIMEOUT_MS } from "../config/security";
import { defaultPerfumes } from "../data/perfumes";
import { localPerfumeRepository } from "../repositories/localPerfumeRepository";
import { createPerfumeService } from "../services/perfumeService";
import { ADMIN_LOGOUT_REASON_KEY } from "../utils/adminSecurity";

const SESSION_KEY = "paris-parfums-admin-session";
const LAST_ACTIVITY_KEY = "paris-parfums-admin-last-activity";

const PerfumeStoreContext = createContext(null);
const perfumeService = createPerfumeService(localPerfumeRepository);

// Provee el catalogo, la sesion admin y las operaciones de gestion a toda la app.
export function PerfumeStoreProvider({ children }) {
  const [perfumes, setPerfumes] = useState(defaultPerfumes);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const activityTimerRef = useRef(null);

  // Limpia la sesion admin y opcionalmente guarda el motivo del cierre.
  function clearAdminSession(reason = "") {
    window.sessionStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);

    if (reason) {
      window.sessionStorage.setItem(ADMIN_LOGOUT_REASON_KEY, reason);
    } else {
      window.sessionStorage.removeItem(ADMIN_LOGOUT_REASON_KEY);
    }

    setIsAdminAuthenticated(false);
  }

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem(SESSION_KEY);

    setPerfumes(perfumeService.list());
    setIsAdminAuthenticated(storedSession === "true");
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      if (activityTimerRef.current) {
        window.clearInterval(activityTimerRef.current);
      }
      return undefined;
    }

    const markActivity = () => {
      window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const checkInactivity = () => {
      const lastActivity = Number(window.sessionStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      if (lastActivity && Date.now() - lastActivity > ADMIN_INACTIVITY_TIMEOUT_MS) {
        clearAdminSession("La sesion se cerro por inactividad.");
      }
    };

    markActivity();

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true })
    );

    activityTimerRef.current = window.setInterval(checkInactivity, 30 * 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      if (activityTimerRef.current) {
        window.clearInterval(activityTimerRef.current);
      }
    };
  }, [isAdminAuthenticated]);

  const value = useMemo(() => {
    const featuredPerfume = perfumes[0] ?? defaultPerfumes[0];

    return {
      perfumes,
      featuredPerfume,
      isAdminAuthenticated,
      getPerfumeBySlug: (slug) => perfumes.find((perfume) => perfume.slug === slug),
      addPerfume: (input) => {
        const normalized = perfumeService.create(input);
        setPerfumes((current) => [...current, normalized]);
        return normalized;
      },
      updatePerfume: (slug, input) => {
        const normalized = perfumeService.update(slug, input);
        setPerfumes((current) =>
          current.map((perfume) => (perfume.slug === slug ? normalized : perfume))
        );
        return normalized;
      },
      deletePerfume: (slug) => {
        perfumeService.remove(slug);
        setPerfumes((current) => current.filter((perfume) => perfume.slug !== slug));
      },
      resetPerfumes: () => {
        const restoredPerfumes = perfumeService.reset();
        setPerfumes(restoredPerfumes);
      },
      loginAdmin: () => {
        window.sessionStorage.setItem(SESSION_KEY, "true");
        window.sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
        window.sessionStorage.removeItem(ADMIN_LOGOUT_REASON_KEY);
        setIsAdminAuthenticated(true);
      },
      logoutAdmin: () => {
        clearAdminSession();
      }
    };
  }, [isAdminAuthenticated, perfumes]);

  return (
    <PerfumeStoreContext.Provider value={value}>{children}</PerfumeStoreContext.Provider>
  );
}

// Devuelve el acceso tipico al contexto de perfumes y administracion.
export function usePerfumeStore() {
  const context = useContext(PerfumeStoreContext);

  if (!context) {
    throw new Error("usePerfumeStore must be used within PerfumeStoreProvider");
  }

  return context;
}
