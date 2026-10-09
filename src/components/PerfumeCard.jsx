import { Link } from "react-router-dom";
import PerfumeMedia from "./PerfumeMedia";
import { formatStartingPrice } from "../utils/text";

// Muestra una tarjeta resumida de perfume dentro del catalogo navegable.
export default function PerfumeCard({ perfume }) {
  return (
    <Link to={`/perfumes/${perfume.slug}`} className="catalog-card">
      <PerfumeMedia perfume={perfume} />
      <h3>{perfume.name}</h3>
      <div className="family">{perfume.family}</div>
      <p>{perfume.shortDescription}</p>
      <div className="catalog-price">{formatStartingPrice(perfume)}</div>
      <div className="meta">
        <span>{perfume.volume}</span>
        <span>{perfume.concentration}</span>
        <span>{perfume.badge}</span>
      </div>
    </Link>
  );
}
