import { AvatarUIState } from "./avatar-ui-context";

export const DEFAULT_AVATAR_UI_STATE: AvatarUIState = {
    pbr: {
        materialState: "glass",
        colorHex: "#fff6c8", // pale lemonade base
        coreHue: 50, // yellow spectrum
        transmission: 0.95,
        roughness: 0.03,
        metalness: 0.2, // increased slightly to give it a solid boundary structure
        thickness: 0.9,
        ior: 1.52,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        attenuationColor: "#ffd85c", // stronger lemonade tint inside
        attenuationDistance: 0.8,
        emissiveHex: "#fff4b0",
        emissiveIntensity: 0.6,
        envMapIntensity: 1.2,
        reflectivity: 0.9,
        sheen: 0.05,
        normalScale: 0.6,
        bloomIntensity: 0.7,

        // Spatial positioning (X, Y, Z centered default)
        transform: { x: 0, y: 0, z: 0 },

        // Phase 24: Iron Man FX Defaults
        chestLight: false,
        discoFlash: false,
        raindrops: false,
    },
    textures: [],
    lighting: {
        hdrIsLoaded: false,
        activeEnvMapId: undefined,
        envMapUrls: {},
        studioIntensity: 1.4,
        keyLightIntensity: 1.2,
        rimLightIntensity: 0.9,
        ambientIntensity: 0.35,
    },
    export: {
        exportReady: false,
        lastExportUrl: undefined,
        autoSaveToCloud: false,
        cloudDestination: undefined,
        fileName: "avatar.glb",
        includeTextures: true,
    },
    ui: {
        currentPanel: "entrance",
        isGenerating: false,
        voiceActive: false,
        selectedMeshId: undefined,
        presetId: undefined,
        iconPosition: { left: 18, bottom: 18 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0.0",
};
