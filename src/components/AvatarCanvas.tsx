import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Float, Text } from "@react-three/drei";
import { useSmythOSState } from '../state/smythos/reducer';
import ModelLoader from "./ModelLoader";
import HDRIEnvironment from "./HDRIEnvironment";
import AISphereCore from "./AISphereCore";
import ExportHandler from "./ExportHandler";

const AvatarCanvas: React.FC = () => {
    const state = useSmythOSState();

    // Fallback mappings from legacy AvatarUI Context
    const modelUrl = state.export.lastExportUrl;
    const skinColor = "#fcdbb4";
    const clothing = "none";
    const activeAnimation = "idle";

    // Basic fallback while model loads
    const Loader = () => (
        <Html center>
            <div className="text-white px-4 py-2 rounded shadow-lg bg-black/60 pointer-events-none whitespace-nowrap">
                Loading avatar model...
            </div>
        </Html>
    );

    // Camera presets modified for "Grand Hallway" projector scale
    const camera = useMemo(() => ({
        position: [0, 1.4, 7.0] as [number, number, number],
        fov: 50,
    }), []);

    return (
        <Canvas shadows camera={camera} gl={{ preserveDrawingBuffer: true }} className="w-full h-full">
            {/* Global window listener for external topology serialization calls */}
            <ExportHandler />

            {/* Ambient/Key lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight intensity={0.8} position={[2, 5, 2]} castShadow />

            {/* AI Sphere Custom Glow Lighting */}
            {!modelUrl && (
                <>
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                    <pointLight position={[-10, -10, -10]} intensity={2} color="#00d8ff" />
                </>
            )}

            <Suspense fallback={<Loader />}>
                {/* Dynamic 360 HDRI Environment mapped from State */}
                <HDRIEnvironment background={true} />

                {/* ModelLoader handles GLTF loading and runtime updates */}
                {modelUrl ? (
                    <ModelLoader
                        modelUrl={modelUrl}
                        skinColor={skinColor}
                        clothingKey={clothing}
                        activeAnimation={activeAnimation}
                    />
                ) : (
                    <AISphereCore />
                )}
            </Suspense>

            <OrbitControls
                enablePan={false}
                maxPolarAngle={Math.PI / 1.9}
                minDistance={2.0}
                maxDistance={15.0}
            />
        </Canvas>
    );
};

export default AvatarCanvas;
