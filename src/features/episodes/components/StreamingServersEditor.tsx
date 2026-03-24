import type { VideoUrl } from '../../../types/admin';
import { createVideoUrl, getEditableVideoUrls } from '../../../utils/episodeMedia';

type StreamingServersEditorProps = {
  value: VideoUrl[];
  onChange: (value: VideoUrl[]) => void;
};

export default function StreamingServersEditor({ value, onChange }: StreamingServersEditorProps) {
  const serverRows = getEditableVideoUrls(value);

  const updateServer = (index: number, patch: Partial<VideoUrl>) => {
    onChange(serverRows.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  };

  const addServer = () => {
    onChange([...serverRows, createVideoUrl(serverRows.length)]);
  };

  const removeServer = (index: number) => {
    const remainingServers = serverRows.filter((_, currentIndex) => currentIndex !== index);
    onChange(remainingServers);
  };

  return (
    <div className="form-group full-width">
      <div className="media-editor-header">
        <div>
          <p className="media-editor-label">Streaming Servers</p>
          <p className="form-hint">One server per row. Add another row for backup or alternate links.</p>
        </div>

        <button className="btn-secondary" type="button" onClick={addServer}>
          Add Server
        </button>
      </div>

      <div className="media-editor-list">
        {serverRows.map((item, index) => (
          <div className="media-editor-row" key={`${item.server}-${index}`}>
            <div className="form-group">
              <label htmlFor={`stream-server-name-${index}`}>Server Name</label>
              <input
                id={`stream-server-name-${index}`}
                value={item.server}
                onChange={(event) => updateServer(index, { server: event.target.value })}
                placeholder={`Server ${index + 1}`}
              />
            </div>

            <div className="form-group">
              <label htmlFor={`stream-server-url-${index}`}>Streaming URL</label>
              <input
                id={`stream-server-url-${index}`}
                value={item.url}
                onChange={(event) => updateServer(index, { url: event.target.value })}
                placeholder="https://cdn.example.com/episode.m3u8"
              />
            </div>

            <button className="btn-link media-editor-remove" type="button" onClick={() => removeServer(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
