import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './AppShell';
import { AdminDataProvider } from './AdminDataProvider';
import DashboardAddPage from '../features/dashboard/pages/DashboardAddPage';
import DashboardEditPage from '../features/dashboard/pages/DashboardEditPage';
import DashboardListPage from '../features/dashboard/pages/DashboardListPage';
import DashboardViewPage from '../features/dashboard/pages/DashboardViewPage';
import PlaylistsAddPage from '../features/playlists/pages/PlaylistsAddPage';
import PlaylistsEditPage from '../features/playlists/pages/PlaylistsEditPage';
import PlaylistsListPage from '../features/playlists/pages/PlaylistsListPage';
import PlaylistsViewPage from '../features/playlists/pages/PlaylistsViewPage';
import EpisodesListPage from '../features/episodes/pages/EpisodesListPage';
import EpisodesAddPage from '../features/episodes/pages/EpisodesAddPage';
import EpisodesEditPage from '../features/episodes/pages/EpisodesEditPage';
import CategoriesAddPage from '../features/categories/pages/CategoriesAddPage';
import CategoriesEditPage from '../features/categories/pages/CategoriesEditPage';
import CategoriesListPage from '../features/categories/pages/CategoriesListPage';
import CategoriesViewPage from '../features/categories/pages/CategoriesViewPage';
import TypesAddPage from '../features/types/pages/TypesAddPage';
import TypesEditPage from '../features/types/pages/TypesEditPage';
import TypesListPage from '../features/types/pages/TypesListPage';
import TypesViewPage from '../features/types/pages/TypesViewPage';
import GenresAddPage from '../features/genres/pages/GenresAddPage';
import GenresEditPage from '../features/genres/pages/GenresEditPage';
import GenresListPage from '../features/genres/pages/GenresListPage';
import GenresViewPage from '../features/genres/pages/GenresViewPage';
import TvScheduleAddPage from '../features/tv-schedule/pages/TvScheduleAddPage';
import TvScheduleEditPage from '../features/tv-schedule/pages/TvScheduleEditPage';
import TvScheduleListPage from '../features/tv-schedule/pages/TvScheduleListPage';
import TvScheduleViewPage from '../features/tv-schedule/pages/TvScheduleViewPage';
import SiteConfigAddPage from '../features/site-config/pages/SiteConfigAddPage';
import SiteConfigEditPage from '../features/site-config/pages/SiteConfigEditPage';
import SiteConfigListPage from '../features/site-config/pages/SiteConfigListPage';
import SiteConfigViewPage from '../features/site-config/pages/SiteConfigViewPage';

export default function AppRouter() {
  return (
    <AdminDataProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard/list" replace />} />

            <Route path="dashboard/list" element={<DashboardListPage />} />
            <Route path="dashboard/add" element={<DashboardAddPage />} />
            <Route path="dashboard/edit/:id" element={<DashboardEditPage />} />
            <Route path="dashboard/view/:id" element={<DashboardViewPage />} />

            <Route path="playlists/list" element={<PlaylistsListPage />} />
            <Route path="playlists/add" element={<PlaylistsAddPage />} />
            <Route path="playlists/edit/:id" element={<PlaylistsEditPage />} />
            <Route path="playlists/view/:id" element={<PlaylistsViewPage />} />

            <Route path="episodes/list" element={<EpisodesListPage />} />
            <Route path="episodes/list/:playlistId" element={<EpisodesListPage />} />
            <Route path="episodes/add/:playlistId" element={<EpisodesAddPage />} />
            <Route path="episodes/edit/:playlistId/:videoId" element={<EpisodesEditPage />} />

            <Route path="categories/list" element={<CategoriesListPage />} />
            <Route path="categories/add" element={<CategoriesAddPage />} />
            <Route path="categories/edit/:id" element={<CategoriesEditPage />} />
            <Route path="categories/view/:id" element={<CategoriesViewPage />} />

            <Route path="types/list" element={<TypesListPage />} />
            <Route path="types/add" element={<TypesAddPage />} />
            <Route path="types/edit/:id" element={<TypesEditPage />} />
            <Route path="types/view/:id" element={<TypesViewPage />} />

            <Route path="genres/list" element={<GenresListPage />} />
            <Route path="genres/add" element={<GenresAddPage />} />
            <Route path="genres/edit/:id" element={<GenresEditPage />} />
            <Route path="genres/view/:id" element={<GenresViewPage />} />

            <Route path="tv-schedule/list" element={<TvScheduleListPage />} />
            <Route path="tv-schedule/add" element={<TvScheduleAddPage />} />
            <Route path="tv-schedule/edit/:id" element={<TvScheduleEditPage />} />
            <Route path="tv-schedule/view/:id" element={<TvScheduleViewPage />} />

            <Route path="site-config/list" element={<SiteConfigListPage />} />
            <Route path="site-config/add" element={<SiteConfigAddPage />} />
            <Route path="site-config/edit/:id" element={<SiteConfigEditPage />} />
            <Route path="site-config/view/:id" element={<SiteConfigViewPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard/list" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminDataProvider>
  );
}
