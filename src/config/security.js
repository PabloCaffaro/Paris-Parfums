export const ADMIN_MAX_LOGIN_ATTEMPTS = 5;
export const ADMIN_LOGIN_LOCK_MS = 60 * 1000;
export const ADMIN_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_STORED_SIZE_BYTES = 220 * 1024;
export const MAX_IMAGE_DIMENSION = 1200;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const FIELD_LIMITS = {
  name: 80,
  slug: 100,
  imageUrl: 2048,
  family: 80,
  shortDescription: 220,
  heroDescription: 260,
  detailedDescription: 900,
  narrative: 900,
  volume: 40,
  concentration: 24,
  badge: 32,
  intensity: 32,
  duration: 40,
  listItem: 40,
  listCount: 8
};
