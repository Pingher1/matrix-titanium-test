import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, Color } from "three";
import { animationRegistry } from "../lib/animationRegistry";

type Props = {
    modelUrl: string;
    skinColor: string;
    clothingKey: string | null;
    activeAnimation: string | null;
};

export default function ModelLoader({ modelUrl, skinColor, clothingKey, activeAnimation }: Props) {
    const gltf = useGLTF(modelUrl) as any;
    const groupRef = useRef<Group>(null);
    const { actions, mixer } = useAnimations(gltf.animations, groupRef);

    useEffect(() => {
        if (!gltf) return;

        // 1. Register GLTF actions with registry
        Object.keys(actions || {}).forEach((k) => {
            animationRegistry.register(k, { type: "clip", action: actions[k] });
        });

        // 2. Expose global play API for StoryInteractionController & DebugHUD
        (window as any).__playAvatarAnimation = async (name: string) => {
            const entry = animationRegistry.get(name);
            if (entry) {
                if (entry.type === "clip") {
                    Object.values(actions).forEach((a: any) => a.stop());
                    entry.action.reset().fadeIn(0.2).play();
                    return true;
                }
                if (entry.type === "procedural" && mixer && groupRef.current) {
                    const clip = animationRegistry.createProceduralClip(entry.id, groupRef.current);
                    if (clip) {
                        const act = mixer.clipAction(clip, groupRef.current as any);
                        Object.values(actions).forEach((a: any) => a.stop());
                        act.reset().fadeIn(0.2).play();
                        return true;
                    }
                }
            }
            console.warn(`Animation not found in GLB or procedural registry: ${name}`);
            return false;
        };

        // 3. Expose Morph API
        (window as any).__setMorph = (meshName: string, morphName: string, value: number) => {
            gltf.scene.traverse((o: any) => {
                if (o.isMesh && (o.name === meshName || o.uuid === meshName)) {
                    const dict = o.morphTargetDictionary || {};
                    const idx = dict[morphName];
                    if (typeof idx === "number" && o.morphTargetInfluences) {
                        o.morphTargetInfluences[idx] = value;
                    }
                }
            });
        };

        (window as any).__listAvatarAnimations = () => animationRegistry.list();

        return () => {
            (window as any).__playAvatarAnimation = undefined;
            (window as any).__setMorph = undefined;
            (window as any).__listAvatarAnimations = undefined;
        };
    }, [gltf, actions, mixer]);

    // Apply skin color by traversing and updating material color
    useEffect(() => {
        if (!gltf?.scene) return;
        const targetColor = new Color(skinColor);

        gltf.scene.traverse((obj: any) => {
            if (obj.isMesh) {
                const name = (obj.name || "").toLowerCase();
                const matName = (obj.material?.name || "").toLowerCase();
                if (name.includes("skin") || name.includes("face") || matName.includes("skin") || matName.includes("face")) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((m: any) => {
                            m.color = targetColor.clone();
                            m.needsUpdate = true;
                        });
                    } else if (obj.material) {
                        obj.material.color = targetColor.clone();
                        obj.material.needsUpdate = true;
                    }
                }
            }
        });
    }, [gltf, skinColor]);

    // Clothing swap
    useEffect(() => {
        if (!gltf?.scene) return;
        gltf.scene.traverse((obj: any) => {
            if (obj.isMesh) {
                const name = (obj.name || "").toLowerCase();
                if (name.startsWith("cloth_") || name.startsWith("outfit_")) {
                    if (!clothingKey) {
                        obj.visible = false;
                    } else {
                        obj.visible = name.includes(clothingKey.toLowerCase());
                    }
                }
            }
        });
    }, [gltf, clothingKey]);

    // Animation handling
    useEffect(() => {
        if (!actions || !mixer) return;

        // Pass to top-level window API map instead of direct local calls so we trigger procedurals
        if (activeAnimation) {
            (window as any).__playAvatarAnimation?.(activeAnimation);
        } else {
            // Fallback idle
            if (Object.keys(actions).length > 0) {
                const first = actions[Object.keys(actions)[0]];
                Object.values(actions).forEach((a: any) => a.stop());
                if (first) first.reset().fadeIn(0.25).play();
            }
        }
    }, [actions, activeAnimation, mixer]);

    useEffect(() => {
        if (!gltf?.scene) return;
        gltf.scene.traverse((obj: any) => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
    }, [gltf]);

    return <primitive ref={groupRef} object={gltf.scene} dispose={null} />;
}

// Expose preload so Suspense works correctly
if ((useGLTF as any).preload) {
    // Keep triple shake friendly
}
