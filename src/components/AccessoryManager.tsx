import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';

export default function AccessoryManager({ accessoryId, parentBone }: { accessoryId: string | null, parentBone: any }) {
    // Gracefully return if no accessory is actively selected from the Wardrobe
    if (!accessoryId) return null;

    // Example: Loading a hat or glasses GLB from the AWS proxy
    const { scene } = useGLTF(`/assets/accessories/${accessoryId}.glb`);
    const accessoryRef = useRef();

    useEffect(() => {
        // Traverse the Avatar mesh to physically attach the accessory to the specific parentBone (Head, Hand, etc)
        if (parentBone && accessoryRef.current) {
            parentBone.add(accessoryRef.current);
        }
    }, [parentBone, accessoryId]);

    return <primitive object={scene} ref={accessoryRef} />;
}
