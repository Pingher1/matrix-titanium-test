import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from "react";

// --- Types ---
export interface IconPosition {
    left: number; // px from left of screen
    bottom: number; // px from bottom of screen
}

export type MaterialState = "solid" | "liquid" | "glass";

export interface TextureSlot {
    id: string; // uuid or cloud url
    url?: string;
    name?: string;
    type?: "base" | "normal" | "roughness" | "metalness" | "ao" | "emissive" | "thickness" | "noise";
    loaded?: boolean;
    metadata?: Record<string, any>;
}

export interface TransformState {
    x: number;
    y: number;
    z: number;
}

export interface PBRState {
    materialState: MaterialState;
    colorHex: string; // base color / tint (e.g. "#fff7b2")
    coreHue: number; // 0-360 slider for tint hue
    transmission: number; // 0-1 (transparency)
    roughness: number; // 0-1
    metalness: number; // 0-1
    thickness: number; // 0-5 (for refraction depth)
    ior: number; // index of refraction (e.g. 1.3-2.0)
    clearcoat: number; // 0-1
    clearcoatRoughness: number; // 0-1
    attenuationColor: string; // tint inside transmission
    attenuationDistance: number; // 0.001 - 10
    emissiveHex: string; // inner glow color
    emissiveIntensity: number; // 0-10
    envMapIntensity: number; // environment reflection intensity
    reflectivity: number; // additional reflectivity control
    sheen: number; // optional sheen parameter (0-1)
    normalScale: number; // multiplier for normal map strength
    bloomIntensity: number; // UI-only effect param

    // Custom Addition: Spatial translation controls
    transform: TransformState;

    // Phase 24 FX: Iron Man Bubbly AI
    chestLight: boolean;
    discoFlash: boolean;
    raindrops: boolean;
}

export interface LightingState {
    hdrIsLoaded: boolean;
    activeEnvMapId?: string;
    envMapUrls: Record<string, string>; // id->url for HDRI
    studioIntensity: number; // 0-10
    keyLightIntensity: number;
    rimLightIntensity: number;
    ambientIntensity: number;
}

export interface ExportState {
    exportReady: boolean;
    lastExportUrl?: string;
    autoSaveToCloud: boolean;
    cloudDestination?: "gcs" | "s3" | "azure";
    fileName?: string;
    includeTextures: boolean;
}

export interface AvatarUIState {
    // PBR + material (main)
    pbr: PBRState;

    // Loaded texture assets
    textures: TextureSlot[];

    // Lighting + HDR
    lighting: LightingState;

    // Export + persistence
    export: ExportState;

    // UI flags
    ui: {
        currentPanel: "entrance" | "forge" | "export" | "settings";
        isGenerating: boolean;
        voiceActive: boolean;
        selectedMeshId?: string;
        presetId?: string;
        iconPosition?: IconPosition;
    };

    // metadata
    createdAt?: string;
    updatedAt?: string;
    version?: string;
}
