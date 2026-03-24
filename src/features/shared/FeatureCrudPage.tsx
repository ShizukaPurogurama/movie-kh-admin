import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isFirebaseReady } from '../../config/firebase';
import { useAdminData } from '../../app/AdminDataProvider';
import type { Category, Genre, Playlist, TvSchedule, TypeItem } from '../../types/admin';

type FeatureCrudPageProps = {
  featureTitle: string;
  basePath: string;
  mode: 'list' | 'add' | 'edit' | 'view';
};

const createEmptyPlaylist = (): Playlist => ({
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
  videos: [],
  categoryIds: [],
  typeIds: [],
  genreIds: [],
});

const createEmptyCategory = (): Category => ({
  categoryId: `cat-${Date.now()}`,
  name: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createEmptyType = (): TypeItem => ({
  typeId: `type-${Date.now()}`,
  name: '',
  description: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createEmptyGenre = (): Genre => ({
  genreId: `genre-${Date.now()}`,
  name: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createEmptySchedule = (): TvSchedule => ({
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

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

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

function resolveManualTimestamps<T extends { createdAt: string; updatedAt: string }>(next: T, existing?: T): T {
  const now = new Date().toISOString();
  const createdAt = next.createdAt || existing?.createdAt || now;
  const updatedAt = next.updatedAt || existing?.updatedAt || createdAt;

  return {
    ...next,
    createdAt,
    updatedAt,
  };
}

function parsePairs(value: string, firstKey: 'server' | 'language', secondKey: 'url') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [first = '', second = ''] = item.split('|');
      return {
        [firstKey]: first.trim(),
        [secondKey]: second.trim(),
      };
    });
}

function stringifyPairs(items: Array<{ [key: string]: string }>, firstKey: string, secondKey: string) {
  return items.map((item) => `${item[firstKey] ?? ''}|${item[secondKey] ?? ''}`).join(', ');
}

function toggleString(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type MultiSelectOption = {
  value: string;
  label: string;
};

function DateTimeField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        disabled={disabled}
        type="datetime-local"
        value={formatDateTimeInput(value)}
        onChange={(e) => onChange(parseDateTimeInput(e.target.value))}
      />
    </div>
  );
}

function ImagePreviewField({
  label,
  value,
  onChange,
  disabled,
  previewVariant = 'landscape',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  previewVariant?: 'landscape' | 'poster';
}) {
  const [hasError, setHasError] = useState(false);
  const trimmedValue = value.trim();
  const showPreview = Boolean(trimmedValue) && !hasError;

  useEffect(() => {
    setHasError(false);
  }, [trimmedValue]);

  return (
    <div className="form-group">
      <label>{label}</label>
      <input disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className={`image-preview-card ${previewVariant === 'poster' ? 'poster' : ''}`}>
        {showPreview ? (
          <img src={trimmedValue} alt={`${label} preview`} onError={() => setHasError(true)} />
        ) : (
          <div className="image-preview-placeholder">
            <strong>{trimmedValue ? 'Preview unavailable' : 'No image yet'}</strong>
            <span>
              {trimmedValue
                ? 'This image URL could not be loaded.'
                : 'Paste an image URL here to preview it instantly.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MultiSelectDropdown({
  dropdownId,
  openDropdownId,
  setOpenDropdownId,
  options,
  selected,
  onChange,
  disabled,
  placeholder,
}: {
  dropdownId: string;
  openDropdownId: string | null;
  setOpenDropdownId: (value: string | null) => void;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const open = openDropdownId === dropdownId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (!open || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const estimatedPanelHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    setOpenUp(spaceBelow < estimatedPanelHeight && spaceAbove > estimatedPanelHeight);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpenDropdownId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, setOpenDropdownId]);

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);

  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels.length} selected`;

  return (
    <div className={`multi-select ${open ? 'open' : ''} ${openUp ? 'open-up' : ''}`} ref={containerRef}>
      <button
        className="multi-select-trigger"
        type="button"
        disabled={disabled}
        onClick={() => setOpenDropdownId(open ? null : dropdownId)}
      >
        <span>{summary}</span>
        <span className="multi-select-caret">▾</span>
      </button>

      {open && !disabled && (
        <div className="multi-select-panel">
          <div className="multi-select-options">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <label key={option.value} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onChange(toggleString(selected, option.value))}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          <div className="multi-select-actions">
            <button className="btn-link" type="button" onClick={() => onChange([])}>Clear All</button>
            <button className="btn-primary" type="button" onClick={() => setOpenDropdownId(null)}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeatureCrudPage({ featureTitle, basePath, mode }: FeatureCrudPageProps) {
  const featureKey = basePath.replace('/', '');
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, setData, setMessage, stats, message } = useAdminData();

  const modeTitle =
    mode === 'list'
      ? `${featureTitle} List`
      : mode === 'add'
        ? `Add ${featureTitle}`
        : mode === 'edit'
          ? `Edit ${featureTitle}`
          : `View ${featureTitle}`;

  const record = useMemo(() => {
    if (featureKey === 'playlists') return data.playlists.find((item) => item.playlistId === id);
    if (featureKey === 'categories') return data.categories.find((item) => item.categoryId === id);
    if (featureKey === 'types') return data.types.find((item) => item.typeId === id);
    if (featureKey === 'genres') return data.genres.find((item) => item.genreId === id);
    if (featureKey === 'tv-schedule') return data.tvSchedule.find((item) => item.scheduleId === id);
    if (featureKey === 'site-config') return data.siteConfig;
    if (featureKey === 'dashboard') return { id: 'overview', message, stats };
    return null;
  }, [data, featureKey, id, message, stats]);

  const initialValue = useMemo(() => {
    if (featureKey === 'playlists') return (mode === 'add' ? createEmptyPlaylist() : record ?? createEmptyPlaylist()) as Playlist;
    if (featureKey === 'categories') return (mode === 'add' ? createEmptyCategory() : record ?? createEmptyCategory()) as Category;
    if (featureKey === 'types') return (mode === 'add' ? createEmptyType() : record ?? createEmptyType()) as TypeItem;
    if (featureKey === 'genres') return (mode === 'add' ? createEmptyGenre() : record ?? createEmptyGenre()) as Genre;
    if (featureKey === 'tv-schedule') return (mode === 'add' ? createEmptySchedule() : record ?? createEmptySchedule()) as TvSchedule;
    if (featureKey === 'site-config') return data.siteConfig;
    return { announcement: message };
  }, [mode, featureKey, data.siteConfig, message, record]);

  const [formState, setFormState] = useState<unknown>(initialValue);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [activeDropdownRow, setActiveDropdownRow] = useState<string | null>(null);
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, { top: number; left: number }>>({});

  useEffect(() => {
    setFormState(initialValue);
    setOpenDropdownId(null);
    setDeleteTarget(null);
  }, [initialValue]);

  const listRows = useMemo(() => {
    if (featureKey === 'dashboard') {
      return [
        { id: 'overview', name: 'Overview', meta: `${stats.playlists} playlists · ${stats.videos} videos` },
      ];
    }
    if (featureKey === 'playlists') {
      return data.playlists.map((item) => ({
        id: item.playlistId,
        name: item.title,
        meta: `${item.status} · ${item.totalEpisodes} episodes`,
      }));
    }
    if (featureKey === 'categories') {
      return data.categories.map((item) => ({ id: item.categoryId, name: item.name, meta: item.isActive ? 'active' : 'inactive' }));
    }
    if (featureKey === 'types') {
      return data.types.map((item) => ({ id: item.typeId, name: item.name, meta: item.isActive ? 'active' : 'inactive' }));
    }
    if (featureKey === 'genres') {
      return data.genres.map((item) => ({ id: item.genreId, name: item.name, meta: item.isActive ? 'active' : 'inactive' }));
    }
    if (featureKey === 'tv-schedule') {
      return data.tvSchedule.map((item) => ({ id: item.scheduleId, name: item.episodeTitle || item.scheduleId, meta: `${item.airDate} ${item.airTime}` }));
    }
    return [{ id: data.siteConfig.website.id, name: data.siteConfig.website.title, meta: data.siteConfig.website.version }];
  }, [data, featureKey, stats]);

  const subtitleLanguageOptions = ['Khmer', 'English', 'Thai', 'Chinese', 'Korean'];
  const qualityOptions: Playlist['availableQualities'] = ['360p', '480p', '720p', '1080p', '4K'];

  const handleSave = () => {
    try {
      if (featureKey === 'dashboard') {
        const payload = formState as { announcement?: string };
        setMessage(payload.announcement || 'Dashboard updated locally.');
        navigate(`${basePath}/list`);
        return;
      }

      if (featureKey === 'playlists') {
        const next = formState as Playlist;
        setData((current) => {
          const existing = current.playlists.find((item) => item.playlistId === next.playlistId);
          const exists = Boolean(existing);
          const nextWithTimestamps = resolveManualTimestamps(next, existing);
          const playlists = exists
            ? current.playlists.map((item) => (item.playlistId === next.playlistId ? nextWithTimestamps : item))
            : [...current.playlists, nextWithTimestamps];
          return { ...current, playlists };
        });
        setMessage(`Playlist ${next.title || next.playlistId} saved locally${isFirebaseReady ? ' and ready for Firebase sync.' : '.'}`);
      } else if (featureKey === 'categories') {
        const next = formState as Category;
        setData((current) => {
          const existing = current.categories.find((item) => item.categoryId === next.categoryId);
          const exists = Boolean(existing);
          const nextWithTimestamps = resolveManualTimestamps(next, existing);
          const categories = exists
            ? current.categories.map((item) => (item.categoryId === next.categoryId ? nextWithTimestamps : item))
            : [...current.categories, nextWithTimestamps];
          return { ...current, categories };
        });
        setMessage(`Category ${next.name || next.categoryId} saved locally.`);
      } else if (featureKey === 'types') {
        const next = formState as TypeItem;
        setData((current) => {
          const existing = current.types.find((item) => item.typeId === next.typeId);
          const exists = Boolean(existing);
          const nextWithTimestamps = resolveManualTimestamps(next, existing);
          const types = exists
            ? current.types.map((item) => (item.typeId === next.typeId ? nextWithTimestamps : item))
            : [...current.types, nextWithTimestamps];
          return { ...current, types };
        });
        setMessage(`Type ${next.name || next.typeId} saved locally.`);
      } else if (featureKey === 'genres') {
        const next = formState as Genre;
        setData((current) => {
          const existing = current.genres.find((item) => item.genreId === next.genreId);
          const exists = Boolean(existing);
          const nextWithTimestamps = resolveManualTimestamps(next, existing);
          const genres = exists
            ? current.genres.map((item) => (item.genreId === next.genreId ? nextWithTimestamps : item))
            : [...current.genres, nextWithTimestamps];
          return { ...current, genres };
        });
        setMessage(`Genre ${next.name || next.genreId} saved locally.`);
      } else if (featureKey === 'tv-schedule') {
        const next = formState as TvSchedule;
        setData((current) => {
          const existing = current.tvSchedule.find((item) => item.scheduleId === next.scheduleId);
          const exists = Boolean(existing);
          const nextWithTimestamps = resolveManualTimestamps(next, existing);
          const tvSchedule = exists
            ? current.tvSchedule.map((item) => (item.scheduleId === next.scheduleId ? nextWithTimestamps : item))
            : [...current.tvSchedule, nextWithTimestamps];
          return { ...current, tvSchedule };
        });
        setMessage(`Schedule ${next.scheduleId} saved locally.`);
      } else if (featureKey === 'site-config') {
        setData((current) => ({ ...current, siteConfig: formState as unknown as typeof current.siteConfig }));
        setMessage('Site configuration updated locally.');
      }

      navigate(`${basePath}/list`);
    } catch {
      setMessage('Unable to save record. Please check the form values and try again.');
    }
  };

  const canDelete = !['dashboard', 'site-config'].includes(featureKey);

  const handleDelete = (rowId: string) => {
    if (!canDelete) {
      return;
    }

    const row = listRows.find((item) => item.id === rowId);
    setDeleteTarget({ id: rowId, label: row?.name || rowId });
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    setData((current) => {
      if (featureKey === 'playlists') {
        return { ...current, playlists: current.playlists.filter((item) => item.playlistId !== deleteTarget.id) };
      }
      if (featureKey === 'categories') {
        return { ...current, categories: current.categories.filter((item) => item.categoryId !== deleteTarget.id) };
      }
      if (featureKey === 'types') {
        return { ...current, types: current.types.filter((item) => item.typeId !== deleteTarget.id) };
      }
      if (featureKey === 'genres') {
        return { ...current, genres: current.genres.filter((item) => item.genreId !== deleteTarget.id) };
      }
      if (featureKey === 'tv-schedule') {
        return { ...current, tvSchedule: current.tvSchedule.filter((item) => item.scheduleId !== deleteTarget.id) };
      }
      return current;
    });

    setMessage(`${featureTitle} ${deleteTarget.id} deleted.`);
    setDeleteTarget(null);
  };

  const readOnly = mode === 'view';

  return (
    <section className="route-page">
      <div className="main-header route-header">
        <h2>{modeTitle}</h2>
        <p className="section-description">
          {mode === 'list' && `Manage all ${featureTitle.toLowerCase()} records from this list page.`}
          {mode === 'add' && `Create a new ${featureTitle.toLowerCase()} record.`}
          {mode === 'edit' && `Update ${featureTitle.toLowerCase()} details${id ? ` for ID: ${id}` : ''}.`}
          {mode === 'view' && `Read-only details${id ? ` for ID: ${id}` : ''}.`}
        </p>
      </div>

      <div className="card route-card">
        <div className="route-toolbar">
          {mode === 'list' ? (
            <Link className="btn-primary route-link-btn" to={`${basePath}/add`}>
              Add new
            </Link>
          ) : (
            <>
              {mode !== 'view' && (
                <button className="btn-primary" type="button" onClick={handleSave}>
                  Save
                </button>
              )}
              <Link className="btn-secondary route-link-btn" to={`${basePath}/list`}>
                Back to list
              </Link>
            </>
          )}
        </div>

        {mode === 'list' ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Meta</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name || '-'}</td>
                    <td>{row.id}</td>
                    <td>{row.meta}</td>
                    <td>
                      <div className="table-actions">
                        <div className="action-dropdown">
                          <button 
                            className="action-btn dropdown-trigger" 
                            type="button" 
                            aria-label="Actions"
                            title="More actions"
                            aria-expanded={activeDropdownRow === row.id}
                            aria-haspopup="menu"
                            onClick={() => setActiveDropdownRow(activeDropdownRow === row.id ? null : row.id)}
                            onMouseEnter={() => setActiveDropdownRow(row.id)}
                            onMouseLeave={() => setActiveDropdownRow(null)}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                              <circle cx="12" cy="6" r="2" fill="currentColor"/>
                              <circle cx="12" cy="12" r="2" fill="currentColor"/>
                              <circle cx="12" cy="18" r="2" fill="currentColor"/>
                            </svg>
                          </button>
                          <div 
                            className={`dropdown-menu ${activeDropdownRow === row.id ? 'show' : ''}`}
                            role="menu"
                            aria-hidden={activeDropdownRow !== row.id}
                          >
                            <Link 
                              className="dropdown-item" 
                              to={`${basePath}/view/${row.id}`}
                              role="menuitem"
                              onClick={() => setActiveDropdownRow(null)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                              View Details
                            </Link>
                            <Link 
                              className="dropdown-item" 
                              to={`${basePath}/edit/${row.id}`}
                              role="menuitem"
                              onClick={() => setActiveDropdownRow(null)}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                <path d="M4 20l4.2-1 9.6-9.6-3.2-3.2L5 15.8 4 20z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                <path d="M13.6 6.4l3.2 3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                              Edit
                            </Link>
                            {featureKey === 'playlists' && (
                              <Link 
                                className="dropdown-item" 
                                to={`/episodes/list/${row.id}`}
                                role="menuitem"
                                onClick={() => setActiveDropdownRow(null)}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                  <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm4 2h4v2H10V8zm0 4h4v2H10v-2z" fill="currentColor" />
                                </svg>
                                Manage Episodes
                              </Link>
                            )}
                            {canDelete && (
                              <button 
                                className="dropdown-item danger" 
                                type="button" 
                                role="menuitem"
                                onClick={() => {
                                  handleDelete(row.id);
                                  setActiveDropdownRow(null);
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                                  <path d="M4 7h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                  <path d="M9 7V5h6v2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                  <path d="M8 7l1 12h6l1-12" fill="none" stroke="currentColor" strokeWidth="1.8" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : featureKey === 'playlists' ? (
          (() => {
            const playlist = formState as Playlist;
            return (
              <>
                <div className="form-grid">
                  <div className="form-group"><label>Playlist ID</label><input disabled={readOnly} readOnly value={playlist.playlistId} onChange={(e) => setFormState({ ...playlist, playlistId: e.target.value })} /></div>
                  <div className="form-group"><label>Title</label><input disabled={readOnly} value={playlist.title} onChange={(e) => setFormState({ ...playlist, title: e.target.value })} /></div>
                  <div className="form-group"><label>Season</label><input disabled={readOnly} type="number" value={playlist.season} onChange={(e) => setFormState({ ...playlist, season: Number(e.target.value) })} /></div>
                  <div className="form-group"><label>Total Episodes</label><input disabled={readOnly} type="number" value={playlist.totalEpisodes} onChange={(e) => setFormState({ ...playlist, totalEpisodes: Number(e.target.value) })} /></div>
                  <ImagePreviewField
                    label="Thumbnail URL"
                    value={playlist.thumbnailUrl}
                    onChange={(value) => setFormState({ ...playlist, thumbnailUrl: value })}
                    disabled={readOnly}
                  />
                  <ImagePreviewField
                    label="Poster URL"
                    value={playlist.posterUrl}
                    onChange={(value) => setFormState({ ...playlist, posterUrl: value })}
                    disabled={readOnly}
                    previewVariant="poster"
                  />
                  <div className="form-group"><label>Rating</label><input disabled={readOnly} value={playlist.rating} onChange={(e) => setFormState({ ...playlist, rating: e.target.value })} /></div>
                  <div className="form-group"><label>Duration (minutes)</label><input disabled={readOnly} type="number" value={playlist.duration} onChange={(e) => setFormState({ ...playlist, duration: Number(e.target.value) })} /></div>
                  <div className="form-group"><label>Release Date</label><input disabled={readOnly} type="date" value={playlist.releaseDate} onChange={(e) => setFormState({ ...playlist, releaseDate: e.target.value })} /></div>
                  <div className="form-group">
                    <label>Status</label>
                    <select disabled={readOnly} value={playlist.status} onChange={(e) => setFormState({ ...playlist, status: e.target.value as Playlist['status'] })}>
                      <option value="active">active</option><option value="inactive">inactive</option><option value="draft">draft</option><option value="upcoming">upcoming</option>
                    </select>
                  </div>
                  <DateTimeField label="Created Date" value={playlist.createdAt} onChange={(value) => setFormState({ ...playlist, createdAt: value })} disabled={readOnly} />
                  <DateTimeField label="Updated Date" value={playlist.updatedAt} onChange={(value) => setFormState({ ...playlist, updatedAt: value })} disabled={readOnly} />
                  <div className="form-group full-width"><label>Description</label><textarea disabled={readOnly} rows={3} value={playlist.description} onChange={(e) => setFormState({ ...playlist, description: e.target.value })} /></div>
                  <div className="form-group">
                    <label>Subtitle Languages</label>
                    <MultiSelectDropdown
                      dropdownId="subtitleLanguages"
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      disabled={readOnly}
                      options={subtitleLanguageOptions.map((language) => ({ value: language, label: language }))}
                      selected={playlist.subtitleLanguages}
                      onChange={(values) => setFormState({ ...playlist, subtitleLanguages: values })}
                      placeholder="Choose languages"
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Qualities</label>
                    <MultiSelectDropdown
                      dropdownId="availableQualities"
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      disabled={readOnly}
                      options={qualityOptions.map((quality) => ({ value: quality, label: quality }))}
                      selected={playlist.availableQualities}
                      onChange={(values) => setFormState({ ...playlist, availableQualities: values as Playlist['availableQualities'] })}
                      placeholder="Choose qualities"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category IDs</label>
                    <MultiSelectDropdown
                      dropdownId="categoryIds"
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      disabled={readOnly}
                      options={data.categories.map((category) => ({ value: category.categoryId, label: category.name }))}
                      selected={playlist.categoryIds}
                      onChange={(values) => setFormState({ ...playlist, categoryIds: values })}
                      placeholder="Choose categories"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type IDs</label>
                    <MultiSelectDropdown
                      dropdownId="typeIds"
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      disabled={readOnly}
                      options={data.types.map((type) => ({ value: type.typeId, label: type.name }))}
                      selected={playlist.typeIds}
                      onChange={(values) => setFormState({ ...playlist, typeIds: values })}
                      placeholder="Choose types"
                    />
                  </div>
                  <div className="form-group">
                    <label>Genre IDs</label>
                    <MultiSelectDropdown
                      dropdownId="genreIds"
                      openDropdownId={openDropdownId}
                      setOpenDropdownId={setOpenDropdownId}
                      disabled={readOnly}
                      options={data.genres.map((genre) => ({ value: genre.genreId, label: genre.name }))}
                      selected={playlist.genreIds}
                      onChange={(values) => setFormState({ ...playlist, genreIds: values })}
                      placeholder="Choose genres"
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label><input disabled={readOnly} type="checkbox" checked={playlist.isNew} onChange={(e) => setFormState({ ...playlist, isNew: e.target.checked })} />New</label>
                    <label><input disabled={readOnly} type="checkbox" checked={playlist.isTrending} onChange={(e) => setFormState({ ...playlist, isTrending: e.target.checked })} />Trending</label>
                    <label><input disabled={readOnly} type="checkbox" checked={playlist.isUpcoming} onChange={(e) => setFormState({ ...playlist, isUpcoming: e.target.checked })} />Upcoming</label>
                    <label><input disabled={readOnly} type="checkbox" checked={playlist.hasSubtitles} onChange={(e) => setFormState({ ...playlist, hasSubtitles: e.target.checked })} />Has subtitles</label>
                    <label><input disabled={readOnly} type="checkbox" checked={playlist.hasHD} onChange={(e) => setFormState({ ...playlist, hasHD: e.target.checked })} />Has HD</label>
                  </div>
                </div>

                <div className="nested-section">
                  <div className="nested-header">
                    <h4>Episodes</h4>
                    {!readOnly && (
                      <button className="btn-secondary" type="button" onClick={() => setFormState({ ...playlist, videos: [...playlist.videos, { videoId: `vid-${Date.now()}`, episode: 1, episodeTitle: '', sortOrder: 1, videoUrls: [], subtitleUrls: [], uploadDate: new Date().toISOString(), updatedDate: new Date().toISOString() }] })}>Add episode</button>
                    )}
                  </div>

                  {playlist.videos.map((video, index) => (
                    <div className="nested-card" key={`${video.videoId}-${index}`}>
                      <div className="nested-card-header">
                        <strong>Episode {index + 1}</strong>
                        {!readOnly && (
                          <button className="btn-link" type="button" onClick={() => setFormState({ ...playlist, videos: playlist.videos.filter((_, currentIndex) => currentIndex !== index) })}>Remove</button>
                        )}
                      </div>
                      <div className="form-grid compact">
                        <div className="form-group"><label>Video ID</label><input disabled={readOnly} value={video.videoId} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, videoId: e.target.value } : item)) })} /></div>
                        <div className="form-group"><label>Episode</label><input disabled={readOnly} type="number" value={video.episode} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, episode: Number(e.target.value) } : item)) })} /></div>
                        <div className="form-group"><label>Episode Title</label><input disabled={readOnly} value={video.episodeTitle} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, episodeTitle: e.target.value } : item)) })} /></div>
                        <div className="form-group"><label>Sort Order</label><input disabled={readOnly} type="number" value={video.sortOrder} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, sortOrder: Number(e.target.value) } : item)) })} /></div>
                        <div className="form-group full-width"><label>Streaming URLs (server|url)</label><input disabled={readOnly} value={stringifyPairs(video.videoUrls as unknown as Array<{ [key: string]: string }>, 'server', 'url')} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, videoUrls: parsePairs(e.target.value, 'server', 'url') } : item)) })} /></div>
                        <div className="form-group full-width"><label>Subtitle URLs (language|url)</label><input disabled={readOnly} value={stringifyPairs(video.subtitleUrls as unknown as Array<{ [key: string]: string }>, 'language', 'url')} onChange={(e) => setFormState({ ...playlist, videos: playlist.videos.map((item, currentIndex) => (currentIndex === index ? { ...item, subtitleUrls: parsePairs(e.target.value, 'language', 'url') } : item)) })} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()
        ) : featureKey === 'categories' || featureKey === 'types' || featureKey === 'genres' ? (
          (() => {
            const item = formState as Category | TypeItem | Genre;
            const idKey = featureKey === 'categories' ? 'categoryId' : featureKey === 'types' ? 'typeId' : 'genreId';
            return (
              <div className="form-grid">
                <div className="form-group"><label>{idKey}</label><input disabled={readOnly} readOnly value={String(((item as unknown as Record<string, unknown>)[idKey]) ?? '')} onChange={(e) => setFormState({ ...item, [idKey]: e.target.value })} /></div>
                <div className="form-group"><label>Name</label><input disabled={readOnly} value={item.name} onChange={(e) => setFormState({ ...item, name: e.target.value })} /></div>
                <div className="form-group"><label>Sort Order</label><input disabled={readOnly} type="number" value={item.sortOrder} onChange={(e) => setFormState({ ...item, sortOrder: Number(e.target.value) })} /></div>
                {'thumbnailUrl' in item && (
                  <div className="form-group"><label>Thumbnail URL</label><input disabled={readOnly} value={item.thumbnailUrl ?? ''} onChange={(e) => setFormState({ ...item, thumbnailUrl: e.target.value })} /></div>
                )}
                <DateTimeField label="Created Date" value={item.createdAt} onChange={(value) => setFormState({ ...item, createdAt: value })} disabled={readOnly} />
                <DateTimeField label="Updated Date" value={item.updatedAt} onChange={(value) => setFormState({ ...item, updatedAt: value })} disabled={readOnly} />
                <div className="form-group full-width"><label>Description</label><textarea disabled={readOnly} rows={4} value={item.description} onChange={(e) => setFormState({ ...item, description: e.target.value })} /></div>
                <div className="form-group checkbox-group">
                  <label><input disabled={readOnly} type="checkbox" checked={item.isActive} onChange={(e) => setFormState({ ...item, isActive: e.target.checked })} />Active</label>
                </div>
              </div>
            );
          })()
        ) : featureKey === 'tv-schedule' ? (
          (() => {
            const schedule = formState as TvSchedule;
            const selectedPlaylist = data.playlists.find((playlist) => playlist.playlistId === schedule.playlistId);
            return (
              <div className="form-grid">
                <div className="form-group"><label>Schedule ID</label><input disabled={readOnly} readOnly value={schedule.scheduleId} onChange={(e) => setFormState({ ...schedule, scheduleId: e.target.value })} /></div>
                <div className="form-group">
                  <label>Playlist</label>
                  <select
                    disabled={readOnly}
                    value={schedule.playlistId}
                    onChange={(e) => {
                      const nextPlaylistId = e.target.value;
                      const playlist = data.playlists.find((item) => item.playlistId === nextPlaylistId);
                      setFormState({ ...schedule, playlistId: nextPlaylistId, videoId: playlist?.videos[0]?.videoId ?? '' });
                    }}
                  >
                    <option value="">Select playlist</option>
                    {data.playlists.map((playlist) => (
                      <option key={playlist.playlistId} value={playlist.playlistId}>{playlist.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Video</label>
                  <select
                    disabled={readOnly || !selectedPlaylist}
                    value={schedule.videoId}
                    onChange={(e) => setFormState({ ...schedule, videoId: e.target.value })}
                  >
                    <option value="">Select video</option>
                    {(selectedPlaylist?.videos ?? []).map((video) => (
                      <option key={video.videoId} value={video.videoId}>
                        EP{video.episode}: {video.episodeTitle || video.videoId}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label>Air Date</label><input disabled={readOnly} type="date" value={schedule.airDate} onChange={(e) => setFormState({ ...schedule, airDate: e.target.value })} /></div>
                <div className="form-group"><label>Air Time</label><input disabled={readOnly} type="time" value={schedule.airTime} onChange={(e) => setFormState({ ...schedule, airTime: e.target.value })} /></div>
                <div className="form-group"><label>Duration</label><input disabled={readOnly} type="number" value={schedule.duration} onChange={(e) => setFormState({ ...schedule, duration: Number(e.target.value) })} /></div>
                <div className="form-group"><label>Episode Title</label><input disabled={readOnly} value={schedule.episodeTitle} onChange={(e) => setFormState({ ...schedule, episodeTitle: e.target.value })} /></div>
                <div className="form-group"><label>Episode Number</label><input disabled={readOnly} type="number" value={schedule.episodeNumber} onChange={(e) => setFormState({ ...schedule, episodeNumber: Number(e.target.value) })} /></div>
                <div className="form-group"><label>Season Number</label><input disabled={readOnly} type="number" value={schedule.seasonNumber} onChange={(e) => setFormState({ ...schedule, seasonNumber: Number(e.target.value) })} /></div>
                <div className="form-group"><label>Priority</label><input disabled={readOnly} type="number" value={schedule.priority} onChange={(e) => setFormState({ ...schedule, priority: Number(e.target.value) })} /></div>
                <DateTimeField label="Created Date" value={schedule.createdAt} onChange={(value) => setFormState({ ...schedule, createdAt: value })} disabled={readOnly} />
                <DateTimeField label="Updated Date" value={schedule.updatedAt} onChange={(value) => setFormState({ ...schedule, updatedAt: value })} disabled={readOnly} />
                <div className="form-group checkbox-group">
                  <label><input disabled={readOnly} type="checkbox" checked={schedule.isRepeat} onChange={(e) => setFormState({ ...schedule, isRepeat: e.target.checked })} />Repeat airing</label>
                  <label><input disabled={readOnly} type="checkbox" checked={schedule.isActive} onChange={(e) => setFormState({ ...schedule, isActive: e.target.checked })} />Active</label>
                </div>
              </div>
            );
          })()
        ) : featureKey === 'site-config' ? (
          (() => {
            const site = formState as typeof data.siteConfig;
            return (
              <div className="config-grid">
                <div className="config-card"><h4>Website</h4><div className="config-card-body">
                  <div className="form-group"><label>Title</label><input disabled={readOnly} value={site.website.title} onChange={(e) => setFormState({ ...site, website: { ...site.website, title: e.target.value } })} /></div>
                  <div className="form-group"><label>Version</label><input disabled={readOnly} value={site.website.version} onChange={(e) => setFormState({ ...site, website: { ...site.website, version: e.target.value } })} /></div>
                  <div className="form-group"><label>Logo URL</label><input disabled={readOnly} value={site.website.logoUrl} onChange={(e) => setFormState({ ...site, website: { ...site.website, logoUrl: e.target.value } })} /></div>
                  <div className="form-group"><label>Favicon URL</label><input disabled={readOnly} value={site.website.faviconUrl} onChange={(e) => setFormState({ ...site, website: { ...site.website, faviconUrl: e.target.value } })} /></div>
                  <div className="form-group"><label>Meta Title</label><input disabled={readOnly} value={site.website.metaTitle} onChange={(e) => setFormState({ ...site, website: { ...site.website, metaTitle: e.target.value } })} /></div>
                  <div className="form-group"><label>Meta Description</label><textarea disabled={readOnly} rows={3} value={site.website.metaDescription} onChange={(e) => setFormState({ ...site, website: { ...site.website, metaDescription: e.target.value } })} /></div>
                  <div className="form-group checkbox-group"><label><input disabled={readOnly} type="checkbox" checked={site.website.maintenanceMode} onChange={(e) => setFormState({ ...site, website: { ...site.website, maintenanceMode: e.target.checked } })} />Maintenance Mode</label></div>
                  <div className="form-group"><label>Maintenance Message</label><textarea disabled={readOnly} rows={3} value={site.website.maintenanceMessage} onChange={(e) => setFormState({ ...site, website: { ...site.website, maintenanceMessage: e.target.value } })} /></div>
                </div></div>

                <div className="config-card"><h4>Social</h4><div className="config-card-body">
                  <div className="form-group"><label>Email</label><input disabled={readOnly} value={site.social.email} onChange={(e) => setFormState({ ...site, social: { ...site.social, email: e.target.value } })} /></div>
                  <div className="form-group"><label>Phone</label><input disabled={readOnly} value={site.social.phoneNumber} onChange={(e) => setFormState({ ...site, social: { ...site.social, phoneNumber: e.target.value } })} /></div>
                  <div className="form-group"><label>Telegram</label><input disabled={readOnly} value={site.social.telegram} onChange={(e) => setFormState({ ...site, social: { ...site.social, telegram: e.target.value } })} /></div>
                  <div className="form-group"><label>Instagram</label><input disabled={readOnly} value={site.social.instagram} onChange={(e) => setFormState({ ...site, social: { ...site.social, instagram: e.target.value } })} /></div>
                  <div className="form-group"><label>Facebook</label><input disabled={readOnly} value={site.social.facebook} onChange={(e) => setFormState({ ...site, social: { ...site.social, facebook: e.target.value } })} /></div>
                  <div className="form-group"><label>YouTube</label><input disabled={readOnly} value={site.social.youtube} onChange={(e) => setFormState({ ...site, social: { ...site.social, youtube: e.target.value } })} /></div>
                </div></div>

                <div className="config-card"><h4>About Us</h4><div className="config-card-body">
                  <div className="form-group"><label>Description</label><textarea disabled={readOnly} rows={4} value={site.aboutus.description} onChange={(e) => setFormState({ ...site, aboutus: { ...site.aboutus, description: e.target.value } })} /></div>
                  <div className="form-group"><label>Mission</label><textarea disabled={readOnly} rows={3} value={site.aboutus.mission} onChange={(e) => setFormState({ ...site, aboutus: { ...site.aboutus, mission: e.target.value } })} /></div>
                  <div className="form-group"><label>Vision</label><textarea disabled={readOnly} rows={3} value={site.aboutus.vision} onChange={(e) => setFormState({ ...site, aboutus: { ...site.aboutus, vision: e.target.value } })} /></div>
                </div></div>
              </div>
            );
          })()
        ) : (
          <div className="route-empty-state">
            <p>Dashboard controls</p>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Sidebar message</label>
              <textarea disabled={readOnly} rows={4} value={String((formState as { announcement?: string }).announcement ?? '')} onChange={(e) => setFormState({ announcement: e.target.value })} />
            </div>
            <p>Stats: {stats.playlists} playlists, {stats.videos} videos, {stats.schedules} schedules.</p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>Delete confirmation</h3>
            <p>
              You are about to delete <strong>{deleteTarget.label}</strong>.
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
