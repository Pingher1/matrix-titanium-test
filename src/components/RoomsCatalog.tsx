import React from 'react';

export const RoomsCatalog: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#282a36] text-white pt-24 px-8 pb-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Rooms Catalog</h1>
                </div>

                <div className="bg-[#1a1c23]/80 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Design Your Space</h2>
                    <p className="text-gray-300 mb-8 leading-relaxed max-w-3xl">
                        Welcome to the interactive Rooms Designer. Choose a room template below to start organizing your imported Adobe assets, furniture, and toys into a fully playable 3D scene environment!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Living Room */}
                        <div className="group cursor-pointer bg-gradient-to-b from-[#2a2d39] to-[#1e2029] rounded-xl overflow-hidden border border-gray-700 hover:border-emerald-400 transition-all">
                            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-75 group-hover:brightness-100 transition-all"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">Living Room</h3>
                                <p className="text-sm text-gray-400">Place couches, lamps, and entertainment centers.</p>
                            </div>
                        </div>

                        {/* Bedroom */}
                        <div className="group cursor-pointer bg-gradient-to-b from-[#2a2d39] to-[#1e2029] rounded-xl overflow-hidden border border-gray-700 hover:border-pink-400 transition-all">
                            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-75 group-hover:brightness-100 transition-all"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-pink-400 transition-colors">Bedroom</h3>
                                <p className="text-sm text-gray-400">Beds, wardrobes, and cozy rugs.</p>
                            </div>
                        </div>

                        {/* Patio */}
                        <div className="group cursor-pointer bg-gradient-to-b from-[#2a2d39] to-[#1e2029] rounded-xl overflow-hidden border border-gray-700 hover:border-orange-400 transition-all">
                            <div className="h-40 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80')] bg-cover bg-center brightness-75 group-hover:brightness-100 transition-all"></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors">Summer Patio</h3>
                                <p className="text-sm text-gray-400">Outdoor seating, plants, and pools.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center gap-2">
                            <span>Upload Custom Room (.GLB)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
