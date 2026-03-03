import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import HDRIEnvironment from "./HDRIEnvironment";
import { useNavigate } from "react-router-dom";
import { useSmythOSState, useSmythOSDispatch } from "../state/smythos/reducer";

function SphereMesh({ size = 1.0 }: { size?: number }) {
    const state = useSmythOSState();
    const ref = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

    useEffect(() => {
        matRef.current = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(state.pbr.colorHex),
            emissive: new THREE.Color(state.pbr.emissiveHex),
            emissiveIntensity: state.pbr.emissiveIntensity,
            transparent: true,
            transmission: state.pbr.transmission,
            thickness: state.pbr.thickness,
            ior: state.pbr.ior,
            roughness: state.pbr.roughness,
            metalness: state.pbr.metalness,
            clearcoat: state.pbr.clearcoat,
            clearcoatRoughness: state.pbr.clearcoatRoughness,
            envMapIntensity: state.pbr.envMapIntensity,
            reflectivity: state.pbr.reflectivity,
        });
    }, [state.pbr]);

    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.rotation.y += 0.6 * dt;
        const t = performance.now() / 1000;
        ref.current.position.y = Math.sin(t * 1.4) * 0.04;

        if (matRef.current) {
            matRef.current.emissiveIntensity = state.ui.voiceActive ? state.pbr.emissiveIntensity + 0.9 : state.pbr.emissiveIntensity;
        }
    });

    return (
        <mesh ref={ref} scale={[size, size, size]}>
            <sphereGeometry args={[0.45, 64, 64]} />
            <primitive object={matRef.current ?? new THREE.MeshPhysicalMaterial()} attach="material" />
        </mesh>
    );
}

export default function RROTIcon() {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const left = state.ui.iconPosition?.left ?? 18;
    const bottom = state.ui.iconPosition?.bottom ?? 18;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        el.style.left = `${left}px`;
        el.style.bottom = `${bottom}px`;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let origLeft = left;
        let origBottom = bottom;

        const onPointerDown = (ev: PointerEvent) => {
            if (ev.button !== 0) return;
            dragging = true;
            startX = ev.clientX;
            startY = ev.clientY;
            const rect = el.getBoundingClientRect();
            origLeft = rect.left;
            origBottom = window.innerHeight - rect.bottom;
            (ev.target as Element).setPointerCapture?.(ev.pointerId);
            ev.preventDefault();
        };

        const onPointerMove = (ev: PointerEvent) => {
            if (!dragging) return;
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            const newLeft = Math.max(8, Math.min(window.innerWidth - el.clientWidth - 8, Math.round(origLeft + dx)));
            const newBottom = Math.max(8, Math.min(window.innerHeight - el.clientHeight - 8, Math.round(origBottom + -dy)));
            el.style.left = `${newLeft}px`;
            el.style.bottom = `${newBottom}px`;
        };

        const onPointerUp = (ev: PointerEvent) => {
            if (!dragging) return;
            dragging = false;
            try { (ev.target as Element).releasePointerCapture?.(ev.pointerId); } catch { }

            const rect = el.getBoundingClientRect();
            const persistedLeft = Math.round(rect.left);
            const persistedBottom = Math.round(window.innerHeight - rect.bottom);
            dispatch({ type: "SET_ICON_POSITION", payload: { left: persistedLeft, bottom: persistedBottom } });
        };

        el.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
            el.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [dispatch]);

    const onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Route to the active Forge
        navigate('/forge');
        dispatch({ type: "SET_UI", payload: { currentPanel: "forge" } });
    };

    return (
        <div ref={containerRef}
            role="button"
            aria-label={`RROT Assistant — ${state.ui.voiceActive ? "voice on" : "voice off"}`}
            onClick={onClick}
            style={{
                position: "fixed",
                left: left,
                bottom: bottom,
                width: 84,
                height: 84,
                zIndex: 9999,
                cursor: "pointer",
                borderRadius: 999,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: state.ui.voiceActive ? "radial-gradient(circle, rgba(255,122,24,0.12), transparent)" : "transparent",
                boxShadow: state.ui.voiceActive ? "0 8px 28px rgba(255,122,24,0.2)" : "0 8px 20px rgba(0,0,0,0.6)",
                transition: "box-shadow 240ms ease, background 240ms ease",
                transform: "translateZ(0)",
                animation: state.ui.voiceActive ? 'rrotPulse 2.2s infinite' : undefined,
            }}
        >
            <style>
                {`
                @keyframes rrotPulse {
                    0% { box-shadow: 0 0 0 0 rgba(255,140,40,0.6); }
                    70% { box-shadow: 0 0 24px 14px rgba(255,140,40,0); }
                    100% { box-shadow: 0 0 0 0 rgba(255,140,40,0); }
                }
                `}
            </style>
            <Canvas camera={{ position: [0, 0, 2.2], fov: 40 }} style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[3, 3, 2]} intensity={0.6} />
                <SphereMesh size={1} />
                <HDRIEnvironment background={false} />
            </Canvas>
        </div>
    );
}
