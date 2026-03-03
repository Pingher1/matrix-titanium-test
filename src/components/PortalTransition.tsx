import React, { useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";
import { useSmythOSState, useSmythOSDispatch } from "../state/smythos/reducer";

/**
 * PortalTransition:
 * - Crossfades a fullscreen overlay when ui.currentPanel changes.
 * - Optionally calls onMidpoint to switch environment or perform heavy work.
 *
 * Usage: <PortalTransition />
 * It reads ui.currentPanel from AvatarUIState and animates when it changes.
 */

export default function PortalTransition({ duration = 600 }: { duration?: number }) {
    const state = useSmythOSState();
    const dispatch = useSmythOSDispatch();
    const panel = state.ui.currentPanel; // "entrance" | "forge" | etc.

    // Boolean whether we are "in portal" (forge active)
    const inForge = panel === "forge";

    const transitions = useTransition(inForge, {
        from: { opacity: 0, transform: "scale(1.02)" },
        enter: { opacity: 1, transform: "scale(1.0)" },
        leave: { opacity: 0, transform: "scale(0.98)" },
        config: { duration },
    });

    // Optionally perform a mid-transition hook to switch heavy state
    useEffect(() => {
        if (inForge) {
            console.log("[TRANSITION] Forge entered, pre-loading heavy HDRIs");
        }
    }, [inForge, dispatch]);

    return (
        <>
            {transitions((styles, item) =>
                item ? (
                    <animated.div style={{
                        position: "fixed",
                        inset: 0,
                        pointerEvents: "none",
                        zIndex: 9998,
                        background: "radial-gradient(circle at 20% 20%, rgba(255,122,24,0.10), rgba(6,8,10,0.85))",
                        mixBlendMode: "screen",
                        ...styles,
                    }}
                    />
                ) : null
            )}
        </>
    );
}
