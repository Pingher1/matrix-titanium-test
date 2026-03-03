import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";
import HDRIEnvironment from "./HDRIEnvironment";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

export default function AvatarViewer({ modelUrl }: { modelUrl: string | null }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-transparent">
      {!modelUrl ? (
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#00d8ff" />
          <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.5}>
            <group>
              {/* Main AI Body - Silver/Chrome */}
              <mesh>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial color="#888888" roughness={0.15} metalness={0.9} />
              </mesh>

              {/* Glowing Core / Tech Grid Accent */}
              <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshStandardMaterial color="#00d8ff" emissive="#00d8ff" emissiveIntensity={0.6} transparent opacity={0.4} wireframe={true} />
              </mesh>

              {/* Orbiting Tech Rings */}
              <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
                <torusGeometry args={[1.7, 0.04, 16, 100]} />
                <meshStandardMaterial color="#00d8ff" emissive="#00d8ff" emissiveIntensity={1.5} />
              </mesh>
              <mesh rotation={[Math.PI / 1.8, -0.4, 0]}>
                <torusGeometry args={[2.0, 0.015, 16, 100]} />
                <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={2} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, Math.PI / 4]}>
                <torusGeometry args={[2.2, 0.01, 16, 100]} />
                <meshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={1} />
              </mesh>
            </group>
          </Float>
          <HDRIEnvironment background={true} />
        </Canvas>
      ) : (
        <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5}>
              <PresentationControls
                global
                snap={true}
                rotation={[0, 0.3, 0]}
                polar={[-Math.PI / 3, Math.PI / 3]}
                azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
              >
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                  <Model url={modelUrl} />
                </Float>
              </PresentationControls>
            </Stage>
          </Suspense>
          <HDRIEnvironment background={true} />
          <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2.5} far={4.5} color="#4f46e5" />
        </Canvas>
      )}
    </div>
  );
}
