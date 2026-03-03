import React from 'react';
import axios from 'axios';
import { Camera, Download } from 'lucide-react';

export default function StageManager({ dollConfig }: { dollConfig?: any }) {

    const saveDollToFactory = async () => {
        try {
            // 1. Snapshot the "Box Art" photo from the active WebGL canvas
            const canvas = document.querySelector('canvas');
            if (!canvas) throw new Error("WebGL Canvas not found.");

            const photoBase64 = canvas.toDataURL('image/png');

            // 2. Dispatch the Wardrobe payload to the S3 God Battle persistence node
            const response = await axios.post('/api/save-doll', {
                config: dollConfig,
                photoUrl: photoBase64
            });

            if (response.data.success) {
                console.log("[FACTORY] Doll successfully archived to S3: ", response.data.url);
                alert("Doll Saved to the Cloud Factory!");
            }
        } catch (err) {
            console.error("[FACTORY ERROR] ", err);
            alert("Failed to export Doll.");
        }
    };

    return (
        <div className="absolute right-6 top-32 z-50 flex flex-col gap-4">
            <button
                onClick={saveDollToFactory}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-mono shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all hover:scale-105"
            >
                <Camera size={18} />
                BOX ART SAVE
            </button>

            {/* Placeholder for future accessory downloads */}
            <button className="flex items-center gap-2 bg-black/50 border border-white/20 text-white/50 px-6 py-3 rounded-xl font-mono cursor-not-allowed">
                <Download size={18} />
                EXPORT GLB
            </button>
        </div>
    );
}
