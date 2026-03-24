import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { database, isFirebaseReady } from '../config/firebase';
import { initialData } from '../data/initialData';
import type { AdminData, DashboardStats } from '../types/admin';
import { normalizeVideoUrls } from '../utils/episodeMedia';

type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
};

function inferToastTone(message: string): ToastTone {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('failed') ||
    normalized.includes('error') ||
    normalized.includes('unable') ||
    normalized.includes('not found') ||
    normalized.includes('cannot')
  ) {
    return 'error';
  }

  if (
    normalized.includes('saved') ||
    normalized.includes('updated') ||
    normalized.includes('added') ||
    normalized.includes('deleted') ||
    normalized.includes('connected') ||
    normalized.includes('initialized')
  ) {
    return 'success';
  }

  return 'info';
}

function normalizeAdminData(value: unknown): AdminData {
  const incoming = (value ?? {}) as Partial<AdminData>;

  return {
    playlists: Array.isArray(incoming.playlists)
      ? incoming.playlists.map((playlist) => ({
          ...playlist,
          videos: Array.isArray(playlist.videos)
            ? playlist.videos.map((video) => ({
                ...video,
                videoUrls: normalizeVideoUrls(video.videoUrls),
                subtitleUrls: Array.isArray(video.subtitleUrls) ? video.subtitleUrls : [],
              }))
            : [],
          subtitleLanguages: Array.isArray(playlist.subtitleLanguages) ? playlist.subtitleLanguages : [],
          availableQualities: Array.isArray(playlist.availableQualities) ? playlist.availableQualities : [],
          categoryIds: Array.isArray(playlist.categoryIds) ? playlist.categoryIds : [],
          typeIds: Array.isArray(playlist.typeIds) ? playlist.typeIds : [],
          genreIds: Array.isArray(playlist.genreIds) ? playlist.genreIds : [],
        }))
      : initialData.playlists,
    categories: Array.isArray(incoming.categories) ? incoming.categories : initialData.categories,
    types: Array.isArray(incoming.types) ? incoming.types : initialData.types,
    genres: Array.isArray(incoming.genres) ? incoming.genres : initialData.genres,
    tvSchedule: Array.isArray(incoming.tvSchedule) ? incoming.tvSchedule : initialData.tvSchedule,
    siteConfig: {
      social: {
        ...initialData.siteConfig.social,
        ...(incoming.siteConfig?.social ?? {}),
      },
      aboutus: {
        ...initialData.siteConfig.aboutus,
        ...(incoming.siteConfig?.aboutus ?? {}),
      },
      website: {
        ...initialData.siteConfig.website,
        ...(incoming.siteConfig?.website ?? {}),
      },
    },
  };
}

type AdminDataContextValue = {
  data: AdminData;
  setData: Dispatch<SetStateAction<AdminData>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
  stats: DashboardStats;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>(initialData);
  const [message, setMessageState] = useState('Loaded local admin workspace.');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const hasHydratedRef = useRef(false);
  const messageRef = useRef(message);
  const skipNextPushRef = useRef(false);
  const toastIdRef = useRef(0);
  const toastTimeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timeout = toastTimeoutsRef.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete toastTimeoutsRef.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (nextMessage: string) => {
      const trimmedMessage = nextMessage.trim();

      if (!trimmedMessage) {
        return;
      }

      const id = ++toastIdRef.current;
      const nextToast: ToastItem = {
        id,
        message: trimmedMessage,
        tone: inferToastTone(trimmedMessage),
      };

      setToasts((current) => [...current.slice(-3), nextToast]);
      toastTimeoutsRef.current[id] = setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast]
  );

  const setMessage = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      const nextMessage = typeof value === 'function' ? value(messageRef.current) : value;
      messageRef.current = nextMessage;
      setMessageState(nextMessage);
      pushToast(nextMessage);
    },
    [pushToast]
  );

  useEffect(() => {
    return () => {
      Object.values(toastTimeoutsRef.current).forEach((timeout) => clearTimeout(timeout));
      toastTimeoutsRef.current = {};
    };
  }, []);

  useEffect(() => {
    if (!database || !isFirebaseReady) {
      return;
    }

    const adminDataRef = ref(database, 'adminData');

    const unsubscribe = onValue(
      adminDataRef,
      (snapshot) => {
        const remoteData = snapshot.val() as AdminData | null;

        if (remoteData) {
          skipNextPushRef.current = true;
          setData(normalizeAdminData(remoteData));
          if (!hasHydratedRef.current) {
            setMessage('Realtime Database connected.');
          }
        } else {
          void set(adminDataRef, initialData)
            .then(() => {
              if (!hasHydratedRef.current) {
                setMessage('Realtime Database initialized with starter data.');
              }
            })
            .catch(() => {
              setMessage('Firebase connected, but failed to initialize starter data.');
            });
        }

        hasHydratedRef.current = true;
      },
      () => {
        setMessage('Firebase subscription error. Working in local mode.');
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!database || !isFirebaseReady || !hasHydratedRef.current) {
      return;
    }

    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    const adminDataRef = ref(database, 'adminData');

    void set(adminDataRef, data).catch(() => {
      setMessage('Failed to sync latest changes to Firebase. Changes remain local.');
    });
  }, [data]);

  const stats = useMemo<DashboardStats>(
    () => ({
      playlists: Array.isArray(data.playlists) ? data.playlists.length : 0,
      videos: Array.isArray(data.playlists)
        ? data.playlists.reduce((total, playlist) => total + (Array.isArray(playlist.videos) ? playlist.videos.length : 0), 0)
        : 0,
      categories: Array.isArray(data.categories) ? data.categories.length : 0,
      genres: Array.isArray(data.genres) ? data.genres.length : 0,
      schedules: Array.isArray(data.tvSchedule) ? data.tvSchedule.length : 0,
    }),
    [data]
  );

  return (
    <AdminDataContext.Provider
      value={{
        data,
        setData,
        message,
        setMessage,
        toasts,
        dismissToast,
        stats,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider');
  }
  return context;
}
