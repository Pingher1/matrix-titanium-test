import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import ModelLoader from "./ModelLoader";
import HDRIEnvironment from "./HDRIEnvironment";
import AISphereCore from "./AISphereCore";

const PepperCoreCanvas: React.FC = () => {
    // Pepper is currently in her "Orb" ethereal state, as no physical GLB has been confirmed.
    // If a model is injected later, we hardcode her visual state here so the Forge cannot mutate her.
    const modelUrl = ""; // E.g., "/models/pepper.glb"
    const skinColor = "#fcdbb4";
    const clothing = "none";
    const activeAnimation = "idle";

    const Loader = () => (
        <Html center>
            <div className="text-white px-4 py-2 rounded shadow-lg bg-black/60 pointer-events-none whitespace-nowrap">
                Loading KRONOS Architect...
            </div>
        </Html>
    );

    // Front Door cinematic camera parameters
    const camera = useMemo(() => ({
        position: [0, 1.4, 7.0] as [number, number, number],
        fov: 50,
    }), []);

    return (
        <Canvas shadows camera={camera} gl={{ preserveDrawingBuffer: true }} className="w-full h-full pointer-events-auto">
            {/* Ambient/Key lighting distinct for the Front Door */}
            <ambientLight intensity={0.6} />
            <directionalLight intensity={0.8} position={[2, 5, 2]} castShadow />

            {/* AI Sphere Custom Glow Lighting for Pepper */}
            {!modelUrl && (
                <>
                    <pointLight position={[10, 10, 10]} intensity={2.0} color="#00ff41" />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#008f11" />
                </>
            )}

            <Suspense fallback={<Loader />}>
                {/* 360 HDRI Environment */}
                <HDRIEnvironment background={true} />

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

export default PepperCoreCanvas;
