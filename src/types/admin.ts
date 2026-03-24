export type EntityStatus = 'active' | 'inactive' | 'draft' | 'upcoming';

export type QualityOption = '360p' | '480p' | '720p' | '1080p' | '4K';

export interface VideoUrl {
  server: string;
  url: string;
}

export interface SubtitleUrl {
  language: string;
  url: string;
}

export interface Video {
  videoId: string;
  episode: number;
  episodeTitle: string;
  sortOrder: number;
  videoUrls: VideoUrl[];
  subtitleUrls: SubtitleUrl[];
  uploadDate: string;
  updatedDate: string;
}

export interface Playlist {
  playlistId: string;
  title: string;
  season: number;
  totalEpisodes: number;
  thumbnailUrl: string;
  posterUrl: string;
  description: string;
  rating: string;
  duration: number;
  releaseDate: string;
  sortOrder: number;
  isNew: boolean;
  isTrending: boolean;
  isUpcoming: boolean;
  trendingScore: number;
  hasSubtitles: boolean;
  subtitleLanguages: string[];
  hasHD: boolean;
  availableQualities: QualityOption[];
  createdAt: string;
  updatedAt: string;
  status: EntityStatus;
  videos: Video[];
  categoryIds: string[];
  typeIds: string[];
  genreIds: string[];
}

export interface BaseTaxonomy {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category extends BaseTaxonomy {
  categoryId: string;
  thumbnailUrl: string;
}

export interface TypeItem extends BaseTaxonomy {
  typeId: string;
}

export interface Genre extends BaseTaxonomy {
  genreId: string;
  thumbnailUrl: string;
}

export interface TvSchedule {
  scheduleId: string;
  playlistId: string;
  videoId: string;
  airDate: string;
  airTime: string;
  duration: number;
  episodeTitle: string;
  episodeNumber: number;
  seasonNumber: number;
  isRepeat: boolean;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialConfig {
  id: string;
  telegram: string;
  instagram: string;
  facebook: string;
  email: string;
  phoneNumber: string;
  youtube: string;
  createdAt: string;
  updatedAt: string;
}

export interface AboutUsConfig {
  id: string;
  description: string;
  mission: string;
  vision: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteConfig {
  id: string;
  title: string;
  version: string;
  logoUrl: string;
  faviconUrl: string;
  metaTitle: string;
  metaDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  social: SocialConfig;
  aboutus: AboutUsConfig;
  website: WebsiteConfig;
}

export interface DashboardStats {
  playlists: number;
  videos: number;
  categories: number;
  genres: number;
  schedules: number;
}

export interface AdminData {
  playlists: Playlist[];
  categories: Category[];
  types: TypeItem[];
  genres: Genre[];
  tvSchedule: TvSchedule[];
  siteConfig: SiteConfig;
}

export type AdminSection =
  | 'dashboard'
  | 'playlists'
  | 'categories'
  | 'types'
  | 'genres'
  | 'schedule'
  | 'siteConfig';
