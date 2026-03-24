import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminData } from '../../../app/AdminDataProvider';
import type { Video } from '../../../types/admin';
import StreamingServersEditor from '../components/StreamingServersEditor';
import { parseSubtitleUrls, sanitizeVideoUrls, stringifyPairs } from '../../../utils/episodeMedia';

// Import styles
import '../../../styles.css';

function formatDateTimeInput(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function parseDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : '';
}

export default function EpisodesAddPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { data, setData, setMessage } = useAdminData();
  
  const playlist = useMemo(() => {
    return data.playlists.find(p => p.playlistId === playlistId);
  }, [data.playlists, playlistId]);

  const [formState, setFormState] = useState<Video>({
    videoId: `vid-${Date.now()}`,
    episode: 1,
    episodeTitle: '',
    sortOrder: 1,
    videoUrls: [],
    subtitleUrls: [],
    uploadDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  });

  const handleSave = () => {
    if (!playlist) {
      setMessage('Playlist not found. Cannot add episode.');
      return;
    }

    const nextVideo = {
      ...formState,
      videoUrls: sanitizeVideoUrls(formState.videoUrls),
      uploadDate: formState.uploadDate || new Date().toISOString(),
      updatedDate: formState.updatedDate || formState.uploadDate || new Date().toISOString(),
    };

    const updatedVideos = [...playlist.videos, nextVideo];
    const updatedPlaylist = { ...playlist, videos: updatedVideos };
    
    const updatedPlaylists = data.playlists.map(p => 
      p.playlistId === playlist.playlistId ? updatedPlaylist : p
    );

    setData({ ...data, playlists: updatedPlaylists });
    setMessage(`Episode ${nextVideo.episode}: ${nextVideo.episodeTitle || 'Untitled'} added to ${playlist.title}`);
    navigate(`/episodes/list/${playlistId}`);
  };

  if (!playlist) {
    return (
      <div className="route-page">
        <div className="main-header route-header">
          <h2>Add Episode</h2>
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
        <h2>Add Episode - {playlist.title}</h2>
        <p className="section-description">
          Add a new episode to playlist: {playlist.title} (Season {playlist.season})
        </p>
      </div>

      <div className="card route-card">
        <div className="route-toolbar">
          <button className="btn-primary" type="button" onClick={handleSave}>
            Save Episode
          </button>
          <Link className="btn-secondary route-link-btn" to={`/episodes/list/${playlistId}`}>
            Back to Episodes
          </Link>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Video ID</label>
            <input 
              value={formState.videoId} 
              onChange={(e) => setFormState({ ...formState, videoId: e.target.value })}
              placeholder="e.g., vid-1234567890"
            />
          </div>
          <div className="form-group">
            <label>Episode Number</label>
            <input 
              type="number" 
              value={formState.episode} 
              onChange={(e) => setFormState({ ...formState, episode: Number(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Episode Title</label>
            <input 
              value={formState.episodeTitle} 
              onChange={(e) => setFormState({ ...formState, episodeTitle: e.target.value })}
              placeholder="e.g., The Beginning"
            />
          </div>
          <div className="form-group">
            <label>Sort Order</label>
            <input 
              type="number" 
              value={formState.sortOrder} 
              onChange={(e) => setFormState({ ...formState, sortOrder: Number(e.target.value) })}
            />
          </div>
          <StreamingServersEditor
            value={formState.videoUrls}
            onChange={(videoUrls) => setFormState({ ...formState, videoUrls })}
          />
          <div className="form-group full-width">
            <label>Subtitle URLs (language|url)</label>
            <input 
              value={stringifyPairs(formState.subtitleUrls as unknown as Array<{ language: string; url: string }>, 'language', 'url')}
              onChange={(e) => setFormState({ ...formState, subtitleUrls: parseSubtitleUrls(e.target.value) })}
              placeholder="e.g., khmer|https://example.com/subs/khmer.vtt, english|https://example.com/subs/english.vtt"
            />
          </div>
          <div className="form-group">
            <label>Upload Date</label>
            <input 
              type="datetime-local"
              value={formatDateTimeInput(formState.uploadDate)}
              onChange={(e) => setFormState({ ...formState, uploadDate: parseDateTimeInput(e.target.value) })}
            />
          </div>
          <div className="form-group">
            <label>Updated Date</label>
            <input 
              type="datetime-local"
              value={formatDateTimeInput(formState.updatedDate)}
              onChange={(e) => setFormState({ ...formState, updatedDate: parseDateTimeInput(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
