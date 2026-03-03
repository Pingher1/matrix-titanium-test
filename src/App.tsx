import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MenuLoader } from './state/MenuContext';
import { AppTopNav } from './components/AppTopNav';
import ApiKeyInput from './components/ApiKeyInput';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SmythOSProvider } from './state/smythos/reducer';
import PortalTransition from './components/PortalTransition';

// Lazy loading the massive suites to optimize bundle
const AvatarDashboard = lazy(() => import('./components/AvatarDashboard'));
const MatrixEntrance = lazy(() => import('./components/MatrixEntrance'));
const WorkstationLayout = lazy(() => import('./components/WorkstationLayout'));
const KronosAssistantPanel = lazy(() => import('./components/KronosAssistantPanel'));
const ModulesDashboard = lazy(() => import('./components/ModulesDashboard'));
import VoiceIndicator from './components/VoiceIndicator';
import RROTIcon from './components/RROTIcon';
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const EliteDeck = lazy(() => import('./components/EliteDeck'));
import { StoryLibrary, StorybookEditor, StorybookPlayer, SkinManager, Dreamhouse, RoomsCatalog, CatalogGrid, Shop } from './components/SuitePlaceholders';

function AppRoutes() {
  return (
    <div className="w-full h-screen bg-[#282a36] relative overflow-hidden">
      <AppTopNav />
      <ApiKeyInput />
      {/* Route Content Area */}
      <div className="absolute inset-0 pt-16">
        <ErrorBoundary>
          <SmythOSProvider>
            <VoiceIndicator />
            <RROTIcon />
            <Suspense fallback={<div className="flex h-full items-center justify-center text-white">Loading Module...</div>}>
              <Routes>
                <Route path="/" element={<MatrixEntrance />} />
                <Route path="/forge" element={<WorkstationLayout />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/deck" element={<EliteDeck />} />
                <Route path="/legacy-avatar" element={<AvatarDashboard modelUrl="" onBack={() => { }} />} />

                {/* Avatar Studio Suite (Legacy Direct Input) */}
                <Route path="/avatar/*" element={<AvatarDashboard modelUrl="" onBack={() => { }} />} />

                {/* Storybook Suite */}
                <Route path="/stories" element={<Navigate to="/stories/library" replace />} />
                <Route path="/stories/library" element={<StoryLibrary />} />
                <Route path="/stories/editor" element={<StorybookEditor />} />
                <Route path="/stories/player" element={<StorybookPlayer />} />
                <Route path="/stories/skins" element={<SkinManager />} />

                {/* Barbie World Suite */}
                <Route path="/barbieworld" element={<Navigate to="/barbieworld/dreamhouse" replace />} />
                <Route path="/barbieworld/dreamhouse" element={<Dreamhouse />} />
                <Route path="/barbieworld/rooms" element={<RoomsCatalog />} />
                <Route path="/barbieworld/toys" element={<CatalogGrid />} />
                <Route path="/barbieworld/shop" element={<Shop />} />

                {/* Kronos Architect Suite */}
                <Route path="/kronos" element={<KronosAssistantPanel />} />

                {/* Publisher Route */}
                <Route path="/admin/modules" element={<ModulesDashboard />} />
              </Routes>
            </Suspense>
            <PortalTransition duration={800} />
          </SmythOSProvider>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function App() {
  // Use a custom npm cache logic removed safely
  return (
    <BrowserRouter>
      <MenuLoader>
        <AppRoutes />
      </MenuLoader>
    </BrowserRouter>
  );
}

export default App;
