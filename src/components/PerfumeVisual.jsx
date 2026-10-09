// Renderiza la botella placeholder cuando un perfume no tiene imagen cargada.
export default function PerfumeVisual({ size = "default", label = "PARIS" }) {
  const className =
    size === "large"
      ? "perfume-bottle perfume-bottle-large"
      : size === "thumbnail"
        ? "perfume-bottle perfume-bottle-thumbnail"
        : "perfume-bottle";

  return <div className={className} aria-hidden="true" data-label={label} />;
}
