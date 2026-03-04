import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MenuLoader } from './state/MenuContext';
import { AppTopNav } from './components/AppTopNav';

import { ErrorBoundary } from './components/ErrorBoundary';
import { SmythOSProvider } from './state/smythos/reducer';
import PortalTransition from './components/PortalTransition';
import TransmissionProtocol from './components/TransmissionProtocol';

// Lazy loading the massive suites to optimize bundle
// The massive AvatarDashboard has been exterminated.
const MatrixEntrance = lazy(() => import('./components/MatrixEntrance'));
const LandingGateway = lazy(() => import('./components/LandingGateway'));
const TestPilotGateway = lazy(() => import('./components/TestPilotGateway'));
const GlobalServerTerminal = lazy(() => import('./components/GlobalServerTerminal'));
const WorkstationLayout = lazy(() => import('./components/WorkstationLayout'));
const KronosAssistantPanel = lazy(() => import('./components/KronosAssistantPanel'));
const ModulesDashboard = lazy(() => import('./components/ModulesDashboard'));
import VoiceIndicator from './components/VoiceIndicator';
import RROTIcon from './components/RROTIcon';
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const EliteDeck = lazy(() => import('./components/EliteDeck'));
const ProjectEditorSuite = lazy(() => import('./components/ProjectEditorSuite'));
import { StoryLibrary, StorybookEditor, StorybookPlayer, SkinManager, Dreamhouse, RoomsCatalog, CatalogGrid, Shop } from './components/SuitePlaceholders';

function MainAppLayout() {
  return (
    <div className="w-full h-screen bg-[#282a36] relative overflow-hidden">
      <AppTopNav />
      {/* Route Content Area */}
      <div className="absolute inset-0 pt-16">
        <VoiceIndicator />
        <RROTIcon />
        <Outlet />
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <SmythOSProvider>
        <Suspense fallback={<div className="flex h-full items-center justify-center text-white w-full h-screen bg-black">Loading Matrix...</div>}>
          <Routes>
            {/* The Internal App (Nav Bars, Voice Icons, and Menus) */}
            <Route element={<MainAppLayout />}>
              <Route path="/hub" element={<MatrixEntrance />} />
              <Route path="/forge" element={<WorkstationLayout />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/deck" element={<EliteDeck />} />
              {/* Avatar Studio Suite (The True Forge) */}
              <Route path="/avatar/*" element={<Navigate to="/forge" replace />} />

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

              {/* Native AI Studio Project Vault Editor */}
              <Route path="/editor" element={<ProjectEditorSuite />} />
            </Route>
          </Routes>
        </Suspense>
        <PortalTransition duration={800} />
      </SmythOSProvider>
    </ErrorBoundary>
  );
}

function App() {
  // Biological Gateway Check!
  // If the path is exactly '/' OR '/pilot', we mount the raw Gateways OUTSIDE the React Router and SmythOS framework.
  // This ensures a true "Shuttered Jump" (browser reload) when transitioning to the Forge.
  const isGateway = window.location.pathname === '/';
  const isPilotGateway = window.location.pathname === '/pilot';

  if (isGateway) {
    return (
      <>
        <TransmissionProtocol />
        <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center"><div className="text-[#00ff41] font-mono animate-pulse">BOOTING KRONOS NODE...</div></div>}>
          <LandingGateway />
        </Suspense>
        <Suspense fallback={null}>
          <GlobalServerTerminal />
        </Suspense>
      </>
    );
  }

  if (isPilotGateway) {
    return (
      <>
        <TransmissionProtocol />
        <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center"><div className="text-[#00ff41] font-mono animate-pulse">BOOTING TEST PILOT GATEWAY...</div></div>}>
          <TestPilotGateway />
        </Suspense>
        <Suspense fallback={null}>
          <GlobalServerTerminal />
        </Suspense>
      </>
    );
  }

  // The KRONOS Forge application boots its own Router Memory
  return (
    <BrowserRouter>
      <MenuLoader>
        <SmythOSProvider>
          <TransmissionProtocol />
          <Suspense fallback={<div className="h-screen w-screen bg-black flex items-center justify-center"><div className="text-[#00ff41] font-mono animate-pulse">BOOTING FORGE SUITES...</div></div>}>
            <GlobalServerTerminal />
            <AppRoutes />
          </Suspense>
        </SmythOSProvider>
      </MenuLoader>
    </BrowserRouter>
  );
}

export default App;
