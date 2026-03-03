import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Float, Text3D, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSmythOSState } from "../state/smythos/reducer";
import { buildLemonadeLiquidGlassMaterial } from "../state/smythos/material-utils";

interface AISphereCoreProps {
    isActive?: boolean;
}

const AISphereCore: React.FC<AISphereCoreProps> = ({ isActive = true }) => {
    const state = useSmythOSState();

    // Safely load textures without dropping the component via Suspense
    const [activeTexture, setActiveTexture] = useState<THREE.Texture | null>(null);

    // Get the base texture URL if it exists in the Reducer Array
    const textureBase = state.textures.find(t => t.type === 'base');

    useEffect(() => {
        if (textureBase?.url) {
            new THREE.TextureLoader().load(textureBase.url, (tex) => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                tex.repeat.set(2, 2);
                setActiveTexture(tex);
            });
        } else {
            setActiveTexture(null);
        }
    }, [textureBase]);

    // Build the extremely precise Lemonade Liquid Glass properties map
    const materialProps = buildLemonadeLiquidGlassMaterial(state);

    // If it's not the active carousel item, we slow it down and dim it slightly
    // Assuming UI/Speed controls are hardcoded for now until we move them to Reducer
    const activeSpeedMulti = isActive ? 1.0 : 0.2;
    const opacityMulti = isActive ? 1 : 0.4;

    // Read XYZ spatial transform
    const t = state.pbr.transform;

    const techGridRef = React.useRef<THREE.MeshStandardMaterial>(null);
    const materialRef = React.useRef<THREE.MeshPhysicalMaterial>(null);
    const arcLightRef = React.useRef<THREE.SpotLight>(null);

    useFrame((stateObj, delta) => {
        const time = stateObj.clock.getElapsedTime();

        // 0. Arc Reactor Heartbeat
        if (state.pbr.chestLight && arcLightRef.current) {
            // Base intensity 3, pulse up to 6 smoothly
            arcLightRef.current.intensity = 3.5 + Math.sin(time * 3) * 2.5;
        }

        // 1. Neon Disco Flash Effect
        if (state.pbr.discoFlash && techGridRef.current) {
            const hue = (time * 0.8) % 1; // Cycle colors rapidly
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            techGridRef.current.color = color;
            techGridRef.current.emissive = color;
            techGridRef.current.emissiveIntensity = 2.0 + Math.sin(time * 15) * 1.5;
        } else if (techGridRef.current) {
            // Restore normal behavior if disabled
            techGridRef.current.color.set(state.pbr.emissiveHex);
            techGridRef.current.emissive.set(state.pbr.emissiveHex);
            techGridRef.current.emissiveIntensity = isActive ? 0.6 : 0.2;
        }

        // 2. Liquid Raindrop Effect (Animate the bump texture offset)
        if (state.pbr.raindrops && activeTexture && materialRef.current) {
            // Water runs down the core
            activeTexture.offset.y -= delta * 0.5;
            // Add a horizontal jitter for turbulence/liquid feel
            activeTexture.offset.x = Math.sin(time * 10) * 0.01;
        }
    });

    return (
        <Float speed={2.5 * activeSpeedMulti} rotationIntensity={0.8} floatIntensity={1.5}>
            <group scale={isActive ? 1 : 0.8} position={[t.x, t.y, t.z]}>
                {/* Main AI Body - Advanced PBR Material mapped directly from Reducer */}
                <mesh>
                    <sphereGeometry args={[1.2, 64, 64]} />
                    <meshPhysicalMaterial
                        ref={materialRef}
                        {...materialProps}
                        bumpMap={activeTexture || undefined}
                        bumpScale={activeTexture ? (state.pbr.raindrops ? 0.15 : 0.05) : 0}
                        opacity={opacityMulti}
                    />
                </mesh>

                {/* Arc Reactor Chest Light! */}
                {state.pbr.chestLight && (
                    <spotLight
                        ref={arcLightRef}
                        position={[0, 0, 1.4]}
                        angle={0.6}
                        penumbra={0.4}
                        intensity={4}
                        color={state.pbr.discoFlash ? "#ff00ff" : "#00FFFF"}
                        distance={10}
                        castShadow
                    />
                )}

                {/* True 3D Recessed Logo */}
                {state.ui.presetId && (
                    <Center position={[0, 0, 1.15]}>
                        <Text3D
                            font="/fonts/Roboto_Bold.json"
                            size={0.6}
                            height={0.15} // Depth of the text itself
                            curveSegments={12}
                            bevelEnabled
                            bevelThickness={0.02}
                            bevelSize={0.01}
                            bevelOffset={0}
                            bevelSegments={5}
                        >
                            {state.ui.presetId}
                            <meshStandardMaterial
                                color={"#000"}
                                roughness={0.8}
                                metalness={0.1}
                                transparent
                                opacity={opacityMulti}
                            />
                        </Text3D>
                    </Center>
                )}

                {/* Glowing Core / Tech Grid Accent */}
                <mesh scale={[1.02, 1.02, 1.02]}>
                    <sphereGeometry args={[1.2, 32, 32]} />
                    <meshStandardMaterial
                        ref={techGridRef}
                        color={state.pbr.emissiveHex}
                        emissive={state.pbr.emissiveHex}
                        emissiveIntensity={isActive ? 0.6 : 0.2}
                        transparent
                        opacity={isActive ? 0.4 : 0.1}
                        wireframe={true}
                    />
                </mesh>

                {/* Orbiting Tech Rings - Assuming legacy cyan/indigo for now until mapped to PBR colors */}
                <group rotation={[0, 0, 0]}>
                    <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
                        <torusGeometry args={[1.7, 0.04, 16, 100]} />
                        <meshStandardMaterial color={"#00d8ff"} emissive={"#00d8ff"} emissiveIntensity={isActive ? 1.5 : 0.3} transparent opacity={opacityMulti} />
                    </mesh>
                    <mesh rotation={[Math.PI / 1.8, -0.4, 0]}>
                        <torusGeometry args={[2.0, 0.015, 16, 100]} />
                        <meshStandardMaterial color={"#4f46e5"} emissive={"#4f46e5"} emissiveIntensity={isActive ? 2 : 0.4} transparent opacity={opacityMulti} />
                    </mesh>
                    <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}>
                        <torusGeometry args={[2.2, 0.01, 16, 100]} />
                        <meshStandardMaterial color={"#e879f9"} emissive={"#e879f9"} emissiveIntensity={isActive ? 1 : 0.2} transparent opacity={opacityMulti} />
                    </mesh>
                </group>
            </group>
        </Float>
    );
};

export default AISphereCore;
