/**
 * Unified Image Utilities & URL Normalization
 * Supports Google Drive (all formats), Facebook CDN, Supabase Storage, and Local Assets.
 */

export const DEFAULT_FALLBACK_IMAGE = '/images/hero.png';
export const DEFAULT_HERO_IMAGE = '/images/hero.png';

/**
 * Extracts Google Drive file ID from various sharing/embedding URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/uc?export=view&id=FILE_ID
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://docs.google.com/uc?id=FILE_ID
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|uc\?(?:.*&)?id=|open\?(?:.*&)?id=|thumbnail\?(?:.*&)?id=)|lh3\.googleusercontent\.com\/d\/|docs\.google\.com\/uc\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/i;
  const match = url.match(driveRegex);
  return match && match[1] ? match[1] : null;
}

/**
 * Normalizes any raw image URL (Google Drive, Facebook CDN, Supabase Storage, relative paths)
 * into a direct, browser-renderable image URL.
 * Returns null if the URL is empty/falsy so callers can decide on fallbacks or conditional rendering.
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle Google Drive URLs -> Transform to high-speed UserContent CDN direct endpoint
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // Handle relative image paths (ensure leading slash)
  if (trimmed.startsWith('images/') || trimmed.startsWith('public/images/')) {
    return '/' + trimmed.replace(/^public\//, '');
  }

  return trimmed;
}

/**
 * Safe image resolver that returns a valid URL or the default fallback image
 */
export function getSafeImageUrl(url: string | null | undefined, fallback: string = DEFAULT_FALLBACK_IMAGE): string {
  const normalized = normalizeImageUrl(url);
  return normalized || fallback;
}
