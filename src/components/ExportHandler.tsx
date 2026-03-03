import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { exportGLBAndUpload } from '../services/exportService';

export default function ExportHandler() {
    const { scene, gl } = useThree();

    useEffect(() => {
        const handleExport = async (e: Event) => {
            const customEvent = e as CustomEvent;
            const onComplete = customEvent.detail?.onComplete;
            const onError = customEvent.detail?.onError;

            try {
                // Export the active ThreeJS Scene as a binary GLTF buffer and upload to the mock endpoint
                const { publicUrl } = await exportGLBAndUpload(scene, `avatar_${Date.now()}.glb`);
                if (onComplete) onComplete(publicUrl);
            } catch (err) {
                console.error("3D Export Pipeline failed:", err);
                if (onError) onError(err);
            }
        };

        const handleScreenshot = async () => {
            try {
                // Ensure the buffer is intact immediately after a frame render
                const dataUrl = gl.domElement.toDataURL("image/png");
                const res = await fetch("/api/screenshot", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: dataUrl })
                });

                if (res.ok) {
                    console.log("[TELEMETRY] Screenshot successfully blasted to local server drive.");
                    // Could emit an event back to the UI here to flash a "Snapshot Saved" toast
                }
            } catch (err) {
                console.error("Screenshot Capture Failed:", err);
            }
        };

        window.addEventListener('avatar:export', handleExport);
        window.addEventListener('avatar:screenshot', handleScreenshot);
        return () => {
            window.removeEventListener('avatar:export', handleExport);
            window.removeEventListener('avatar:screenshot', handleScreenshot);
        };
    }, [scene, gl]);

    return null; // Logic-only component, renders nothing
}
