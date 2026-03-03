import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import AISphereCore from './AISphereCore';
import BackdropManager, { BackdropKey } from './BackdropManager';
import { useSmythOSState } from '../state/smythos/reducer';

interface AvatarCarouselProps {
    onSphereSelect: (id: string) => void;
}

const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ onSphereSelect }) => {
    const state = useSmythOSState();
    const [activeIndex, setActiveIndex] = useState(0);

    // Positions for the 3 spheres (A, B, C)
    const positions = [
        [0, 0, 0],       // Center (A - Holographic AI)
        [4, -1, -3],     // Right/Back (B - Blue)
        [-4, -1, -3]     // Left/Back (C - White)
    ];

    useEffect(() => {
        // Notify parent which sphere is currently front-and-center
        const sphereIds = ['A', 'B', 'C'];
        onSphereSelect(sphereIds[activeIndex]);
    }, [activeIndex, onSphereSelect]);

    // Spring animations for rotating the carousel positions
    const getSpringProps = (index: number) => {
        // Calculate relative position based on active index
        const relativeIndex = (index - activeIndex + 3) % 3;
        const pos = positions[relativeIndex] as [number, number, number];

        return useSpring({
            position: pos,
            scale: relativeIndex === 0 ? [1, 1, 1] : [0.6, 0.6, 0.6],
            config: { mass: 2, tension: 150, friction: 30 }
        });
    };

    const springA = getSpringProps(0);
    const springB = getSpringProps(1);
    const springC = getSpringProps(2);

    return (
        <Canvas shadows camera={{ position: [0, 1.4, 4], fov: 40 }} className="w-full h-full">
            <ambientLight intensity={0.6} />
            <directionalLight intensity={0.8} position={[2, 5, 2]} castShadow />
            <Environment preset="studio" />

            {/* Don't render backdrop if DigitalRain is handling the background via CSS */}
            {state.lighting.activeEnvMapId && <BackdropManager backdropKey={state.lighting.activeEnvMapId as BackdropKey} />}

            <group position={[0, -0.5, 0]}>
                {/* Sphere A: The Master Holographic AI Core */}
                <a.group position={springA.position as any} scale={springA.scale as any}>
                    <AISphereCore isActive={activeIndex === 0} />
                </a.group>

                {/* Sphere B: Placeholder Blue */}
                <a.group position={springB.position as any} scale={springB.scale as any}>
                    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                        <mesh>
                            <sphereGeometry args={[1.2, 64, 64]} />
                            <meshStandardMaterial color="#0055ff" roughness={0.1} metalness={0.8} transparent opacity={activeIndex === 1 ? 1 : 0.4} />
                        </mesh>
                    </Float>
                </a.group>

                {/* Sphere C: Placeholder White */}
                <a.group position={springC.position as any} scale={springC.scale as any}>
                    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                        <mesh>
                            <sphereGeometry args={[1.2, 64, 64]} />
                            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} transparent opacity={activeIndex === 2 ? 1 : 0.4} />
                        </mesh>
                    </Float>
                </a.group>
            </group>

            <OrbitControls
                enablePan={false}
                enableZoom={false}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.8}
            />

            {/* HTML UI Overlay for Carousel Controls */}
            <Html center position={[0, -2.2, 0]} zIndexRange={[100, 0]}>
                <div className="flex items-center gap-16 font-mono text-[#00ff41]/60 select-none">
                    <button
                        onClick={() => setActiveIndex((prev) => (prev - 1 + 3) % 3)}
                        className="px-6 py-2 border border-[#00ff41]/20 rounded-full hover:bg-[#00ff41]/10 hover:text-[#00ff41] transition-all tracking-widest text-sm backdrop-blur-md"
                    >
                        PREV
                    </button>

                    <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl font-black text-white italic tracking-[0.2em]">
                            {['A', 'B', 'C'][activeIndex]}
                        </div>
                        <div className="text-[#00ff41] text-xs tracking-[0.3em] font-bold mt-2">
                            SECTOR
                        </div>
                    </div>

                    <button
                        onClick={() => setActiveIndex((prev) => (prev + 1) % 3)}
                        className="px-6 py-2 border border-[#00ff41]/20 rounded-full hover:bg-[#00ff41]/10 hover:text-[#00ff41] transition-all tracking-widest text-sm backdrop-blur-md"
                    >
                        NEXT
                    </button>
                </div>
            </Html>
        </Canvas>
    );
};

export default AvatarCarousel;
