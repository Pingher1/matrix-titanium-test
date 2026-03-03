import React from 'react';
import { MenuOption } from './SideMenu';
import { X, RefreshCw, Shirt, Save, Glasses, Smile, PersonStanding, Lock, Palette, User, Scissors } from 'lucide-react';
import { BackdropKey } from './BackdropManager';

interface SlideOutPanelProps {
    activeOption: MenuOption;
    onClose: () => void;
}

const SlideOutPanel: React.FC<SlideOutPanelProps> = ({ activeOption, onClose }) => {
    const setSkinColor = (c: any) => { };
    const setBackdrop = (b: any) => { };
    const backdrop = 'studio';
    const setClothing = (c: any) => { };
    const clothing = 'suit';
    const setActiveAnimation = (a: any) => { };
    const activeAnimation = 'idle';

    if (!activeOption) return null;

    const renderContent = () => {
        switch (activeOption) {
            case 'light':
                return (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`h-24 rounded cursor-pointer border-2 ${i === 1 ? 'border-green-500' : 'border-transparent hover:border-gray-500'} bg-gray-700 flex items-center justify-center overflow-hidden`}>
                                <div className="w-16 h-20 bg-gray-400 rounded-full blur-xl opacity-30"></div>
                            </div>
                        ))}
                    </div>
                );
            case 'laugh':
                return (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {['xD', 'Excited', 'Thumbs Up', 'Surprised', 'Wicked', 'Glad', 'Suspicious', 'Shy'].map((emotion, i) => (
                            <div key={i} className="relative h-24 rounded border border-gray-600 bg-gray-700 flex flex-col items-center justify-between p-1 overflow-hidden cursor-pointer hover:border-gray-400">
                                <div className="absolute top-1 right-1 bg-black/50 text-[10px] px-1 rounded">GIF</div>
                                <div className="flex-1 w-full flex items-center justify-center">
                                    <div className="w-12 h-14 bg-gray-500 rounded-full blur-md opacity-40"></div>
                                </div>
                                <span className="text-xs font-semibold">{emotion}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'mic':
                return (
                    <div className="mt-4 flex flex-col gap-4">
                        <div className="flex flex-col">
                            <select className="bg-gray-700 text-white rounded p-2 text-sm border border-gray-600 focus:outline-none focus:border-gray-400">
                                <option>No Microphones Available</option>
                                <option>MacBook Air Microphone</option>
                            </select>
                            <span className="text-xs text-gray-400 mt-1">Microphone access is blocked</span>
                        </div>
                        <div className="flex gap-2 w-full mt-2">
                            <button className="flex-1 bg-green-700 hover:bg-green-600 rounded-full py-2 font-semibold transition-colors">Start</button>
                            <button className="flex-1 bg-transparent border border-gray-500 hover:border-gray-300 rounded-full py-2 font-semibold transition-colors">Stop</button>
                        </div>
                    </div>
                );
            case 'run':
                return (
                    <div className="grid grid-cols-2 gap-2 mt-4 pb-4">
                        {['Idle', 'Breakdance', 'Happy Idle', 'Pose 1', 'Pose 2', 'Pose 3', 'Pose 4', 'Pose 5', 'Pose 6', 'Pose 7', 'Pose 8', 'Run To Flip'].map((anim, i) => (
                            <div key={i} onClick={() => setActiveAnimation(anim)} className={`relative h-32 rounded border ${activeAnimation === anim ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700 hover:border-gray-400'} flex flex-col items-center justify-between p-1 overflow-hidden cursor-pointer`}>
                                <div className="absolute top-1 right-1 bg-black/50 text-[10px] px-1 rounded">GIF</div>
                                <div className="flex-1 w-full flex items-center justify-center">
                                    <div className="w-12 h-20 bg-gray-400 rounded-sm blur-sm opacity-40"></div>
                                </div>
                                <span className="text-xs font-semibold z-10">{anim}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'shirt':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-lg mb-4">
                            <Shirt className="w-6 h-6 text-white" />
                            <Shirt className="w-6 h-6 text-green-500" />
                            <Shirt className="w-6 h-6 text-white" />
                            <Shirt className="w-6 h-6 text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-20 no-scrollbar">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                const isSelected = clothing === `outfit_${i}`;
                                return (
                                    <div key={i} onClick={() => setClothing(isSelected ? null : `outfit_${i}`)} className={`relative h-28 rounded border ${isSelected ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700 hover:border-gray-400'} flex items-center justify-center overflow-hidden cursor-pointer`}>
                                        <div className="w-14 h-16 bg-gray-400 rounded-sm blur-sm opacity-40"></div>
                                        {[7, 8].includes(i) && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <div className="bg-white p-2 rounded-full"><Save className="w-4 h-4 text-black" /></div>
                                            </div>
                                        )}
                                        {isSelected && <div className="absolute top-1 right-1"><RefreshCw className="w-4 h-4 text-white" /></div>}
                                    </div>
                                )
                            })}
                        </div>
                        <button className="mt-auto mx-4 mb-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-full absolute bottom-0 left-0 right-0 z-20">
                            Create My T-Shirt
                        </button>
                    </div>
                );
            case 'glasses':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-around items-center pb-2 border-b border-gray-700 mb-4">
                            <Glasses className="w-8 h-8 text-green-500 px-2 border-b-2 border-green-500" />
                            <Smile className="w-8 h-8 text-white px-2 cursor-pointer hover:text-gray-300" />
                            <PersonStanding className="w-8 h-8 text-white px-2 cursor-pointer hover:text-gray-300" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 pb-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="h-24 rounded border border-gray-600 bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400">
                                    <div className="w-16 h-20 bg-gray-400 rounded-sm blur-sm opacity-40"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'hair':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-16 no-scrollbar">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className={`relative h-28 rounded border ${i === 2 ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700 hover:border-gray-400'} flex items-center justify-center overflow-hidden cursor-pointer`}>
                                    <div className="w-14 h-20 bg-gray-400 rounded-sm blur-sm opacity-40"></div>
                                    {i === 3 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="bg-white p-2 rounded-full"><Save className="w-4 h-4 text-black" /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button className="mt-auto mx-4 mb-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-full absolute bottom-0 left-0 right-0 z-20">
                            Color
                        </button>
                    </div>
                );
            case 'body':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between gap-2 mb-6">
                            <button className="flex-1 bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-full">Proportions</button>
                            <button className="flex-1 bg-transparent border border-gray-500 text-white text-[10px] font-bold py-1.5 rounded-full hover:border-gray-300">Weight/Height</button>
                            <button className="flex-1 bg-transparent border border-gray-500 text-white text-[10px] font-bold py-1.5 rounded-full hover:border-gray-300">Age</button>
                        </div>
                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-20">
                            {['Body', 'Neck', 'Shoulders', 'Chest', 'Forearms', 'Waist', 'Hips', 'Legs'].map(part => (
                                <div key={part} className="flex flex-col">
                                    <div className="flex justify-center text-[11px] font-semibold mb-2">{part}: 0</div>
                                    <div className="relative w-full h-1 bg-gray-600 rounded-full">
                                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1c23]/95 pb-4 pt-2">
                            <button className="mx-auto block w-32 bg-transparent border border-gray-500 hover:border-gray-300 text-white font-bold py-1.5 rounded-full">
                                Reset
                            </button>
                        </div>
                    </div>
                );
            case 'gloves':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-16 no-scrollbar">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className={`relative h-28 rounded border ${i === 4 ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700 hover:border-gray-400'} flex items-center justify-center overflow-hidden cursor-pointer`}>
                                    <div className="w-20 h-20 bg-gray-400 rounded-sm blur-sm opacity-40"></div>
                                    {[1, 2, 3, 5, 6].includes(i) && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="bg-white p-1 text-black rounded-lg"><Lock className="w-5 h-5 pointer-events-none" /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'head':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between gap-2 mb-6">
                            <button className="flex-1 bg-green-600 text-white text-xs font-bold py-1.5 rounded-full">Head</button>
                            <button className="flex-1 bg-transparent border border-gray-500 text-white text-xs font-bold py-1.5 rounded-full hover:border-gray-300">Nose & Lips</button>
                        </div>
                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-20">
                            {['Head Height', 'Head Width', 'Head Volume', 'Head Thickness', 'Cheeks', 'Jaw Width', 'Jaw Line Width', 'Jaw Sharpness', 'Jaw Sides', 'Chin Sharpness', 'Chin Length'].map(part => (
                                <div key={part} className="flex flex-col">
                                    <div className="flex justify-center text-[11px] font-semibold mb-2">{part}: 0</div>
                                    <div className="relative w-full h-1 bg-gray-600 rounded-full">
                                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1c23]/95 pb-4 pt-2">
                            <button className="mx-auto block w-32 bg-transparent border border-gray-500 hover:border-gray-300 text-white font-bold py-1.5 rounded-full">
                                Reset
                            </button>
                        </div>
                    </div>
                );
            case 'tattoo':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-white text-sm font-semibold">Placement</span>
                            <select className="bg-gray-700 text-white rounded p-1.5 text-xs border border-gray-600 focus:outline-none focus:border-gray-400">
                                <option>Neck</option>
                                <option>Arm</option>
                                <option>Chest</option>
                                <option>Back</option>
                            </select>
                        </div>
                        <div className="w-full h-2 bg-gradient-to-r from-gray-700 to-black rounded-full mb-4 border border-gray-600"></div>
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-16 no-scrollbar">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className={`relative h-28 rounded border ${i === 1 ? 'border-green-500 bg-white' : 'border-gray-600 bg-gray-500 hover:border-gray-400'} flex items-center justify-center overflow-hidden cursor-pointer`}>
                                    {/* Placeholder for tattoo flash art */}
                                    {i === 1 && <div className="w-16 h-16 bg-red-500 rounded-full blur-sm opacity-60"></div>}
                                    {i === 2 && <div className="w-20 h-10 bg-black rounded-full blur-sm opacity-60"></div>}
                                    {[3, 4, 5, 6, 7, 8, 9, 10].includes(i) && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <div className="bg-white p-1 text-black rounded-lg"><Lock className="w-5 h-5 pointer-events-none" /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'paint':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between gap-1 mb-4 border-b border-gray-700 pb-2">
                            <button className="flex-1 flex justify-center text-green-500 border-b-2 border-green-500 pb-1"><Palette className="w-6 h-6" /></button>
                            <button className="flex-1 flex justify-center text-gray-400 hover:text-white pb-1"><div className="w-6 h-6 border rounded border-gray-400 flex flex-col items-center justify-around p-0.5"><div className="w-full h-1 bg-gray-400"></div><div className="w-full h-1 bg-gray-400"></div></div></button>
                            <button className="flex-1 flex justify-center text-gray-400 hover:text-white pb-1"><Smile className="w-6 h-6" /></button>
                        </div>
                        <div className="flex flex-col gap-6 overflow-y-auto pb-20 no-scrollbar text-sm">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-400 mb-2">Cheeks</span>
                                <div className="flex gap-1 mb-2">
                                    {['#cc8888', '#e09999', '#ffb3b3', '#cc6666', '#d98c8c', '#e6b3b3'].map(color => (
                                        <button key={color} className="w-8 h-8 rounded border-2 border-transparent hover:border-white transition-all transform hover:scale-110" style={{ backgroundColor: color }}></button>
                                    ))}
                                    <button className="w-8 h-8 flex items-center justify-center"><Palette className="w-5 h-5 text-gray-400" /></button>
                                </div>
                                <div className="w-full h-1.5 bg-gradient-to-r from-transparent to-red-400 rounded-full mb-3 flex items-center">
                                    <div className="w-3 h-3 bg-white rounded-full ml-10 shadow"></div>
                                </div>
                                <div className="flex flex-col gap-1 text-gray-300">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded bg-gray-700" /> Cheeks 1</label>
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded bg-gray-700" /> Cheeks 2</label>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-400 mb-2">Nose</span>
                                <div className="flex gap-1 mb-2">
                                    {['#cc8888', '#e09999', '#ffb3b3', '#cc6666', '#d98c8c', '#e6b3b3'].map(color => (
                                        <button key={color} className="w-8 h-8 rounded border-2 border-transparent hover:border-white transition-all transform hover:scale-110" style={{ backgroundColor: color }}></button>
                                    ))}
                                    <button className="w-8 h-8 flex items-center justify-center"><Palette className="w-5 h-5 text-gray-400" /></button>
                                </div>
                                <div className="w-full h-1.5 bg-gradient-to-r from-transparent to-red-400 rounded-full mb-3 flex items-center">
                                    <div className="w-3 h-3 bg-white rounded-full ml-10 shadow"></div>
                                </div>
                                <div className="flex flex-col gap-1 text-gray-300">
                                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded bg-gray-700" /> Nose 1</label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'eyes':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <label className="flex items-center gap-3 font-bold text-white mb-4 cursor-pointer">
                            <input type="radio" checked readOnly className="w-5 h-5 accent-green-500" />
                            Recolorable eyes type
                        </label>

                        <div className="flex justify-between gap-2 mb-6">
                            <button className="flex-1 bg-green-600 text-white text-xs font-bold py-1.5 rounded-full">Shape</button>
                            <button className="flex-1 bg-transparent border border-gray-500 text-white text-xs font-bold py-1.5 rounded-full hover:border-gray-300">Iris</button>
                            <button className="flex-1 bg-transparent border border-gray-500 text-white text-xs font-bold py-1.5 rounded-full hover:border-gray-300">Sclera</button>
                        </div>
                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pb-20">
                            {['Iris', 'Pupil', 'Eyes Size', 'Eyes Wider', 'Monolid', 'Squint', 'Eyelid Hood', 'Eyelid Roll Down'].map((part, index) => (
                                <div key={part} className="flex flex-col">
                                    <div className="flex justify-center text-[11px] font-semibold mb-2">{part}: 0</div>
                                    <div className="relative w-full h-1 bg-gray-600 rounded-full flex items-center">
                                        {/* For the first slider in the ref screenshot, it's green filled on the left side */}
                                        <div className={`absolute left-0 h-1 rounded-l-full ${index === 0 ? 'w-1/2 bg-green-500' : 'bg-transparent'}`}></div>
                                        <div className={`absolute ${index === 0 ? 'left-1/2' : 'left-0'} w-3 h-3 bg-green-500 rounded-full transform -translate-x-1/2 shadow-lg`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1c23]/95 pb-4 pt-2">
                            <button className="mx-auto block w-32 bg-transparent border border-gray-500 hover:border-gray-300 text-white font-bold py-1.5 rounded-full">
                                Reset
                            </button>
                        </div>
                    </div>
                );
            case 'skin':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="flex justify-between gap-1 mb-4 border-b border-gray-700 pb-2">
                            <button className="flex-1 flex justify-center text-gray-400 hover:text-white pb-1"><Scissors className="w-6 h-6" /></button>
                            <button className="flex-1 flex justify-center text-green-500 border-b-2 border-green-500 pb-1"><User className="w-6 h-6" /></button>
                            <button className="flex-1 flex justify-center text-gray-400 hover:text-white pb-1"><Smile className="w-6 h-6" /></button>
                        </div>
                        <div className="grid grid-cols-5 gap-1 mb-4">
                            {['#ffdfc4', '#f0d5be', '#eebb96', '#e0ac82', '#d29d68', '#c48e4e', '#b67f34', '#a8701a', '#9a6100', '#8c5200', '#7e4300', '#703400', '#622500', '#541600', '#460700', '#380000', '#2a0000', '#1c0000', '#0e0000', '#000000'].map(color => (
                                <button key={color} onClick={() => setSkinColor(color)} className="w-10 h-10 rounded border-2 hover:border-white transition-all transform hover:scale-110" style={{ backgroundColor: color }}></button>
                            ))}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1c23]/95 pb-4 pt-2">
                            <button className="mx-auto block w-32 bg-transparent border border-gray-500 hover:border-gray-300 text-white font-bold py-1.5 rounded-full">
                                Reset
                            </button>
                        </div>
                    </div>
                );
            case 'scene':
                return (
                    <div className="flex flex-col h-full mt-4">
                        <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-16 no-scrollbar">
                            {['Studio', 'None', 'Mad Scientist Lab', 'Vintage Bar', 'Houston Galleria'].map((scene, i) => {
                                const map: Record<string, BackdropKey> = {
                                    'Studio': 'studio', 'None': 'none', 'Mad Scientist Lab': 'mad-scientist', 'Vintage Bar': 'vintage-bar', 'Houston Galleria': 'houston-galleria'
                                };
                                const bKey = map[scene] || 'none';
                                const isSelected = backdrop === bKey;
                                return (
                                    <div key={i} onClick={() => setBackdrop(bKey)} className={`relative h-28 rounded border ${isSelected ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700 hover:border-gray-400'} flex items-center justify-center overflow-hidden cursor-pointer p-2 text-center`}>
                                        <div className="absolute inset-0 bg-gray-600 blur-sm opacity-30"></div>
                                        <span className="text-white text-sm font-bold z-10 drop-shadow-md">{scene}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex-1 flex items-center justify-center text-gray-500 italic mt-8">
                        Select an option to customize
                    </div>
                );
        }
    };

    const titles: Record<string, string> = {
        light: 'Lighting',
        laugh: 'Facial Animations',
        mic: 'LipSync',
        run: 'Animations',
        shirt: 'Outfits',
        glasses: 'Head Accessories',
        hair: 'Haircuts',
        body: 'Body Customization',
        gloves: 'Hands Accessories',
        head: 'Head Customization',
        tattoo: 'Tattoos',
        paint: 'Makeup',
        eyes: 'Eyes',
        skin: 'Skin Color',
        scene: 'Cinematic Backdrop'
    };

    return (
        <div className="absolute right-20 top-4 bottom-4 w-72 bg-[#1a1c23]/95 backdrop-blur shadow-2xl rounded-xl border border-gray-700 flex flex-col z-10 transition-transform duration-300 transform translate-x-0">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-bold text-lg text-white">{titles[activeOption as string] || 'Options'}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto no-scrollbar text-white">
                {renderContent()}
            </div>
        </div>
    );
};

export default SlideOutPanel;
