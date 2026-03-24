import { useMemo, useState } from 'react';
import { initialData } from '../data/initialData';
import { database, isFirebaseReady } from '../config/firebase';
import type {
  AdminData,
  AdminSection,
  Category,
  DashboardStats,
  Genre,
  Playlist,
  SiteConfig,
  TvSchedule,
  TypeItem,
  Video,
} from '../types/admin';

const sections: { key: AdminSection; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview of content inventory and publishing status.' },
  { key: 'playlists', label: 'Playlists', description: 'Manage playlists, episodes, media URLs, and flags.' },
  { key: 'categories', label: 'Categories', description: 'Organize playlists into editorial categories.' },
  { key: 'types', label: 'Types', description: 'Manage content types such as movie, series, or live show.' },
  { key: 'genres', label: 'Genres', description: 'Assign genres to improve discovery and curation.' },
  { key: 'schedule', label: 'TV Schedule', description: 'Plan airing slots for episodes and replays.' },
  { key: 'siteConfig', label: 'Site Config', description: 'Configure branding, metadata, and social links.' },
];

const emptyVideo = (): Video => ({
  videoId: `vid-${Date.now()}`,
  episode: 1,
  episodeTitle: '',
  sortOrder: 1,
  videoUrls: [{ server: 'Primary', url: '' }],
  subtitleUrls: [{ language: 'English', url: '' }],
  uploadDate: new Date().toISOString(),
  updatedDate: new Date().toISOString(),
});

const emptyPlaylist = (): Playlist => ({
  playlistId: `pl-${Date.now()}`,
  title: '',
  season: 1,
  totalEpisodes: 1,
  thumbnailUrl: '',
  posterUrl: '',
  description: '',
  rating: '',
  duration: 0,
  releaseDate: '',
  sortOrder: 1,
  isNew: false,
  isTrending: false,
  isUpcoming: false,
  trendingScore: 0,
  hasSubtitles: false,
  subtitleLanguages: [],
  hasHD: false,
  availableQualities: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'draft',
  videos: [emptyVideo()],
  categoryIds: [],
  typeIds: [],
  genreIds: [],
});

