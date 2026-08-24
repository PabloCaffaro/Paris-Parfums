import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import ContactFooter from "../components/ContactFooter";
import PerfumeCard from "../components/PerfumeCard";
import PerfumeMedia from "../components/PerfumeMedia";
import { usePerfumeStore } from "../context/PerfumeStore";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { formatPrice, normalizeText } from "../utils/text";

// Renderiza la portada con destacado, buscador, filtros y catalogo interactivo.
export default function HomePage() {
  useRevealOnScroll();
  const { featuredPerfume, perfumes, isLoading, error } = usePerfumeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedFamily, setSelectedFamily] = useState("all");
  const [selectedIntensity, setSelectedIntensity] = useState("all");
  const [selectedConcentration, setSelectedConcentration] = useState("all");
  const [maxPrice, setMaxPrice] = useState(null);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const featuredPerfumes = useMemo(() => perfumes.slice(0, 4), [perfumes]);
  const activeFeaturedPerfume =
    featuredPerfumes[activeFeaturedIndex] ?? featuredPerfume;

  const featuredCount = featuredPerfumes.length;

  const families = useMemo(
    () => ["all", ...new Set(perfumes.map((perfume) => perfume.family))],
    [perfumes]
  );
  const intensities = useMemo(
    () => ["all", ...new Set(perfumes.map((perfume) => perfume.intensity))],
    [perfumes]
  );
  const concentrations = useMemo(
    () => ["all", ...new Set(perfumes.map((perfume) => perfume.concentration))],
    [perfumes]
  );
  const occasions = useMemo(
    () => ["all", ...new Set(perfumes.flatMap((perfume) => perfume.occasions))],
    [perfumes]
  );
  const maxAvailablePrice = useMemo(
    () => Math.max(...perfumes.map((perfume) => Number(perfume.price) || 0), 0),
    [perfumes]
  );
  const sliderMaxPrice = useMemo(() => {
    if (maxAvailablePrice <= 0) return 0;
    return Math.ceil(maxAvailablePrice / 10) * 10;
  }, [maxAvailablePrice]);

  useEffect(() => {
    setMaxPrice((current) => {
      if (current === null) return sliderMaxPrice;
      if (current > sliderMaxPrice) return sliderMaxPrice;
      return current;
    });
  }, [sliderMaxPrice]);

  useEffect(() => {
    if (activeFeaturedIndex < featuredCount) return;
    setActiveFeaturedIndex(0);
  }, [activeFeaturedIndex, featuredCount]);

  useEffect(() => {
    if (isCarouselPaused || featuredCount <= 1) return undefined;

    const timer = window.setTimeout(() => {
      setActiveFeaturedIndex((currentIndex) => (currentIndex + 1) % featuredCount);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [activeFeaturedIndex, featuredCount, isCarouselPaused]);

  function showPreviousFeatured() {
    setActiveFeaturedIndex((currentIndex) =>
      (currentIndex - 1 + featuredCount) % featuredCount
    );
  }

  function showNextFeatured() {
    setActiveFeaturedIndex((currentIndex) => (currentIndex + 1) % featuredCount);
  }

  const effectiveMaxPrice = maxPrice === null ? sliderMaxPrice : Math.min(maxPrice, sliderMaxPrice);
  const sliderProgress = sliderMaxPrice > 0 ? (effectiveMaxPrice / sliderMaxPrice) * 100 : 0;

  const filteredBySelectors = useMemo(
    () =>
      perfumes.filter((perfume) => {
        const matchesPrice = (Number(perfume.price) || 0) <= effectiveMaxPrice;
        const matchesOccasion =
          selectedOccasion === "all" || perfume.occasions.includes(selectedOccasion);
        const matchesFamily =
          selectedFamily === "all" || perfume.family === selectedFamily;
        const matchesIntensity =
          selectedIntensity === "all" || perfume.intensity === selectedIntensity;
        const matchesConcentration =
          selectedConcentration === "all" || perfume.concentration === selectedConcentration;

        return (
          matchesPrice &&
          matchesOccasion &&
          matchesFamily &&
          matchesIntensity &&
          matchesConcentration
        );
      }),
    [
      effectiveMaxPrice,
      perfumes,
      selectedConcentration,
      selectedFamily,
      selectedIntensity,
      selectedOccasion
    ]
  );

  const searchState = useMemo(() => {
    const trimmedSearch = deferredSearchTerm.trim();

    if (!trimmedSearch) {
      return {
        perfumesToShow: filteredBySelectors,
        hasResults: true,
        searched: false
      };
    }

    const normalizedQuery = normalizeText(trimmedSearch);
    const exactMatches = filteredBySelectors.filter(
      (perfume) => normalizeText(perfume.name) === normalizedQuery
    );

    if (exactMatches.length > 0) {
      return {
        perfumesToShow: exactMatches,
        hasResults: true,
        searched: true
      };
    }

    const fuzzyMatches = filteredBySelectors.filter((perfume) => {
      const normalizedName = normalizeText(perfume.name);
      const normalizedSlug = normalizeText(perfume.slug.replaceAll("-", " "));
      const queryParts = normalizedQuery.split(" ").filter(Boolean);

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedSlug.includes(normalizedQuery) ||
        queryParts.every((fragment) => normalizedName.includes(fragment))
      );
    });

    if (fuzzyMatches.length > 0) {
      return {
        perfumesToShow: fuzzyMatches,
        hasResults: true,
        searched: true
      };
    }

    return {
      perfumesToShow: filteredBySelectors,
      hasResults: false,
      searched: true
    };
  }, [deferredSearchTerm, filteredBySelectors]);

  // Restaura el buscador y todos los filtros a su estado inicial.
  function resetFilters() {
    setSearchTerm("");
    setSelectedOccasion("all");
    setSelectedFamily("all");
    setSelectedIntensity("all");
    setSelectedConcentration("all");
    setMaxPrice(sliderMaxPrice);
  }

  return (
    <Layout>
      <section className="hero hero-carousel">
        <p className="eyebrow hero-mobile-eyebrow">Fragancias destacadas</p>
        <div className="content reveal-on-scroll" data-reveal>
          <p className="eyebrow hero-desktop-eyebrow">Fragancias destacadas</p>
          <div
            key={activeFeaturedPerfume.slug}
            className="hero-slide-copy"
            aria-live="polite"
            aria-atomic="true"
          >
            <h1>
              {activeFeaturedPerfume.name} deja una estela intensa, elegante y dificil de
              olvidar.
            </h1>
            <p className="summary">{activeFeaturedPerfume.heroDescription}</p>
          </div>

          {featuredCount > 1 && (
            <div className="hero-carousel-controls" aria-label="Carrusel de fragancias destacadas">
              <button
                type="button"
                className="carousel-arrow"
                onClick={showPreviousFeatured}
                aria-label="Ver fragancia anterior"
              >
                ←
              </button>
              <span className="carousel-counter" aria-hidden="true">
                {String(activeFeaturedIndex + 1).padStart(2, "0")} / {String(featuredCount).padStart(2, "0")}
              </span>
              <div className="carousel-dots" aria-label="Elegir fragancia">
                {featuredPerfumes.map((perfume, index) => (
                  <button
                    key={perfume.slug}
                    type="button"
                    className={`carousel-dot${index === activeFeaturedIndex ? " active" : ""}`}
                    onClick={() => setActiveFeaturedIndex(index)}
                    aria-label={`Mostrar ${perfume.name}`}
                    aria-current={index === activeFeaturedIndex ? "true" : undefined}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-arrow"
                onClick={showNextFeatured}
                aria-label="Ver fragancia siguiente"
              >
                →
              </button>
              <button
                type="button"
                className="carousel-toggle"
                onClick={() => setIsCarouselPaused((current) => !current)}
                aria-label={isCarouselPaused ? "Reanudar carrusel" : "Pausar carrusel"}
              >
                {isCarouselPaused ? "Reanudar" : "Pausar"}
              </button>
            </div>
          )}

          <div className="footer-row">
            <a className="button light" href="#catalogo">
              Ver perfumes
            </a>
            <a
              className="button"
              href="https://wa.me/59800000000"
              target="_blank"
              rel="noreferrer"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        <aside className="panel reveal-on-scroll" data-reveal>
          <div key={activeFeaturedPerfume.slug} className="hero-slide-media">
            <Link
              to={`/perfumes/${activeFeaturedPerfume.slug}`}
              className="featured-media-link"
              aria-label={`Ver detalle de ${activeFeaturedPerfume.name}`}
            >
              <PerfumeMedia perfume={activeFeaturedPerfume} />
            </Link>
            <h2>{activeFeaturedPerfume.name}</h2>
            <p>{activeFeaturedPerfume.shortDescription}</p>
            <div className="notes">
              {activeFeaturedPerfume.notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading reveal-on-scroll" data-reveal>
          <h2>El catalogo aparece al bajar.</h2>
          <p>
            En lugar de separar la navegacion, esta version muestra la coleccion dentro de la
            misma pagina. Las tarjetas se van revelando con scroll para que la experiencia se
            sienta mas cuidada y con un poco mas de impacto visual.
          </p>
        </div>

        <div className="catalog-tools reveal-on-scroll" data-reveal>
          <div className="search-box">
            <label className="field">
              <span>Buscar perfume</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre"
              />
            </label>
          </div>

          <details className="filters-panel">
            <summary className="filters-summary">Mostrar filtros</summary>
            <div className="filters-grid">
              <label className="field">
                <span>Precio maximo</span>
                <input
                type="range"
                min="0"
                max={sliderMaxPrice}
                step="1"
                value={effectiveMaxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                style={{ "--range-progress": `${sliderProgress}%` }}
              />
              <strong className="range-value">{formatPrice(effectiveMaxPrice)}</strong>
              </label>

              <label className="field">
                <span>Momento</span>
                <select
                  value={selectedOccasion}
                  onChange={(event) => setSelectedOccasion(event.target.value)}
                >
                  {occasions.map((occasion) => (
                    <option key={occasion} value={occasion}>
                      {occasion === "all" ? "Todos" : occasion}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Familia</span>
                <select
                  value={selectedFamily}
                  onChange={(event) => setSelectedFamily(event.target.value)}
                >
                  {families.map((family) => (
                    <option key={family} value={family}>
                      {family === "all" ? "Todas" : family}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Intensidad</span>
                <select
                  value={selectedIntensity}
                  onChange={(event) => setSelectedIntensity(event.target.value)}
                >
                  {intensities.map((intensity) => (
                    <option key={intensity} value={intensity}>
                      {intensity === "all" ? "Todas" : intensity}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Concentracion</span>
                <select
                  value={selectedConcentration}
                  onChange={(event) => setSelectedConcentration(event.target.value)}
                >
                  {concentrations.map((concentration) => (
                    <option key={concentration} value={concentration}>
                      {concentration === "all" ? "Todas" : concentration}
                    </option>
                  ))}
                </select>
              </label>

              <button className="button filter-reset" type="button" onClick={resetFilters}>
                Limpiar filtros
              </button>
            </div>
          </details>
        </div>

        {isLoading ? (
          <p className="catalog-hint reveal-on-scroll visible" role="status">
            Cargando catalogo...
          </p>
        ) : null}

        {error ? (
          <p className="catalog-hint catalog-hint-alert reveal-on-scroll visible" role="alert">
            {error}
          </p>
        ) : null}

        {!isLoading && searchState.searched && !searchState.hasResults ? (
          <p className="catalog-hint catalog-hint-alert reveal-on-scroll visible">
            No encontramos perfumes con ese nombre. Abajo te mostramos perfumes disponibles
            que te pueden interesar.
          </p>
        ) : null}

        {!isLoading && filteredBySelectors.length === 0 ? (
          <p className="catalog-hint catalog-hint-alert reveal-on-scroll visible">
            No encontramos perfumes con esos filtros. Proba ampliando el rango o cambiando las
            opciones seleccionadas.
          </p>
        ) : null}

        <div className="catalog-grid">
          {searchState.perfumesToShow.map((perfume) => (
            <PerfumeCard key={perfume.slug} perfume={perfume} />
          ))}
        </div>
      </section>

      <ContactFooter />
    </Layout>
  );
}
