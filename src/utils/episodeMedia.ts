import type { SubtitleUrl, VideoUrl } from '../types/admin';

type VideoUrlLike = Partial<VideoUrl> | string | null | undefined;

export function createVideoUrl(index: number, overrides: Partial<VideoUrl> = {}): VideoUrl {
  return {
    server: overrides.server?.trim() || `Server ${index + 1}`,
    url: overrides.url ?? '',
  };
}

export function normalizeVideoUrls(items: VideoUrlLike[] | undefined | null): VideoUrl[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.reduce<VideoUrl[]>((accumulator, item, index) => {
    if (typeof item === 'string') {
      const url = item.trim();

      if (url) {
        accumulator.push(createVideoUrl(index, { url }));
      }

      return accumulator;
    }

    if (!item || typeof item !== 'object') {
      return accumulator;
    }

    const server = item.server?.trim() || `Server ${index + 1}`;
    const url = typeof item.url === 'string' ? item.url : '';

    if (!server && !url) {
      return accumulator;
    }

    accumulator.push({ server, url });
    return accumulator;
  }, []);
}

export function getEditableVideoUrls(items: VideoUrlLike[] | undefined | null): VideoUrl[] {
  const normalizedItems = normalizeVideoUrls(items);
  return normalizedItems.length > 0 ? normalizedItems : [createVideoUrl(0)];
}

export function sanitizeVideoUrls(items: VideoUrlLike[] | undefined | null): VideoUrl[] {
  return normalizeVideoUrls(items).filter((item) => item.url.trim());
}

export function parseSubtitleUrls(value: string): SubtitleUrl[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [language = '', url = ''] = item.split('|');

      return {
        language: language.trim(),
        url: url.trim(),
      };
    });
}

export function stringifyPairs(items: Array<{ [key: string]: string }>, firstKey: string, secondKey: string) {
  return items.map((item) => `${item[firstKey] ?? ''}|${item[secondKey] ?? ''}`).join(', ');
}
