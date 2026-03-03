import React, { useState } from 'react';

const mockAssets = [
    { id: '1', name: 'Cozy Armchair', category: 'Furniture', imageUrl: '/assets/catalogs/cartoon_armchair_1772444356857.png', price: 150 },
    { id: '2', name: 'Dreamy Bed', category: 'Furniture', imageUrl: '/assets/catalogs/cartoon_bed_1772444370895.png', price: 300 },
    { id: '3', name: 'Floor Lamp', category: 'Accessories', imageUrl: '/assets/catalogs/cartoon_lamp_1772444384302.png', price: 45 },
    { id: '4', name: 'Teddy Bear Toy', category: 'Toys', imageUrl: '/assets/catalogs/cartoon_toy_bear_1772444396005.png', price: 20 },
];

export const CatalogGrid: React.FC = () => {
    const [filter, setFilter] = useState('All');

    const categories = ['All', ...Array.from(new Set(mockAssets.map(a => a.category)))];

    const filteredAssets = filter === 'All' ? mockAssets : mockAssets.filter(a => a.category === filter);

    return (
        <div className="flex flex-col min-h-screen bg-[#282a36] text-white pt-24 px-8 pb-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Asset Catalog</h1>
                    <div className="flex gap-4">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full font-semibold transition-all ${filter === cat ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-[#1a1c23] text-gray-400 hover:bg-[#383a46]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredAssets.map(asset => (
                        <div key={asset.id} className="bg-[#1a1c23] rounded-2xl overflow-hidden shadow-xl border border-gray-800 hover:border-pink-500/50 transition-all group flex flex-col">
                            <div className="relative aspect-square overflow-hidden bg-white flex items-center justify-center p-4">
                                <img
                                    src={asset.imageUrl}
                                    alt={asset.name}
                                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="text-xs uppercase tracking-wider text-pink-400 font-bold mb-1">{asset.category}</div>
                                <h3 className="text-xl font-semibold mb-2">{asset.name}</h3>
                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-800">
                                    <span className="text-2xl font-bold text-emerald-400">♦ {asset.price}</span>
                                    <button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-4 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95">
                                        Acquire
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAssets.length === 0 && (
                    <div className="text-center py-20 text-gray-500 text-xl font-medium">
                        No assets found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};
