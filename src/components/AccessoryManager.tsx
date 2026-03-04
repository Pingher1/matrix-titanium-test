import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { animationRegistry } from '../lib/animationRegistry';

export default function AccessoryManager({ accessoryId, parentBone }: { accessoryId: string | null, parentBone: any }) {
    const [spec, setSpec] = useState<any>(null);

    useEffect(() => {
        if (!accessoryId) {
            setSpec(null);
            return;
        }
        // Load the JSON dynamically
        import(`../assets/accessories/${accessoryId}.json`)
            .then((module) => {
                setSpec(module.default || module);
            })
            .catch((err) => {
                console.warn(`Could not load accessory spec for ${accessoryId}`, err);
                setSpec(null);
            });
    }, [accessoryId]);

    if (!accessoryId || !spec) return null;

    return <AccessoryModel spec={spec} parentBone={parentBone} />;
}

function AccessoryModel({ spec, parentBone }: { spec: any, parentBone: any }) {
    // Default to a fallback if path is incomplete (prevents ThreeJS crash)
    const gltf = useGLTF(spec.modelPath || "/fallback.glb") as any;
    const accessoryRef = useRef<any>(null); // Passed null to fix TS expect 1 argument
    const { actions, mixer } = useAnimations(gltf.animations || [], accessoryRef);

    useEffect(() => {
        if (parentBone && accessoryRef.current) {
            // Attach securely to the given bone (e.g. Head_JNT)
            parentBone.add(accessoryRef.current);
        }
        return () => {
            if (parentBone && accessoryRef.current) {
                parentBone.remove(accessoryRef.current);
            }
        };
    }, [parentBone]);

    useEffect(() => {
        // Register any standalone animations the accessory might have (e.g., spinning gears)
        if (spec.animationTags && spec.animationTags.length > 0 && actions) {
            spec.animationTags.forEach((tag: string) => {
                const clip = gltf.animations?.find((a: any) => a.name.toLowerCase().includes(tag.toLowerCase()));
                if (clip && mixer) {
                    animationRegistry.registerDynamic(spec.id + "_" + tag, mixer, clip);
                    animationRegistry.playDynamic(spec.id + "_" + tag);
                }
            });
        }
    }, [actions, mixer, spec, gltf]);

    const pos = spec.transform?.pos || [0, 0, 0];
    const rot = spec.transform?.rot || [0, 0, 0];
    const scale = spec.transform?.scale || [1, 1, 1];

    return (
        <primitive
            object={gltf.scene}
            ref={accessoryRef}
            position={pos}
            rotation={rot}
            scale={scale}
        />
    );
}
