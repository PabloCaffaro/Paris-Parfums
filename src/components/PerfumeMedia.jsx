import { useEffect, useState } from "react";
import PerfumeVisual from "./PerfumeVisual";

// Decide si mostrar una imagen real del perfume o el placeholder visual por defecto.
export default function PerfumeMedia({ perfume, size = "default" }) {
  const imageUrl = perfume?.imageUrl || "";
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imageFailed) {
    const className =
      size === "large" ? "perfume-image perfume-image-large" : "perfume-image";

    return (
      <img
        className={className}
        src={imageUrl}
        alt={perfume.name}
        loading={size === "large" ? "eager" : "lazy"}
        decoding="async"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return <PerfumeVisual size={size} label="PARIS" />;
}
