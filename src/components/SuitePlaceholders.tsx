import React from 'react';

// Common placeholder layout for suites we haven't built yet
export const PlaceholderView: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#282a36] text-white">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-gray-400">{subtitle || "This module is currently under construction."}</p>
    </div>
);

export const StoryLibrary = () => <PlaceholderView title="Storybook Library" subtitle="Browse available stories and Barbie World chapters." />;
export const StorybookEditor = () => <PlaceholderView title="Storybook Editor" subtitle="Create new Story Manifests and TTS Timelines." />;
export const StorybookPlayer = () => <PlaceholderView title="Storybook Player" subtitle="Karaoke-style TTS Audio Player with 3D Avatar Triggers." />;
export const SkinManager = () => <PlaceholderView title="Skin Manager" subtitle="Manage CSS styles, Book Covers, and Page Frames." />;
export const Dreamhouse = () => <PlaceholderView title="Dreamhouse" subtitle="Welcome to the Barbie World Dreamhouse interactive map." />;
export { RoomsCatalog } from './RoomsCatalog';
export { CatalogGrid } from './CatalogGrid';
export const Shop = () => <PlaceholderView title="Shop & IAP" subtitle="Microtransactions and Parental Gate required." />;
