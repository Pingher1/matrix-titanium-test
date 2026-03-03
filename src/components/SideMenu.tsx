import React from 'react';
import {
    Save, Star, Shirt, Scissors, Glasses, PersonStanding,
    Hand, Minimize2, Frame, Eye, Paintbrush, Fingerprint,
    Activity, Smile, Flashlight, Mic, User, Image as ImageIcon
} from 'lucide-react';

export type MenuOption =
    | 'save' | 'star' | 'shirt' | 'hair' | 'glasses' | 'beard'
    | 'gloves' | 'body' | 'head' | 'eyes' | 'paint' | 'tattoo'
    | 'run' | 'laugh' | 'light' | 'mic' | 'skin' | 'scene' | null;

interface SideMenuProps {
    activeOption: MenuOption;
    onSelectOption: (option: MenuOption) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ activeOption, onSelectOption }) => {
    const menuItems: { id: MenuOption; icon: React.ReactNode; color?: string }[] = [
        { id: 'save', icon: <Save className="w-6 h-6" />, color: 'text-orange-500' },
        { id: 'star', icon: <Star className="w-6 h-6" /> },
        { id: 'shirt', icon: <Shirt className="w-6 h-6" /> },
        { id: 'hair', icon: <Scissors className="w-6 h-6" /> },
        { id: 'glasses', icon: <Glasses className="w-6 h-6" /> },
        { id: 'beard', icon: <PersonStanding className="w-6 h-6" /> }, // Approximation
        { id: 'gloves', icon: <Hand className="w-6 h-6" /> },
        { id: 'body', icon: <Minimize2 className="w-6 h-6" /> }, // Approximation
        { id: 'head', icon: <Frame className="w-6 h-6" /> }, // Approximation
        { id: 'eyes', icon: <Eye className="w-6 h-6" /> },
        { id: 'paint', icon: <Paintbrush className="w-6 h-6" /> },
        { id: 'skin', icon: <User className="w-6 h-6" /> },
        { id: 'tattoo', icon: <Fingerprint className="w-6 h-6" /> }, // Approximation
        { id: 'run', icon: <Activity className="w-6 h-6" /> }, // Approximation
        { id: 'laugh', icon: <Smile className="w-6 h-6" /> },
        { id: 'scene', icon: <ImageIcon className="w-6 h-6" /> },
        { id: 'light', icon: <Flashlight className="w-6 h-6" /> },
        { id: 'mic', icon: <Mic className="w-6 h-6" />, color: activeOption === 'mic' ? 'text-green-500' : 'text-white' },
    ];

    return (
        <div className="absolute right-0 top-0 bottom-0 w-20 flex flex-col items-center py-4 bg-transparent z-10 overflow-y-auto no-scrollbar pointer-events-none">
            <div className="flex flex-col gap-3 pointer-events-auto mt-12 pb-20">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelectOption(item.id === activeOption ? null : item.id)}
                        className={`w-12 h-12 rounded-full flex justify-center items-center transition-all ${activeOption === item.id
                            ? 'bg-gray-700 shadow-inner'
                            : 'hover:bg-gray-800/50'
                            } ${item.color || 'text-white'}`}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SideMenu;
