import React from 'react';
import { UserCircle, Image as ImageIcon, ImagePlus, ArrowLeft } from 'lucide-react';

interface TopBarProps {
    onBack: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onBack }) => {
    return (
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-start z-10">
            <div className="flex flex-col gap-4 pointer-events-auto">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#1a1c23] px-3 py-2 rounded-lg border border-gray-700 shadow-lg text-white font-medium">
                        <UserCircle className="w-6 h-6 text-green-400" />
                        <span>pjlrichardson@gmail.com</span>
                    </div>

                    <div className="flex bg-[#1a1c23] p-1 rounded-lg border border-gray-700 shadow-lg relative">
                        <button className="px-4 py-1.5 rounded-md text-sm font-bold bg-green-600 text-white shadow-sm transition-colors cursor-default">
                            Human Mode
                        </button>
                        <button className="px-4 py-1.5 rounded-md text-sm font-bold text-gray-400 hover:text-white transition-colors cursor-pointer">
                            Concept Mode
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <button className="flex items-center justify-center bg-[#1a1c23] hover:bg-gray-700 text-orange-400 border border-orange-500/50 rounded-lg p-2 w-14 h-12 shadow-lg transition-colors group relative">
                        <span className="font-bold text-sm">GIF</span>
                    </button>
                    <button className="flex items-center justify-center bg-[#1a1c23] hover:bg-gray-700 text-orange-400 border border-orange-500/50 rounded-lg p-2 w-14 h-12 shadow-lg transition-colors group relative">
                        <span className="font-bold text-sm">PNG</span>
                    </button>
                </div>

                <button
                    onClick={onBack}
                    className="absolute top-[45vh] left-0 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg p-2 w-10 h-10 shadow-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default TopBar;
