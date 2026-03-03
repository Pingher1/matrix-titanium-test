import { eventBus } from "./eventBus";

/**
 * Call initAvatarBridge once in a top-level component (eg App or AvatarDashboard).
 * This listens for avatar:action events and maps them into avatar state changes.
 */
export function initAvatarBridge() {
    const bridge = {
        playAnimation: (name: string) => {
            try {
                // Expose a global setter to ModelLoader 
                (window as any).__playAvatarAnimation?.(name);
            } catch (err) {
                console.warn("playAnimation failed", err);
            }
        },
        setMorph: (meshName: string, morphName: string, value: number) => {
            (window as any).__setMorph?.(meshName, morphName, value);
        },
        handPose: (poseName: string) => {
            (window as any).__playAvatarAnimation?.(poseName);
        },
    };

    eventBus.on("avatar:action", ({ action, payload }: any) => {
        switch (action) {
            case "presentBook":
                bridge.playAnimation("PresentBook");
                break;
            case "readLoop":
                bridge.playAnimation("ReadLoop");
                break;
            case "pageFlip":
                bridge.playAnimation("PageFlip");
                break;
            case "phoneme":
                bridge.playAnimation("Talk");
                break;
            case "setMorph":
                bridge.setMorph(payload.meshName, payload.morphName, payload.value);
                break;
            case "handPose":
                bridge.handPose(payload.poseName);
                break;
            default:
                console.warn("Unknown avatar action:", action);
        }
    });
}
