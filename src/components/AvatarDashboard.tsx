import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import SideMenu, { MenuOption } from './SideMenu';
import SlideOutPanel from './SlideOutPanel';
import AvatarCanvas from './AvatarCanvas';
import SphereCustomizerPanel from './SphereCustomizerPanel';
import AvatarPromptUI from './AvatarPromptUI';
import { RefreshCw } from 'lucide-react';
import { SmythOSProvider } from '../state/smythos/reducer';

interface AvatarDashboardProps {
    modelUrl: string;
    onBack: () => void;
}

const DashboardContent: React.FC<AvatarDashboardProps> = ({ modelUrl, onBack }) => {
    const [activeMenuOption, setActiveMenuOption] = useState<MenuOption>(null);
    const setModelUrl = (url: string) => { };

    useEffect(() => {
        if (modelUrl) {
            setModelUrl(modelUrl);
        }
    }, [modelUrl, setModelUrl]);

    return (
        <div className={`absolute inset-0 bg-transparent flex justify-center items-center overflow-hidden font-sans`}>
            {/* 3D Viewer Layer */}
            <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto">
                <AvatarCanvas />
            </div>

            {/* Local TopBar removed since we have a Global App Nav now, or hide it if we want it strictly for back navigation. Let's remove it and let AppTopNav handle top-level nav. */}

            <SideMenu
                activeOption={activeMenuOption}
                onSelectOption={setActiveMenuOption}
            />

            <SlideOutPanel
                activeOption={activeMenuOption}
                onClose={() => setActiveMenuOption(null)}
            />

            {/* AI Sphere Forge UI (Only visible when modelUrl is null) */}
            <SphereCustomizerPanel />

            {/* Master Text-to-3D Prompt Input */}
            <AvatarPromptUI />

            <button className="absolute bottom-4 right-4 p-3 bg-[#1a1c23]/80 hover:bg-gray-700 rounded-full text-white shadow-lg transition-colors z-10 pointer-events-auto">
                <RefreshCw className="w-6 h-6" />
            </button>

        </div>
    );
};

const AvatarDashboard: React.FC<AvatarDashboardProps> = (props) => {
    return (
        <SmythOSProvider>
            <DashboardContent {...props} />
        </SmythOSProvider>
    );
};

export default AvatarDashboard;
