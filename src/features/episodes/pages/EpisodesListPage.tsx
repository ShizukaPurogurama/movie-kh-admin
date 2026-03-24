import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminData } from '../../../app/AdminDataProvider';
import type { Playlist, Video } from '../../../types/admin';

// Import styles
import '../../../styles.css';

export default function EpisodesListPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { data, setData, setMessage } = useAdminData();
  
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const playlist = useMemo(() => {
    return data.playlists.find(p => p.playlistId === playlistId);
  }, [data.playlists, playlistId]);

  const episodes = useMemo(() => {
    return playlist?.videos || [];
  }, [playlist]);

  const handleDelete = (videoId: string) => {
    const video = episodes.find(v => v.videoId === videoId);
    setDeleteTarget({ 
      id: videoId, 
      label: `Episode ${video?.episode}: ${video?.episodeTitle || videoId}` 
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget || !playlist) {
      return;
    }

    const updatedVideos = playlist.videos.filter(v => v.videoId !== deleteTarget.id);
    
    // Update the playlist with the filtered videos
    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    
    // Update the data
    const updatedPlaylists = data.playlists.map(p => 
      p.playlistId === playlist.playlistId ? updatedPlaylist : p
    );

    setData({ ...data, playlists: updatedPlaylists });
    setMessage(`Episode ${deleteTarget.label} deleted from ${playlist.title}`);
    setDeleteTarget(null);
  };

  if (!playlistId) {
    return (
      <div className="route-page">
        <div className="main-header route-header">
          <h2>Episode Management</h2>
          <p className="section-description">Select a playlist to manage its episodes</p>
        </div>
        <div className="card route-card">
          <div className="route-empty-state">
            <p>Please select a playlist to manage its episodes.</p>
            <p>Episodes are managed per playlist, so you need to choose which playlist's episodes you want to view or edit.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Link to="/playlists/list" className="btn-primary">
                View All Playlists
              </Link>
              <Link to="/playlists/list" className="btn-secondary">
                Go to Playlists
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="route-page">
        <div className="main-header route-header">
          <h2>Episodes</h2>
          <p className="section-description">Playlist not found</p>
        </div>
        <div className="card route-card">
          <div className="route-empty-state">
            <p>Playlist with ID "{playlistId}" not found.</p>
            <Link to="/playlists/list" className="btn-primary" style={{ marginTop: '16px' }}>
              Back to Playlists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="route-page">
      <div className="main-header route-header">
        <h2>Episodes - {playlist.title}</h2>
        <p className="section-description">
          Manage episodes for playlist: {playlist.title} (Season {playlist.season})
        </p>
      </div>

      <div className="card route-card">
        <div className="route-toolbar">
          <Link 
            className="btn-primary route-link-btn" 
            to={`/episodes/add/${playlistId}`}
          >
            Add Episode
          </Link>
          <Link 
            className="btn-secondary route-link-btn" 
            to={`/playlists/edit/${playlistId}`}
          >
            Back to Playlist
          </Link>
        </div>

        {episodes.length === 0 ? (
          <div className="route-empty-state">
            <p>No episodes found for this playlist.</p>
            <p>Add your first episode to get started.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Episode</th>
                  <th>Title</th>
                  <th>Video ID</th>
                  <th>Sort Order</th>
                  <th>Streaming URLs</th>
                  <th>Upload Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((video) => (
                  <tr key={video.videoId}>
                    <td>
                      <strong>EP {video.episode}</strong>
                    </td>
                    <td>{video.episodeTitle || '-'}</td>
                    <td>
                      <code style={{ fontSize: '0.85rem', background: '#1e293b', padding: '2px 6px', borderRadius: '4px' }}>
                        {video.videoId}
                      </code>
                    </td>
                    <td>{video.sortOrder}</td>
                    <td>
                      {video.videoUrls.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {video.videoUrls.map((url, index) => (
                            <span key={index} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                              {(url.server || `Server ${index + 1}`)}: {url.url}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>{new Date(video.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <div className="action-dropdown">
                          <button 
                            className="action-btn dropdown-trigger" 
                            type="button" 
                            aria-label="Actions"
                            title="More actions"
                            aria-expanded={activeDropdownRow === video.videoId}
                            aria-haspopup="menu"
                            onClick={() => setActiveDropdownRow(activeDropdownRow === video.videoId ? null : video.videoId)}
                            onMouseEnter={() => setActiveDropdownRow(video.videoId)}
                            onMouseLeave={() => setActiveDropdownRow(null)}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                              <circle cx="12" cy="6" r="2" fill="currentColor"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              <circle cx="12" cy="18" r="2" fill="currentColor"/>
                            </svg>
                          </button>
                          <div 
                            className={`dropdown-menu ${activeDropdownRow === video.videoId ? 'show' : ''}`}
                            role="menu"
                            aria-hidden={activeDropdownRow !== video.videoId}
                          >
                            <Link 
                              className="dropdown-item" 
                              to={`/episodes/edit/${playlistId}/${video.videoId}`}
                              role="menuitem"
                              onClick={() => setActiveDropdownRow(null)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path d="M4 20l4.2-1 9.6-9.6-3.2-3.2L5 15.8 4 20z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M13.6 6.4l3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                              Edit Episode
                            </Link>
                            <button 
                              className="dropdown-item danger" 
                              type="button" 
                              role="menuitem"
                              onClick={() => {
                                handleDelete(video.videoId);
                                setActiveDropdownRow(null);
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path d="M4 7h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M9 7V5h6v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M8 7l1 12h6l1-12" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                              Delete Episode
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Episode</h3>
            <p>
              You are about to delete <strong>{deleteTarget.label}</strong> from {playlist.title}.
            </p>
            <p>This action cannot be undone.</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" type="button" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={confirmDelete}>
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
