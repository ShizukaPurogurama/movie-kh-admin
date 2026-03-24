import type { AdminData } from '../types/admin';

const now = new Date().toISOString();

export const initialData: AdminData = {
  playlists: [
    {
      playlistId: 'pl-001',
      title: 'Moon Over Angkor',
      season: 1,
      totalEpisodes: 12,
      thumbnailUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      description: 'A Cambodian romance drama that follows a singer and a journalist through a year of political and personal turmoil.',
      rating: 'PG-13',
      duration: 48,
      releaseDate: '2025-12-10',
      sortOrder: 1,
      isNew: true,
      isTrending: true,
      isUpcoming: false,
      trendingScore: 95,
      hasSubtitles: true,
      subtitleLanguages: ['Khmer', 'English'],
      hasHD: true,
      availableQualities: ['480p', '720p', '1080p'],
      createdAt: now,
      updatedAt: now,
      status: 'active',
      categoryIds: ['cat-drama'],
      typeIds: ['type-series'],
      genreIds: ['genre-romance', 'genre-drama'],
      videos: [
        {
          videoId: 'vid-001',
          episode: 1,
          episodeTitle: 'The First Song',
          sortOrder: 1,
          videoUrls: [
            { server: 'Server A', url: 'https://cdn.example.com/moon-over-angkor/ep1.m3u8' },
            { server: 'Backup', url: 'https://backup.example.com/moon-over-angkor/ep1.m3u8' }
          ],
          subtitleUrls: [
            { language: 'English', url: 'https://cdn.example.com/subtitles/moon-over-angkor-ep1-en.vtt' }
          ],
          uploadDate: now,
          updatedDate: now
        }
      ]
    }
  ],
  categories: [
    {
      categoryId: 'cat-drama',
      name: 'Drama',
      description: 'Serialized and cinematic drama content.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ],
  types: [
    {
      typeId: 'type-series',
      name: 'Series',
      description: 'Multi-episode seasonal content.',
      sortOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ],
  genres: [
    {
      genreId: 'genre-romance',
      name: 'Romance',
      description: 'Stories focused on emotional and romantic arcs.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
      sortOrder: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      genreId: 'genre-drama',
      name: 'Drama',
      description: 'Character driven stories with emotional depth.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
      sortOrder: 2,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ],
  tvSchedule: [
    {
      scheduleId: 'sch-001',
      playlistId: 'pl-001',
      videoId: 'vid-001',
      airDate: '2026-03-25',
      airTime: '20:00',
      duration: 48,
      episodeTitle: 'The First Song',
      episodeNumber: 1,
      seasonNumber: 1,
      isRepeat: false,
      priority: 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ],
  siteConfig: {
    social: {
      id: 'social-001',
      telegram: 'https://t.me/moviekh',
      instagram: 'https://instagram.com/moviekh',
      facebook: 'https://facebook.com/moviekh',
      email: 'support@moviekh.com',
      phoneNumber: '+85512345678',
      youtube: 'https://youtube.com/@moviekh',
      createdAt: now,
      updatedAt: now
    },
    aboutus: {
      id: 'about-001',
      description: 'Movie KH delivers curated Khmer and international entertainment for modern streaming audiences.',
      mission: 'To make Khmer storytelling accessible on every screen.',
      vision: 'To become the leading regional streaming destination for Cambodian entertainment.',
      createdAt: now,
      updatedAt: now
    },
    website: {
      id: 'web-001',
      title: 'Movie KH',
      version: '1.0.0',
      logoUrl: 'https://dummyimage.com/240x80/111827/ffffff&text=Movie+KH',
      faviconUrl: 'https://dummyimage.com/64x64/ef4444/ffffff&text=M',
      metaTitle: 'Movie KH - Stream Khmer Entertainment',
      metaDescription: 'Watch trending Khmer movies, series, and exclusive episodes online.',
      maintenanceMode: false,
      maintenanceMessage: 'We are upgrading the service. Please check back soon.',
      createdAt: now,
      updatedAt: now
    }
  }
};
