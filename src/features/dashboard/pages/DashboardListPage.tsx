import { useEffect, useMemo, useState } from 'react';
import { useAdminData } from '../../../app/AdminDataProvider';
import type { Category, Genre, Playlist, TvSchedule } from '../../../types/admin';
import '../../../styles.css';

export default function DashboardListPage() {
  const { data, setMessage, stats, message } = useAdminData();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const recentActivity = useMemo(() => {
    const items = [];

    // Get recent playlists
    const recentPlaylists = [...data.playlists]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    // Get recent schedules
    const recentSchedules = [...data.tvSchedule]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    // Get recent categories
    const recentCategories = [...data.categories]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return {
      playlists: recentPlaylists,
      schedules: recentSchedules,
      categories: recentCategories,
    };
  }, [data]);

  const statusSummary = useMemo(() => {
    const activePlaylists = data.playlists.filter(p => p.status === 'active').length;
    const draftPlaylists = data.playlists.filter(p => p.status === 'draft').length;
    const upcomingPlaylists = data.playlists.filter(p => p.status === 'upcoming').length;
    
    const activeSchedules = data.tvSchedule.filter(s => s.isActive).length;
    const inactiveSchedules = data.tvSchedule.filter(s => !s.isActive).length;
    
    const activeCategories = data.categories.filter(c => c.isActive).length;
    const activeGenres = data.genres.filter(g => g.isActive).length;

    return {
      playlists: { active: activePlaylists, draft: draftPlaylists, upcoming: upcomingPlaylists },
      schedules: { active: activeSchedules, inactive: inactiveSchedules },
      categories: { active: activeCategories },
      genres: { active: activeGenres },
    };
  }, [data]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your media management system</p>
        </div>
        <div className="dashboard-time">
          <div className="time-display">
            <span className="time">{formatTime(time)}</span>
            <span className="date">{formatDate(time)}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Key Metrics */}
        <div className="dashboard-card metrics-card">
          <h2>Key Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-icon playlist-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <div className="metric-value">{stats.playlists}</div>
                <div className="metric-label">Playlists</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon video-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M2 3h19a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1zm1 2v14a1 1 0 0 0 1 1h16v-2H4V5zm17 2v10l-4-2.5L19 7z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <div className="metric-value">{stats.videos}</div>
                <div className="metric-label">Videos</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon category-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M4 5h16v2H4zM4 10h10v2H4zM4 15h16v2H4z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <div className="metric-value">{stats.categories}</div>
                <div className="metric-label">Categories</div>
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-icon schedule-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <div className="metric-value">{stats.schedules}</div>
                <div className="metric-label">Schedules</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="dashboard-card status-card">
          <h2>Status Overview</h2>
          <div className="status-grid">
            <div className="status-section">
              <h3>Playlists</h3>
              <div className="status-items">
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Active: {statusSummary.playlists.active}</span>
                </div>
                <div className="status-item">
                  <span className="status-dot draft"></span>
                  <span>Draft: {statusSummary.playlists.draft}</span>
                </div>
                <div className="status-item">
                  <span className="status-dot upcoming"></span>
                  <span>Upcoming: {statusSummary.playlists.upcoming}</span>
                </div>
              </div>
            </div>
            <div className="status-section">
              <h3>Schedules</h3>
              <div className="status-items">
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Active: {statusSummary.schedules.active}</span>
                </div>
                <div className="status-item">
                  <span className="status-dot inactive"></span>
                  <span>Inactive: {statusSummary.schedules.inactive}</span>
                </div>
              </div>
            </div>
            <div className="status-section">
              <h3>Content</h3>
              <div className="status-items">
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Categories: {statusSummary.categories.active}</span>
                </div>
                <div className="status-item">
                  <span className="status-dot active"></span>
                  <span>Genres: {statusSummary.genres.active}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card">
          <h2>Recent Activity</h2>
          <div className="activity-tabs">
            <div className="activity-tab active">
              <h3>Recent Playlists</h3>
              <div className="activity-list">
                {recentActivity.playlists.length === 0 ? (
                  <div className="empty-state">No recent playlists</div>
                ) : (
                  recentActivity.playlists.map((playlist) => (
                    <div key={playlist.playlistId} className="activity-item">
                      <div className="activity-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{playlist.title}</div>
                        <div className="activity-meta">
                          <span className={`status-badge ${playlist.status}`}>{playlist.status}</span>
                          <span className="activity-time">Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="activity-tab">
              <h3>Recent Schedules</h3>
              <div className="activity-list">
                {recentActivity.schedules.length === 0 ? (
                  <div className="empty-state">No recent schedules</div>
                ) : (
                  recentActivity.schedules.map((schedule) => (
                    <div key={schedule.scheduleId} className="activity-item">
                      <div className="activity-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">Episode {schedule.episodeNumber} - {schedule.episodeTitle}</div>
                        <div className="activity-meta">
                          <span className={`status-badge ${schedule.isActive ? 'active' : 'inactive'}`}>{schedule.isActive ? 'Active' : 'Inactive'}</span>
                          <span className="activity-time">Updated {new Date(schedule.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="activity-tab">
              <h3>Recent Categories</h3>
              <div className="activity-list">
                {recentActivity.categories.length === 0 ? (
                  <div className="empty-state">No recent categories</div>
                ) : (
                  recentActivity.categories.map((category) => (
                    <div key={category.categoryId} className="activity-item">
                      <div className="activity-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                          <path d="M4 5h16v2H4zM4 10h10v2H4zM4 15h16v2H4z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{category.name}</div>
                        <div className="activity-meta">
                          <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>{category.isActive ? 'Active' : 'Inactive'}</span>
                          <span className="activity-time">Updated {new Date(category.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <LinkButton to="/playlists/add" icon="playlist" label="Add New Playlist" />
            <LinkButton to="/categories/add" icon="category" label="Add New Category" />
            <LinkButton to="/genres/add" icon="genre" label="Add New Genre" />
            <LinkButton to="/tv-schedule/add" icon="schedule" label="Add Schedule" />
            <LinkButton to="/site-config/edit" icon="config" label="Site Configuration" />
            <LinkButton to="/dashboard/view" icon="view" label="View Dashboard" />
          </div>
        </div>

        {/* System Status */}
        <div className="dashboard-card status-indicator-card">
          <h2>System Status</h2>
          <div className="status-indicators">
            <div className="status-indicator">
              <div className="status-dot system"></div>
              <div className="status-text">
                <div className="status-title">Firebase Connection</div>
                <div className="status-detail">{isFirebaseReady ? 'Connected' : 'Local Mode'}</div>
              </div>
            </div>
            <div className="status-indicator">
              <div className="status-dot data"></div>
              <div className="status-text">
                <div className="status-title">Data Sync</div>
                <div className="status-detail">{message}</div>
              </div>
            </div>
            <div className="status-indicator">
              <div className="status-dot time"></div>
              <div className="status-text">
                <div className="status-title">Last Updated</div>
                <div className="status-detail">{formatTime(time)} - {formatDate(time)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="dashboard-card overview-card">
          <h2>Content Overview</h2>
          <div className="overview-stats">
            <div className="overview-item">
              <div className="overview-value">{data.playlists.filter(p => p.isTrending).length}</div>
              <div className="overview-label">Trending</div>
            </div>
            <div className="overview-item">
              <div className="overview-value">{data.playlists.filter(p => p.isNew).length}</div>
              <div className="overview-label">New Releases</div>
            </div>
            <div className="overview-item">
              <div className="overview-value">{data.playlists.filter(p => p.hasHD).length}</div>
              <div className="overview-label">HD Content</div>
            </div>
            <div className="overview-item">
              <div className="overview-value">{data.playlists.filter(p => p.hasSubtitles).length}</div>
              <div className="overview-label">Subtitled</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component for quick action buttons
function LinkButton({ to, icon, label }: { to: string; icon: string; label: string }) {
  const getIcon = () => {
    switch (icon) {
      case 'playlist':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        );
      case 'category':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M4 5h16v2H4zM4 10h10v2H4zM4 15h16v2H4z" fill="currentColor"/>
          </svg>
        );
      case 'genre':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        );
      case 'schedule':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
        );
      case 'config':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm0 2.5c-4.69 0-8.5 3.81-8.5 8.5h17c0-4.69-3.81-8.5-8.5-8.5z" fill="currentColor"/>
          </svg>
        );
      case 'view':
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <a href={to} className="action-button">
      <div className="action-icon">{getIcon()}</div>
      <div className="action-label">{label}</div>
    </a>
  );
}

// Import isFirebaseReady from firebase config
import { isFirebaseReady } from '../../../config/firebase';