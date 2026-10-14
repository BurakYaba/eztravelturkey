import manifest from '../../../content/scraped/image-manifest.json';
import type { ImageRef } from './types';

type ManifestFile = { ext: string; bytes: number; width: number; height: number; url?: string };
const files = manifest.files as Record<string, ManifestFile>;
const sources = manifest.sources as Record<string, { sha1: string }>;

/**
 * Address of a scraped picture. Until the images are uploaded (docs/project-plan.md P1.10, then Sanity in P6) the
 * live site's own address is used; once the manifest carries an `url` for a file, that one wins.
 */
export function resolveImage(source: { src: string; width?: number | null; height?: number | null; alt?: string }): ImageRef | null {
  const entry = sources[source.src];
  const file = entry ? files[entry.sha1] : undefined;
  const width = file?.width ?? source.width ?? 0;
  const height = file?.height ?? source.height ?? 0;
  if (!width || !height) {
    return null;
  }
  return { src: file?.url ?? source.src, width, height, alt: source.alt ?? '' };
}
