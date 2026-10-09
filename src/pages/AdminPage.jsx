import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FIELD_LIMITS } from "../config/security";
import Layout from "../components/Layout";
import PerfumeMedia from "../components/PerfumeMedia";
import { usePerfumeStore } from "../context/PerfumeStore";
import {
  getDataUrlSizeBytes,
  sanitizeImageFile,
  validateImageFile
} from "../utils/image";

// Convierte un perfume guardado en el formato editable del formulario admin.
function perfumeToForm(perfume) {
  return {
    slug: perfume.slug,
    name: perfume.name,
    imageUrl: perfume.imageUrl || "",
    price: perfume.price ?? "",
    family: perfume.family,
    shortDescription: perfume.shortDescription,
    heroDescription: perfume.heroDescription,
    detailedDescription: perfume.detailedDescription,
    narrative: perfume.narrative,
    volume: perfume.volume,
    concentration: perfume.concentration,
    badge: perfume.badge,
    notes: perfume.notes.join(", "),
    occasions: perfume.occasions.join(", "),
    intensity: perfume.intensity,
    duration: perfume.duration
  };
}

const emptyForm = {
  slug: "",
  name: "",
  imageUrl: "",
  price: "",
  family: "",
  shortDescription: "",
  heroDescription: "",
  detailedDescription: "",
  narrative: "",
  volume: "",
  concentration: "",
  badge: "",
  notes: "",
  occasions: "",
  intensity: "",
  duration: ""
};

