export type FeatureNavItem = {
  key: string;
  label: string;
  path: string;
};

export const featureNavItems: FeatureNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard/list' },
  { key: 'playlists', label: 'Playlists', path: '/playlists/list' },
  { key: 'episodes', label: 'Episodes', path: '/episodes/list' },
  { key: 'categories', label: 'Categories', path: '/categories/list' },
  { key: 'types', label: 'Types', path: '/types/list' },
  { key: 'genres', label: 'Genres', path: '/genres/list' },
  { key: 'tv-schedule', label: 'TV Schedule', path: '/tv-schedule/list' },
  { key: 'site-config', label: 'Site Config', path: '/site-config/list' },
];