const emptyCategory = (): Category => ({
  categoryId: `cat-${Date.now()}`,
  name: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyType = (): TypeItem => ({
  typeId: `type-${Date.now()}`,
  name: '',
  description: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptyGenre = (): Genre => ({
  genreId: `genre-${Date.now()}`,
  name: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const emptySchedule = (): TvSchedule => ({
  scheduleId: `sch-${Date.now()}`,
  playlistId: '',
  videoId: '',
  airDate: '',
  airTime: '',
  duration: 0,
  episodeTitle: '',
  episodeNumber: 1,
  seasonNumber: 1,
  isRepeat: false,
  priority: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function App() {
  const [data, setData] = useState<AdminData>(initialData);
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [playlistForm, setPlaylistForm] = useState<Playlist>(initialData.playlists[0] ?? emptyPlaylist());
  const [categoryForm, setCategoryForm] = useState<Category>(initialData.categories[0] ?? emptyCategory());
  const [typeForm, setTypeForm] = useState<TypeItem>(initialData.types[0] ?? emptyType());
  const [genreForm, setGenreForm] = useState<Genre>(initialData.genres[0] ?? emptyGenre());
  const [scheduleForm, setScheduleForm] = useState<TvSchedule>(initialData.tvSchedule[0] ?? emptySchedule());
  const [siteConfigForm, setSiteConfigForm] = useState<SiteConfig>(initialData.siteConfig);
  const [message, setMessage] = useState('Loaded local admin workspace.');

  const stats = useMemo<DashboardStats>(
    () => ({
      playlists: data.playlists.length,
      videos: data.playlists.reduce((total, playlist) => total + playlist.videos.length, 0),
      categories: data.categories.length,
      genres: data.genres.length,
      schedules: data.tvSchedule.length,
    }),
    [data]
  );

  const handleSavePlaylist = () => {
    setData((current) => {
      const exists = current.playlists.some((playlist) => playlist.playlistId === playlistForm.playlistId);
      const playlists = exists
        ? current.playlists.map((playlist) =>
            playlist.playlistId === playlistForm.playlistId
              ? { ...playlistForm, updatedAt: new Date().toISOString() }
              : playlist
          )
        : [...current.playlists, { ...playlistForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return { ...current, playlists };
    });
    setMessage(`Playlist ${playlistForm.title || playlistForm.playlistId} saved locally${isFirebaseReady ? ' and ready for Firebase sync.' : '.'}`);
  };

  const handleSaveCategory = () => {
    setData((current) => {
      const exists = current.categories.some((item) => item.categoryId === categoryForm.categoryId);
      const categories = exists
        ? current.categories.map((item) =>
            item.categoryId === categoryForm.categoryId ? { ...categoryForm, updatedAt: new Date().toISOString() } : item
          )
        : [...current.categories, { ...categoryForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return { ...current, categories };
    });
    setMessage(`Category ${categoryForm.name || categoryForm.categoryId} saved locally.`);
  };

  const handleSaveType = () => {
    setData((current) => {
      const exists = current.types.some((item) => item.typeId === typeForm.typeId);
      const types = exists
        ? current.types.map((item) => (item.typeId === typeForm.typeId ? { ...typeForm, updatedAt: new Date().toISOString() } : item))
        : [...current.types, { ...typeForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return { ...current, types };
    });
    setMessage(`Type ${typeForm.name || typeForm.typeId} saved locally.`);
  };

  const handleSaveGenre = () => {
    setData((current) => {
      const exists = current.genres.some((item) => item.genreId === genreForm.genreId);
      const genres = exists
        ? current.genres.map((item) => (item.genreId === genreForm.genreId ? { ...genreForm, updatedAt: new Date().toISOString() } : item))
        : [...current.genres, { ...genreForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return { ...current, genres };
    });
    setMessage(`Genre ${genreForm.name || genreForm.genreId} saved locally.`);
  };

  const handleSaveSchedule = () => {
    setData((current) => {
      const exists = current.tvSchedule.some((item) => item.scheduleId === scheduleForm.scheduleId);
      const tvSchedule = exists
        ? current.tvSchedule.map((item) =>
            item.scheduleId === scheduleForm.scheduleId ? { ...scheduleForm, updatedAt: new Date().toISOString() } : item
          )
        : [...current.tvSchedule, { ...scheduleForm, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
      return { ...current, tvSchedule };
    });
    setMessage(`Schedule ${scheduleForm.scheduleId} saved locally.`);
  };

  const handleSaveSiteConfig = () => {
    setData((current) => ({ ...current, siteConfig: siteConfigForm }));
    setMessage('Site configuration updated locally.');
  };

  const handleNewPlaylist = () => setPlaylistForm(emptyPlaylist());
  const handleNewCategory = () => setCategoryForm(emptyCategory());
  const handleNewType = () => setTypeForm(emptyType());
  const handleNewGenre = () => setGenreForm(emptyGenre());
  const handleNewSchedule = () => setScheduleForm(emptySchedule());

  const selectedSection = sections.find((section) => section.key === activeSection);

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="brand">Movie KH Admin</h1>
            <p className="tagline">Admin Console</p>
          </div>
          <div className="header-right">
            <div className="sidebar-status">
              {isFirebaseReady ? 'Firebase connected' : 'Local mode'}
            </div>
            <p className="sidebar-note">{message}</p>
          </div>
        </header>

        <nav className="admin-nav">
          <p className="nav-heading">Navigation</p>
          {sections.map((section) => (
            <button
              key={section.key}
              className={`nav-tab ${activeSection === section.key ? 'active' : ''}`}
              onClick={() => setActiveSection(section.key)}
              aria-current={activeSection === section.key ? 'page' : undefined}
            >
              <span className="tab-label">{section.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="main-header">
          <h2>{selectedSection?.label}</h2>
          <p className="section-description">{selectedSection?.description}</p>
        </div>

        {activeSection === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-row">
              <StatCard label="Playlists" value={stats.playlists} accent="red" />
              <StatCard label="Episodes" value={stats.videos} accent="blue" />
              <StatCard label="Taxonomies" value={stats.categories + data.types.length + data.genres.length} accent="green" />
              <StatCard label="Schedule Slots" value={stats.schedules} accent="amber" />
            </div>

            <div className="content-cards">
              <div className="card">
                <h3>Content publishing checklist</h3>
                <ul className="checklist">
                  <li>Manage nested episodes and streaming mirrors from a single playlist record.</li>
                  <li>Map categories, types, and genres to support dynamic frontend filters.</li>
                  <li>Prepare TV schedule entries with priority and repeat flags.</li>
                  <li>Update site identity, maintenance mode, and social channels from one screen.</li>
                </ul>
              </div>

              <div className="card">
                <h3>Current playlists</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Episodes</th>
                        <th>Trending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.playlists.map((playlist) => (
                        <tr key={playlist.playlistId}>
                          <td>{playlist.title}</td>
                          <td><span className={`status-badge status-${playlist.status}`}>{playlist.status}</span></td>
                          <td>{playlist.totalEpisodes}</td>
                          <td>{playlist.isTrending ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'playlists' && (
          <div className="workspace">
            <div className="workspace-sidebar">
              <div className="sidebar-header">
                <h3>Playlists</h3>
                <button className="btn-secondary" onClick={handleNewPlaylist}>New playlist</button>
              </div>
              <div className="entity-list">
                {data.playlists.map((playlist) => (
                  <button
                    key={playlist.playlistId}
                    className={`entity-item ${playlistForm.playlistId === playlist.playlistId ? 'selected' : ''}`}
                    onClick={() => setPlaylistForm(playlist)}
                  >
                    <div className="entity-title">{playlist.title}</div>
                    <div className="entity-meta">
                      <span>{playlist.status}</span>
                      <span>{playlist.totalEpisodes} episodes</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="workspace-editor">
              <div className="editor-header">
                <h3>Playlist editor</h3>
                <button className="btn-primary" onClick={handleSavePlaylist}>Save playlist</button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Playlist ID</label>
                  <input value={playlistForm.playlistId} onChange={(e) => setPlaylistForm({ ...playlistForm, playlistId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input value={playlistForm.title} onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Season</label>
                  <input type="number" value={playlistForm.season} onChange={(e) => setPlaylistForm({ ...playlistForm, season: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Total Episodes</label>
                  <input type="number" value={playlistForm.totalEpisodes} onChange={(e) => setPlaylistForm({ ...playlistForm, totalEpisodes: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Thumbnail URL</label>
                  <input value={playlistForm.thumbnailUrl} onChange={(e) => setPlaylistForm({ ...playlistForm, thumbnailUrl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Poster URL</label>
                  <input value={playlistForm.posterUrl} onChange={(e) => setPlaylistForm({ ...playlistForm, posterUrl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <input value={playlistForm.rating} onChange={(e) => setPlaylistForm({ ...playlistForm, rating: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" value={playlistForm.duration} onChange={(e) => setPlaylistForm({ ...playlistForm, duration: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Release Date</label>
                  <input type="date" value={playlistForm.releaseDate} onChange={(e) => setPlaylistForm({ ...playlistForm, releaseDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={playlistForm.status} onChange={(e) => setPlaylistForm({ ...playlistForm, status: e.target.value as Playlist['status'] })}>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                    <option value="draft">draft</option>
                    <option value="upcoming">upcoming</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea rows={4} value={playlistForm.description} onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Subtitle Languages (comma separated)</label>
                  <input value={playlistForm.subtitleLanguages.join(', ')} onChange={(e) => setPlaylistForm({ ...playlistForm, subtitleLanguages: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                </div>
                <div className="form-group">
                  <label>Available Qualities (comma separated)</label>
                  <input value={playlistForm.availableQualities.join(', ')} onChange={(e) => setPlaylistForm({ ...playlistForm, availableQualities: e.target.value.split(',').map((item) => item.trim()) as Playlist['availableQualities'] })} />
                </div>
                <div className="form-group">
                  <label>Category IDs (comma separated)</label>
                  <input value={playlistForm.categoryIds.join(', ')} onChange={(e) => setPlaylistForm({ ...playlistForm, categoryIds: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                </div>
                <div className="form-group">
                  <label>Type IDs (comma separated)</label>
                  <input value={playlistForm.typeIds.join(', ')} onChange={(e) => setPlaylistForm({ ...playlistForm, typeIds: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                </div>
                <div className="form-group">
                  <label>Genre IDs (comma separated)</label>
                  <input value={playlistForm.genreIds.join(', ')} onChange={(e) => setPlaylistForm({ ...playlistForm, genreIds: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={playlistForm.isNew} onChange={(e) => setPlaylistForm({ ...playlistForm, isNew: e.target.checked })} />
                    New
                  </label>
                  <label>
                    <input type="checkbox" checked={playlistForm.isTrending} onChange={(e) => setPlaylistForm({ ...playlistForm, isTrending: e.target.checked })} />
                    Trending
                  </label>
                  <label>
                    <input type="checkbox" checked={playlistForm.isUpcoming} onChange={(e) => setPlaylistForm({ ...playlistForm, isUpcoming: e.target.checked })} />
                    Upcoming
                  </label>
                  <label>
                    <input type="checkbox" checked={playlistForm.hasSubtitles} onChange={(e) => setPlaylistForm({ ...playlistForm, hasSubtitles: e.target.checked })} />
                    Has subtitles
                  </label>
                  <label>
                    <input type="checkbox" checked={playlistForm.hasHD} onChange={(e) => setPlaylistForm({ ...playlistForm, hasHD: e.target.checked })} />
                    Has HD
                  </label>
                </div>
              </div>

              <div className="nested-section">
                <div className="nested-header">
                  <h4>Episodes</h4>
                  <button className="btn-secondary" onClick={() => setPlaylistForm({ ...playlistForm, videos: [...playlistForm.videos, emptyVideo()] })}>
                    Add episode
                  </button>
                </div>
                {playlistForm.videos.map((video, index) => (
                  <div className="nested-card" key={video.videoId}>
                    <div className="nested-card-header">
                      <strong>Episode {index + 1}</strong>
                      <button
                        className="btn-link"
                        onClick={() => setPlaylistForm({ ...playlistForm, videos: playlistForm.videos.filter((item) => item.videoId !== video.videoId) })}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="form-grid compact">
                      <div className="form-group">
                        <label>Video ID</label>
                        <input value={video.videoId} onChange={(e) => updateVideo(index, { videoId: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Episode</label>
                        <input type="number" value={video.episode} onChange={(e) => updateVideo(index, { episode: Number(e.target.value) })} />
                      </div>
                      <div className="form-group">
                        <label>Episode Title</label>
                        <input value={video.episodeTitle} onChange={(e) => updateVideo(index, { episodeTitle: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Sort Order</label>
                        <input type="number" value={video.sortOrder} onChange={(e) => updateVideo(index, { sortOrder: Number(e.target.value) })} />
                      </div>
                      <div className="form-group full-width">
                        <label>Streaming URLs (server|url, comma separated)</label>
                        <input value={video.videoUrls.map((item) => `${item.server}|${item.url}`).join(', ')} onChange={(e) => updateVideo(index, { videoUrls: parsePairs(e.target.value, 'server', 'url') })} />
                      </div>
                      <div className="form-group full-width">
                        <label>Subtitle URLs (language|url, comma separated)</label>
                        <input value={video.subtitleUrls.map((item) => `${item.language}|${item.url}`).join(', ')} onChange={(e) => updateVideo(index, { subtitleUrls: parsePairs(e.target.value, 'language', 'url') })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'categories' && (
          <TaxonomySection
            title="Categories"
            items={data.categories}
            itemKey="categoryId"
            form={categoryForm}
            onNew={handleNewCategory}
            onSelect={setCategoryForm}
            onSave={handleSaveCategory}
            onChange={setCategoryForm}
            hasThumbnail
          />
        )}

        {activeSection === 'types' && (
          <TaxonomySection
            title="Types"
            items={data.types}
            itemKey="typeId"
            form={typeForm}
            onNew={handleNewType}
            onSelect={setTypeForm}
            onSave={handleSaveType}
            onChange={setTypeForm}
          />
        )}

        {activeSection === 'genres' && (
          <TaxonomySection
            title="Genres"
            items={data.genres}
            itemKey="genreId"
            form={genreForm}
            onNew={handleNewGenre}
            onSelect={setGenreForm}
            onSave={handleSaveGenre}
            onChange={setGenreForm}
            hasThumbnail
          />
        )}

        {activeSection === 'schedule' && (
          <div className="workspace">
            <div className="workspace-sidebar">
              <div className="sidebar-header">
                <h3>TV Schedule</h3>
                <button className="btn-secondary" onClick={handleNewSchedule}>New slot</button>
              </div>
              <div className="entity-list">
                {data.tvSchedule.map((schedule) => (
                  <button
                    key={schedule.scheduleId}
                    className={`entity-item ${scheduleForm.scheduleId === schedule.scheduleId ? 'selected' : ''}`}
                    onClick={() => setScheduleForm(schedule)}
                  >
                    <div className="entity-title">{schedule.episodeTitle || schedule.scheduleId}</div>
                    <div className="entity-meta">
                      <span>{schedule.airDate} {schedule.airTime}</span>
                      <span>{schedule.isRepeat ? 'Repeat' : 'Premier'} · Priority {schedule.priority}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="workspace-editor">
              <div className="editor-header">
                <h3>Schedule editor</h3>
                <button className="btn-primary" onClick={handleSaveSchedule}>Save schedule</button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Schedule ID</label>
                  <input value={scheduleForm.scheduleId} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Playlist ID</label>
                  <input value={scheduleForm.playlistId} onChange={(e) => setScheduleForm({ ...scheduleForm, playlistId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Video ID</label>
                  <input value={scheduleForm.videoId} onChange={(e) => setScheduleForm({ ...scheduleForm, videoId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Air Date</label>
                  <input type="date" value={scheduleForm.airDate} onChange={(e) => setScheduleForm({ ...scheduleForm, airDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Air Time</label>
                  <input type="time" value={scheduleForm.airTime} onChange={(e) => setScheduleForm({ ...scheduleForm, airTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input type="number" value={scheduleForm.duration} onChange={(e) => setScheduleForm({ ...scheduleForm, duration: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Episode Title</label>
                  <input value={scheduleForm.episodeTitle} onChange={(e) => setScheduleForm({ ...scheduleForm, episodeTitle: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Episode Number</label>
                  <input type="number" value={scheduleForm.episodeNumber} onChange={(e) => setScheduleForm({ ...scheduleForm, episodeNumber: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Season Number</label>
                  <input type="number" value={scheduleForm.seasonNumber} onChange={(e) => setScheduleForm({ ...scheduleForm, seasonNumber: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <input type="number" value={scheduleForm.priority} onChange={(e) => setScheduleForm({ ...scheduleForm, priority: Number(e.target.value) })} />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={scheduleForm.isRepeat} onChange={(e) => setScheduleForm({ ...scheduleForm, isRepeat: e.target.checked })} />
                    Repeat airing
                  </label>
                  <label>
                    <input type="checkbox" checked={scheduleForm.isActive} onChange={(e) => setScheduleForm({ ...scheduleForm, isActive: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'siteConfig' && (
          <div className="config-workspace">
            <div className="config-header">
              <h3>Site configuration</h3>
              <button className="btn-primary" onClick={handleSaveSiteConfig}>Save configuration</button>
            </div>
            <div className="config-grid">
              <ConfigCard title="Website">
                <div className="form-group">
                  <label>Title</label>
                  <input value={siteConfigForm.website.title} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, title: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Version</label>
                  <input value={siteConfigForm.website.version} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, version: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input value={siteConfigForm.website.logoUrl} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, logoUrl: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Favicon URL</label>
                  <input value={siteConfigForm.website.faviconUrl} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, faviconUrl: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Meta Title</label>
                  <input value={siteConfigForm.website.metaTitle} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, metaTitle: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea rows={4} value={siteConfigForm.website.metaDescription} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, metaDescription: e.target.value } })} />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={siteConfigForm.website.maintenanceMode} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, maintenanceMode: e.target.checked } })} />
                    Maintenance Mode
                  </label>
                </div>
                <div className="form-group">
                  <label>Maintenance Message</label>
                  <textarea rows={3} value={siteConfigForm.website.maintenanceMessage} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, website: { ...siteConfigForm.website, maintenanceMessage: e.target.value } })} />
                </div>
              </ConfigCard>

              <ConfigCard title="Social">
                <div className="form-group">
                  <label>Email</label>
                  <input value={siteConfigForm.social.email} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, email: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={siteConfigForm.social.phoneNumber} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, phoneNumber: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Telegram</label>
                  <input value={siteConfigForm.social.telegram} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, telegram: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Instagram</label>
                  <input value={siteConfigForm.social.instagram} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, instagram: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Facebook</label>
                  <input value={siteConfigForm.social.facebook} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, facebook: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>YouTube</label>
                  <input value={siteConfigForm.social.youtube} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, social: { ...siteConfigForm.social, youtube: e.target.value } })} />
                </div>
              </ConfigCard>

              <ConfigCard title="About Us">
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows={4} value={siteConfigForm.aboutus.description} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, aboutus: { ...siteConfigForm.aboutus, description: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Mission</label>
                  <textarea rows={3} value={siteConfigForm.aboutus.mission} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, aboutus: { ...siteConfigForm.aboutus, mission: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Vision</label>
                  <textarea rows={3} value={siteConfigForm.aboutus.vision} onChange={(e) => setSiteConfigForm({ ...siteConfigForm, aboutus: { ...siteConfigForm.aboutus, vision: e.target.value } })} />
                </div>
              </ConfigCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  function updateVideo(index: number, patch: Partial<Video>) {
    setPlaylistForm((current) => ({
      ...current,
      videos: current.videos.map((video, currentIndex) =>
        currentIndex === index
          ? { ...video, ...patch, updatedDate: new Date().toISOString() }
          : video
      ),
    }));
  }
}

interface StatCardProps {
  label: string;
  value: number;
  accent: 'red' | 'blue' | 'green' | 'amber';
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

interface TaxonomyItemBase {
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  thumbnailUrl?: string;
}

interface TaxonomySectionProps<T extends TaxonomyItemBase> {
  title: string;
  items: T[];
  itemKey: keyof T;
  form: T;
  onNew: () => void;
  onSelect: (item: T) => void;
  onSave: () => void;
  onChange: (item: T) => void;
  hasThumbnail?: boolean;
}

function TaxonomySection<T extends TaxonomyItemBase>({
  title,
  items,
  itemKey,
  form,
  onNew,
  onSelect,
  onSave,
  onChange,
  hasThumbnail = false,
}: TaxonomySectionProps<T>) {
  return (
    <div className="workspace">
      <div className="workspace-sidebar">
        <div className="sidebar-header">
          <h3>{title}</h3>
          <button className="btn-secondary" onClick={onNew}>New</button>
        </div>
        <div className="entity-list">
          {items.map((item) => (
            <button
              key={String(item[itemKey])}
              className={`entity-item ${form[itemKey] === item[itemKey] ? 'selected' : ''}`}
              onClick={() => onSelect(item)}
            >
              <div className="entity-title">{item.name}</div>
              <div className="entity-meta">
                <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                <span>Sort {item.sortOrder}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="workspace-editor">
        <div className="editor-header">
          <h3>{title} editor</h3>
          <button className="btn-primary" onClick={onSave}>Save</button>
        </div>

        <div className="form-grid">
          {Object.keys(form)
            .filter((key) => key.endsWith('Id'))
            .map((key) => (
              <div className="form-group" key={key}>
                <label>{key}</label>
                <input value={String(form[key as keyof T] ?? '')} onChange={(e) => onChange({ ...form, [key]: e.target.value })} />
              </div>
            ))}
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Sort Order</label>
            <input type="number" value={form.sortOrder} onChange={(e) => onChange({ ...form, sortOrder: Number(e.target.value) })} />
          </div>
          {hasThumbnail && (
            <div className="form-group">
              <label>Thumbnail URL</label>
              <input value={form.thumbnailUrl ?? ''} onChange={(e) => onChange({ ...form, thumbnailUrl: e.target.value })} />
            </div>
          )}
          <div className="form-group full-width">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={form.isActive} onChange={(e) => onChange({ ...form, isActive: e.target.checked })} />
              Active
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="config-card">
      <h4>{title}</h4>
      <div className="config-card-body">{children}</div>
    </div>
  );
}

function parsePairs<T extends 'server' | 'language', U extends 'url'>(value: string, firstKey: T, secondKey: U) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [first = '', second = ''] = item.split('|');
      return {
        [firstKey]: first.trim(),
        [secondKey]: second.trim(),
      } as Record<T | U, string>;
    });
}

export default App;