// Muestra el panel privado para crear, editar y borrar perfumes del catalogo.
export default function AdminPage() {
  const navigate = useNavigate();
  const {
    perfumes,
    addPerfume,
    updatePerfume,
    deletePerfume,
    logoutAdmin,
    isLoading,
    error: storeError,
    resetPerfumes
  } = usePerfumeStore();
  const [selectedSlug, setSelectedSlug] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState("");
  const previewImageUrl = selectedImagePreviewUrl || form.imageUrl;
  const hasImage = Boolean(previewImageUrl);
  const hasUploadedImage = form.imageUrl.startsWith("data:image/");

  useEffect(
    () => () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    },
    [selectedImagePreviewUrl]
  );

  const selectedPerfume = useMemo(
    () => perfumes.find((perfume) => perfume.slug === selectedSlug),
    [perfumes, selectedSlug]
  );

  // Sincroniza un input simple del formulario con el estado local.
  function handleChange(event) {
    const { name, value } = event.target;
    if (name === "imageUrl" && selectedImageFile) {
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl("");
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Prepara una vista previa inmediata; la optimizacion se realiza al guardar.
  function handleImageFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setSelectedImageFile(file);
      setSelectedImagePreviewUrl(URL.createObjectURL(file));
      setForm((current) => ({ ...current, imageUrl: "" }));
      setMessage("Foto seleccionada. Se optimizara al guardar los cambios.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar la imagen.");
    } finally {
      event.target.value = "";
    }
  }

  function handleRemoveImage() {
    setSelectedImageFile(null);
    setSelectedImagePreviewUrl("");
    setForm((current) => ({ ...current, imageUrl: "" }));
    setMessage("Imagen quitada del formulario. Guarda los cambios para confirmar.");
  }

  // Abre un perfume existente dentro del formulario para editarlo.
  function handleEdit(slug) {
    const perfume = perfumes.find((item) => item.slug === slug);
    if (!perfume) return;

    setSelectedImageFile(null);
    setSelectedImagePreviewUrl("");
    setSelectedSlug(slug);
    setForm(perfumeToForm(perfume));
    setMessage("Editando perfume seleccionado.");
  }

  // Limpia el formulario para empezar a crear un perfume nuevo.
  function handleNew() {
    setSelectedImageFile(null);
    setSelectedImagePreviewUrl("");
    setSelectedSlug("");
    setForm(emptyForm);
    setMessage("Formulario listo para crear un perfume nuevo.");
  }

  // Guarda un perfume nuevo o aplica cambios sobre uno ya existente.
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      let formToSave = form;

      if (selectedImageFile) {
        setIsProcessingImage(true);
        setMessage("Optimizando imagen y guardando...");
        const safeImageDataUrl = await sanitizeImageFile(selectedImageFile);
        formToSave = { ...form, imageUrl: safeImageDataUrl };
      }

      if (selectedPerfume) {
        const updated = await updatePerfume(selectedPerfume.slug, formToSave);
        setSelectedImageFile(null);
        setSelectedImagePreviewUrl("");
        setSelectedSlug(updated.slug);
        setForm(perfumeToForm(updated));
        const imageSizeKb = selectedImageFile
          ? Math.ceil(getDataUrlSizeBytes(updated.imageUrl) / 1024)
          : 0;
        setMessage(
          imageSizeKb
            ? `Perfume actualizado. Imagen optimizada a ${imageSizeKb} KB.`
            : "Perfume actualizado."
        );
        return;
      }

      const created = await addPerfume(formToSave);
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl("");
      setSelectedSlug(created.slug);
      setForm(perfumeToForm(created));
      const imageSizeKb = selectedImageFile
        ? Math.ceil(getDataUrlSizeBytes(created.imageUrl) / 1024)
        : 0;
      setMessage(
        imageSizeKb
          ? `Perfume creado. Imagen optimizada a ${imageSizeKb} KB.`
          : "Perfume creado."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar el perfume.");
    } finally {
      setIsProcessingImage(false);
    }
  }

  // Elimina un perfume del catalogo y resetea el formulario si estaba abierto.
  async function handleDelete(slug) {
    try {
      await deletePerfume(slug);
      if (selectedSlug === slug) {
        handleNew();
      }
      setMessage("Perfume eliminado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo eliminar el perfume.");
    }
  }

  // Restaura el catalogo inicial y refleja el resultado de la operacion asincrona.
  async function handleReset() {
    try {
      await resetPerfumes();
      setSelectedImageFile(null);
      setSelectedImagePreviewUrl("");
      setSelectedSlug("");
      setForm(emptyForm);
      setMessage("Catalogo restaurado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo restaurar el catalogo.");
    }
  }

  // Cierra la sesion administrativa y vuelve a la portada publica.
  function handleLogout() {
    logoutAdmin();
    navigate("/");
  }

  return (
    <Layout>
      <section className="admin-section">
        <div className="admin-header reveal-on-scroll visible">
          <div>
            <p className="eyebrow">Panel privado</p>
            <h1>Gestion del catalogo</h1>
            <p className="summary">
              Desde aca el duenio puede agregar, editar o borrar perfumes. Los cambios se
              guardan en este navegador para probar el flujo completo sin backend.
            </p>
          </div>
          <div className="admin-actions">
            <button className="button" type="button" onClick={handleNew}>
              Nuevo perfume
            </button>
            <button
              className="button"
              type="button"
              onClick={handleReset}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Restaurar base"}
            </button>
            <button className="button light" type="button" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </div>
        </div>

        <div className="admin-layout">
          <aside className="admin-list">
            <h2>Perfumes</h2>
            <div className="admin-list-items">
              {perfumes.map((perfume) => (
                <div className="admin-list-card" key={perfume.slug}>
                  <div className="admin-list-summary">
                    <PerfumeMedia perfume={perfume} size="thumbnail" />
                    <div className="admin-list-copy">
                      <strong>{perfume.name}</strong>
                      <span>{perfume.family}</span>
                    </div>
                  </div>
                  <div className="admin-list-buttons">
                    <button type="button" onClick={() => handleEdit(perfume.slug)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(perfume.slug)}
                      disabled={isLoading}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="admin-editor">
            <h2>{selectedPerfume ? "Editar perfume" : "Crear perfume"}</h2>
            {message ? <p className="admin-message">{message}</p> : null}
            {storeError ? <p className="admin-error">{storeError}</p> : null}
            <form className="admin-form-grid" onSubmit={handleSubmit} aria-busy={isLoading}>
              <label className="field">
                <span>Nombre</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.name}
                />
              </label>
              <label className="field">
                <span>Slug opcional</span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="Se genera desde el nombre"
                  maxLength={FIELD_LIMITS.slug}
                />
              </label>
              <label className="field">
                <span>Familia</span>
                <input
                  name="family"
                  value={form.family}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.family}
                />
              </label>
              <label className="field">
                <span>Imagen por URL HTTPS (opcional)</span>
                <input
                  name="imageUrl"
                  value={selectedImageFile || hasUploadedImage ? "" : form.imageUrl}
                  onChange={handleChange}
                  placeholder={
                    selectedImageFile
                      ? "Foto seleccionada desde el dispositivo"
                      : hasUploadedImage
                        ? "Imagen subida desde el dispositivo"
                        : "https://..."
                  }
                  maxLength={FIELD_LIMITS.imageUrl}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span>Subir imagen</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  disabled={isProcessingImage}
                />
                <small className="field-hint">
                  JPG, PNG o WEBP de hasta 10 MB. La imagen se optimiza automaticamente.
                </small>
              </label>
              <div className="image-upload-status" aria-live="polite">
                <span>
                  {isProcessingImage
                    ? "Optimizando imagen y guardando..."
                    : selectedImageFile
                      ? "Foto seleccionada · se procesara al guardar"
                      : hasUploadedImage
                      ? "Imagen subida lista"
                      : hasImage
                        ? "Imagen por URL lista"
                        : "Sin imagen seleccionada"}
                </span>
                {hasImage ? (
                  <button type="button" onClick={handleRemoveImage} disabled={isProcessingImage}>
                    Quitar imagen
                  </button>
                ) : null}
              </div>
              <label className="field">
                <span>Precio</span>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="120"
                  inputMode="numeric"
                />
              </label>
              <label className="field">
                <span>Presentacion</span>
                <input
                  name="volume"
                  value={form.volume}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.volume}
                />
              </label>
              <label className="field">
                <span>Concentracion</span>
                <input
                  name="concentration"
                  value={form.concentration}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.concentration}
                />
              </label>
              <label className="field">
                <span>Etiqueta</span>
                <input
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.badge}
                />
              </label>
              <label className="field">
                <span>Intensidad</span>
                <input
                  name="intensity"
                  value={form.intensity}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.intensity}
                />
              </label>
              <label className="field">
                <span>Duracion</span>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.duration}
                />
              </label>
              <label className="field field-full">
                <span>Descripcion corta</span>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  rows="3"
                  maxLength={FIELD_LIMITS.shortDescription}
                />
              </label>
              <label className="field field-full">
                <span>Texto de portada</span>
                <textarea
                  name="heroDescription"
                  value={form.heroDescription}
                  onChange={handleChange}
                  rows="3"
                  maxLength={FIELD_LIMITS.heroDescription}
                />
              </label>
              <label className="field field-full">
                <span>Descripcion detallada</span>
                <textarea
                  name="detailedDescription"
                  value={form.detailedDescription}
                  onChange={handleChange}
                  rows="4"
                  maxLength={FIELD_LIMITS.detailedDescription}
                />
              </label>
              <label className="field field-full">
                <span>Narrativa</span>
                <textarea
                  name="narrative"
                  value={form.narrative}
                  onChange={handleChange}
                  rows="4"
                  maxLength={FIELD_LIMITS.narrative}
                />
              </label>
              <label className="field field-full">
                <span>Notas separadas por coma</span>
                <input
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.listCount * (FIELD_LIMITS.listItem + 2)}
                />
              </label>
              <label className="field field-full">
                <span>Ocasiones separadas por coma</span>
                <input
                  name="occasions"
                  value={form.occasions}
                  onChange={handleChange}
                  maxLength={FIELD_LIMITS.listCount * (FIELD_LIMITS.listItem + 2)}
                />
              </label>
              <div className="field-full admin-submit-row">
                <button
                  className="button light"
                  type="submit"
                  disabled={isLoading || isProcessingImage}
                >
                  {isProcessingImage
                    ? "Optimizando y guardando..."
                    : isLoading ? "Guardando..." : selectedPerfume ? "Guardar cambios" : "Crear perfume"}
                </button>
              </div>
            </form>
            <div className="admin-preview">
              <p className="eyebrow">Vista previa</p>
              <div className="admin-preview-card">
                <PerfumeMedia
                  perfume={{ name: form.name || "PARIS", imageUrl: previewImageUrl }}
                />
              </div>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
