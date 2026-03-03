import React from 'react';
import { useGLTF } from '@react-three/drei';

interface AvatarLoaderProps {
    url: string;
    onLoaded?: () => void;
    [key: string]: any; // Allow arbitrary threejs spatial props like position/scale
}

export default function AvatarLoader({ url, onLoaded, ...props }: AvatarLoaderProps) {
    const { scene } = useGLTF(url, undefined, undefined, (loader) => {
        // Trigger generic callback when mesh buffer completes loading
        if (onLoaded) {
            // Give Three a frame to paint the geometry
            setTimeout(onLoaded, 100);
        }
    });

    // We clone the scene so it can be mounted multiple times if needed safely
    return <primitive object={scene.clone()} {...props} />;
}
