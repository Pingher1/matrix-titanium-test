import { AvatarUIState } from "./avatar-ui-context";
import * as THREE from "three";

/**
 * Build MeshPhysicalMaterial parameters based on AvatarUIState.pbr
 * Returns props tuned precisely for the Lemonade Liquid Glass target.
 */
export function buildLemonadeLiquidGlassMaterial(state: AvatarUIState) {
    const p = state.pbr;
    // Convert hex strings to THREE.Color
    const color = new THREE.Color(p.colorHex);
    const emissive = new THREE.Color(p.emissiveHex || "#000000");
    const attenuationColor = new THREE.Color(p.attenuationColor || "#ffffff");

    // Base props tuned for lemonade liquid glass (these are the key numbers from SmythOS)
    const materialProps: Record<string, any> = {
        // Visual core
        color: color,
        emissive: emissive,
        emissiveIntensity: p.emissiveIntensity,

        // Transmission + refraction
        transparent: true,
        transmission: Math.min(Math.max(p.transmission, 0), 1),
        thickness: p.thickness,
        ior: p.ior,

        // Surface
        roughness: p.roughness,
        metalness: p.metalness,

        // Clearcoat for strong glossy outer shell
        clearcoat: p.clearcoat,
        clearcoatRoughness: p.clearcoatRoughness,

        reflectivity: p.reflectivity,
        envMapIntensity: p.envMapIntensity,

        // Attenuation: tints light passing through volume
        attenuationColor: attenuationColor,
        attenuationDistance: p.attenuationDistance,

        // Sheen
        sheen: p.sheen,
    };

    // Maps: find textures in state.textures by type
    const texturesByType = state.textures.reduce<Record<string, string>>((acc, t) => {
        if (t.type) acc[t.type] = t.url || "";
        return acc;
    }, {});

    // Mapping helper
    if (texturesByType["base"]) materialProps.map = texturesByType["base"];
    if (texturesByType["normal"]) materialProps.normalMap = texturesByType["normal"];
    if (texturesByType["roughness"]) materialProps.roughnessMap = texturesByType["roughness"];
    if (texturesByType["metalness"]) materialProps.metalnessMap = texturesByType["metalness"];
    if (texturesByType["ao"]) materialProps.aoMap = texturesByType["ao"];
    if (texturesByType["thickness"]) materialProps.thicknessMap = texturesByType["thickness"];
    if (texturesByType["emissive"]) materialProps.emissiveMap = texturesByType["emissive"];

    return materialProps;
}
