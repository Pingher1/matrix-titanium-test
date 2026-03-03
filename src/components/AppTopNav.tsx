import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMenu } from '../state/MenuContext';
import { User, Book, Sparkles } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
    User: <User className="w-5 h-5" />,
    Book: <Book className="w-5 h-5" />,
    Sparkles: <Sparkles className="w-5 h-5 text-pink-400" />
};

export const AppTopNav = () => {
    const { suites } = useMenu();

    return (
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#1a1c23]/90 backdrop-blur border-b border-gray-800 z-50 flex items-center justify-between px-6 shadow-xl pt-env-safe">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center font-bold text-white shadow-lg text-sm">
                    K
                </div>
                <span className="text-white font-bold text-lg tracking-tight">Kronos Avatar Forge</span>
            </div>

            <nav className="flex gap-2">
                {suites.map(suite => (
                    <NavLink
                        key={suite.id}
                        to={suite.defaultRoute}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${isActive
                                ? 'bg-white/10 text-white shadow-inner'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {icons[suite.icon]}
                        <span className="hidden sm:inline">{suite.title}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                {/* Placeholder for future auth/profile */}
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer border border-gray-600 hover:border-gray-400">
                    <User className="w-4 h-4 text-gray-300" />
                </div>
            </div>
        </div>
    );
};
