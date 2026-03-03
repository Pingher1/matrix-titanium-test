import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export type BackdropKey = "none" | "studio" | "mad-scientist" | "vintage-bar" | "houston-galleria" | string;

const BackdropManager: React.FC<{ backdropKey: BackdropKey }> = ({ backdropKey }) => {
    const { scene } = useThree();

    useEffect(() => {
        if (backdropKey === "none" || backdropKey === "studio") {
            scene.background = null;
        } else if (backdropKey === "mad-scientist") {
            scene.background = new THREE.Color("#1a2b3c"); // Dark laboratory blue
        } else if (backdropKey === "vintage-bar") {
            scene.background = new THREE.Color("#3a2015"); // Warm mahogany brown
        } else if (backdropKey === "houston-galleria") {
            scene.background = new THREE.Color("#2a353c"); // Modern building slate
        }

        return () => {
            scene.background = null;
        };
    }, [scene, backdropKey]);

    return null;
};

export default BackdropManager;
