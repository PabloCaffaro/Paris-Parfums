import { Link, useParams } from "react-router-dom";
import ContactFooter from "../components/ContactFooter";
import Layout from "../components/Layout";
import PerfumeMedia from "../components/PerfumeMedia";
import { usePerfumeStore } from "../context/PerfumeStore";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { formatPrice } from "../utils/text";

// Muestra la ficha detallada de un perfume a partir de su slug en la URL.
export default function PerfumePage() {
  const { slug } = useParams();
  const { getPerfumeBySlug, isLoading, error } = usePerfumeStore();
  const perfume = getPerfumeBySlug(slug);
  const revealKey = `${isLoading}:${error}:${perfume?.slug ?? slug}`;

  useRevealOnScroll(revealKey);

  if (isLoading || (error && !perfume)) {
    const hasError = !isLoading && Boolean(error);

    return (
      <Layout>
        <section className="detail-layout">
          <div
            className="detail-copy reveal-on-scroll visible"
            role={hasError ? "alert" : "status"}
          >
            <p className="eyebrow">{hasError ? "Error de catalogo" : "Cargando"}</p>
            <h1>
              {hasError
                ? "No pudimos cargar esta fragancia."
                : "Estamos preparando el detalle del perfume."}
            </h1>
            <p className="summary">{hasError ? error : "Esto puede demorar un instante."}</p>
            {hasError ? (
              <div className="footer-row">
                <Link className="button light" to="/">
                  Volver al inicio
                </Link>
              </div>
            ) : null}
          </div>
        </section>
        <ContactFooter />
      </Layout>
    );
  }

  if (!perfume) {
    return (
      <Layout>
        <section className="detail-layout">
          <div className="detail-copy reveal-on-scroll" data-reveal>
            <p className="eyebrow">Perfume no encontrado</p>
            <h1>Esta fragancia no existe en el catalogo actual.</h1>
            <p className="summary">
              Volve al inicio para seguir recorriendo la seleccion disponible.
            </p>
            <div className="footer-row">
              <Link className="button light" to="/">
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
        <ContactFooter />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="detail-layout">
        <div className="detail-copy reveal-on-scroll" data-reveal>
          <p className="eyebrow">Detalle del perfume</p>
          <h1>{perfume.name}</h1>
          <div className="detail-family">{perfume.family}</div>
          <p className="summary">{perfume.detailedDescription}</p>
          <p className="detail-narrative">{perfume.narrative}</p>

          <div className="detail-meta-grid">
            <div className="detail-meta-card">
              <span className="detail-meta-label">Precio</span>
              <strong>{formatPrice(perfume.price)}</strong>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Presentacion</span>
              <strong>{perfume.volume}</strong>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Concentracion</span>
              <strong>{perfume.concentration}</strong>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Intensidad</span>
              <strong>{perfume.intensity}</strong>
            </div>
            <div className="detail-meta-card">
              <span className="detail-meta-label">Duracion</span>
              <strong>{perfume.duration}</strong>
            </div>
          </div>

          <div className="detail-block">
            <h2>Notas principales</h2>
            <div className="notes">
              {perfume.notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>

          <div className="detail-block">
            <h2>Ideal para</h2>
            <div className="occasion-list">
              {perfume.occasions.map((occasion) => (
                <span key={occasion}>{occasion}</span>
              ))}
            </div>
          </div>

          <div className="footer-row">
            <Link className="button light" to="/">
              Volver al inicio
            </Link>
            <a
              className="button"
              href="https://wa.me/59800000000"
              target="_blank"
              rel="noreferrer"
            >
              Consultar este perfume
            </a>
          </div>
        </div>

        <aside className="detail-panel reveal-on-scroll" data-reveal>
          <PerfumeMedia perfume={perfume} size="large" />
          <div className="detail-panel-copy">
            <h2>{perfume.name}</h2>
            <p>{perfume.shortDescription}</p>
          </div>
        </aside>
      </section>

      <ContactFooter />
    </Layout>
  );
}
