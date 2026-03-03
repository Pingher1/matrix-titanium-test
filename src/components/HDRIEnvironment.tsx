import React, { useMemo } from "react";
import { Environment } from "@react-three/drei";
import { useSmythOSState } from "../state/smythos/reducer";

/**
 * HDRIEnvironment
 * - Reads state.lighting.activeEnvMapId and renders an Environment.
 * - Accepts preset keys: "studio" | "city" | "sunset" | "dawn" | "night" | "lemonade"
 */

const PRESET_MAP: Record<string, any> = {
    studio: { preset: "studio" },
    city: { preset: "city" },
    sunset: { preset: "sunset" },
    dawn: { preset: "dawn" },
    night: { preset: "night" },
};

export default function HDRIEnvironment({ background = true }: { background?: boolean }) {
    const state = useSmythOSState();
    const id = state.lighting.activeEnvMapId || "studio";

    const cfg = useMemo(() => PRESET_MAP[id] ?? PRESET_MAP["studio"], [id]);

    if (cfg.preset) {
        return <Environment preset={cfg.preset} background={background} blur={0.04} />;
    }

    if (cfg.url) {
        return <Environment files={cfg.url} background={background} blur={0.04} />;
    }

    return <Environment preset="studio" background={background} blur={0.04} />;
}
