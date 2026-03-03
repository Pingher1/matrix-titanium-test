import {
    AnimationClip,
    NumberKeyframeTrack,
    QuaternionKeyframeTrack,
    VectorKeyframeTrack,
    MathUtils,
    Object3D,
    Euler,
    Quaternion,
} from "three";

/**
 * animationRegistry 
 * Provides:
 * - registerClip(name) to add authored clip names discovered in GLTF 
 * - defineProcedural(name, desc) to register procedural ids 
 * - list() to list all available names (clips + procedural)
 * - createProceduralClip(id, root) to create an AnimationClip for a given scene root 
 *
 * Procedural generators create simple, short tracks (position/rotation/scale) targeted at common bones.
 */

type ClipEntry = { type: "clip"; name: string; action?: any };
type ProcEntry = { type: "procedural"; id: string; desc: string };

const registry = new Map<string, ClipEntry | ProcEntry>();

/* helper: find node by many common name variants */
function findNode(root: Object3D | null, names: string[]): Object3D | null {
    if (!root) return null;
    for (const n of names) {
        // exact name search 
        const node = root.getObjectByName(n);
        if (node) return node;
    }
    // try case-insensitive match across scene 
    const lname = (s: string) => s.toLowerCase();
    const desired = new Set(names.map(lname));
    let found: Object3D | null = null;
    root.traverse((o: any) => {
        if (found) return;
        if (typeof o.name === "string" && desired.has(lname(o.name))) found = o;
    });
    if (found) return found;
    // try suffix matches (e.g., "Head_JNT", "Head_geo")
    root.traverse((o: any) => {
        if (found) return;
        const on = (o.name || "").toLowerCase();
        for (const n of names) {
            if (on.endsWith(n.toLowerCase())) {
                found = o;
                return;
            }
        }
    });
    return found;
}

/* small helpers to create quaternion track from Euler degrees */
function makeEulerQuaternionValues(axis: "x" | "y" | "z", valuesRad: number[]) {
    const quats: number[] = [];
    for (const v of valuesRad) {
        const q = new Quaternion().setFromEuler(new Euler(axis === "x" ? v : 0, axis === "y" ? v : 0, axis === "z" ? v : 0, "XYZ"));
        quats.push(q.x, q.y, q.z, q.w);
    }
    return quats;
}

/* registry API */
export const animationRegistry = {
    register: (name: string, entry?: any) => registry.set(name, entry || { type: "clip", name }),
    registerClip: (name: string) => registry.set(name, { type: "clip", name }),
    defineProcedural: (id: string, desc: string) => registry.set(id, { type: "procedural", id, desc }),
    get: (name: string) => registry.get(name),
    list: () => Array.from(registry.keys()),
    createProceduralClip: (id: string, root: Object3D | null): AnimationClip | null => {
        // common node lookups 
        const headNode = findNode(root, ["Head", "head", "Head_JNT", "Hips", "Neck"]);
        const rightHand = findNode(root, ["Hand_R", "RightHand", "hand_r", "RightHand_jnt", "Hand.R"]);
        const leftHand = findNode(root, ["Hand_L", "LeftHand", "hand_l", "LeftHand_jnt", "Hand.L"]);
        const spine = findNode(root, ["Spine", "spine", "Spine1", "Chest"]);
        const rootNode = root || null;
        const hatNode = findNode(root, ["Hat", "hat", "Cap"]);

        switch (id) {
            //1. Idle (gentle breathing) - slight vertical position and chest rotation if spine exists 
            case "Idle": {
                const tracks: any[] = [];
                const r = rootNode;
                if (r) {
                    const times = [0, 1.0, 2.0];
                    const vals = [0, 0.01, 0, 0, -0.01, 0, 0, 0.01, 0]; // tiny Y oscillation sequence (loop)
                    // Use position.y track on root to simulate breathing tracks.push(new NumberKeyframeTrack(`${r.name}.position[y]`, times, [0,0.01,0]));
                    tracks.push(new NumberKeyframeTrack(`${r.name}.position[y]`, times, [0, 0.01, 0]));
                }
                // subtle head nod variant to sell idle_breath 
                if (headNode) {
                    const times = [0, 1.0, 2.0];
                    const qvals = makeEulerQuaternionValues("x", [0, 0.015, 0]); // tiny nod (radians)
                    tracks.push(new QuaternionKeyframeTrack(`${headNode.name}.quaternion`, times, qvals));
                }
                return new AnimationClip("Idle", 2.0, tracks);
            }

            //2. Idle_SoftNod (gentle repeated single nod)
            case "Idle_SoftNod": {
                if (!headNode && !rootNode) return null;
                const times = [0, 0.4, 0.8];
                const qvals = headNode ? makeEulerQuaternionValues("x", [0, 0.12, 0]) : null;
                const tracks: any[] = [];
                if (headNode && qvals) tracks.push(new QuaternionKeyframeTrack(`${headNode.name}.quaternion`, times, qvals));
                else if (rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[y]`, times, [0, 0.01, 0]));
                return new AnimationClip("Idle_SoftNod", 0.8, tracks);
            }

            //3. Wave_Hello (short one-hand wave from right hand)
            case "Wave_Hello": {
                if (!rightHand) return null;
                const times = [0, 0.2, 0.4, 0.6, 0.8];
                // rotate z back-and-forth to simulate waving 
                const vals = [0, 0.6, -0.6, 0.6, 0];
                return new AnimationClip("Wave_Hello", 0.9, [new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, times, vals)]);
            }

            //4. Wave_ThreeTimes (three small waves)
            case "Wave_ThreeTimes": {
                if (!rightHand) return null;
                const times = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 0.96];
                const vals = [0, 0.55, -0.55, 0.55, -0.55, 0.55, 0];
                return new AnimationClip("Wave_ThreeTimes", 1.0, [new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, times, vals)]);
            }

            //5. PresentBook (two-hand present forward)
            case "PresentBook": {
                // Try to move both hands forward and rotate wrist slightly; fallback to root forward motion 
                const tracks: any[] = [];
                if (leftHand) {
                    tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[x]`, [0, 0.3, 0.8], [0, -0.9, -0.7]));
                    tracks.push(new NumberKeyframeTrack(`${leftHand.name}.position[z]`, [0, 0.3, 0.8], [0, -0.06, -0.03]));
                }
                if (rightHand) {
                    tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, [0, 0.3, 0.8], [0, -0.9, -0.7]));
                    tracks.push(new NumberKeyframeTrack(`${rightHand.name}.position[z]`, [0, 0.3, 0.8], [0, -0.06, -0.03]));
                }
                if (tracks.length === 0 && rootNode) {
                    tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[z]`, [0, 0.3, 0.8], [0, -0.06, -0.03]));
                }
                return new AnimationClip("PresentBook", 1.2, tracks);
            }

            //6. ReadLoop (subtle mouth/head bob + small breathing)
            case "ReadLoop": {
                const tracks: any[] = [];
                if (headNode) {
                    tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[x]`, [0, 0.5, 1.0], [0, 0.06, 0]));
                }
                if (rootNode) {
                    tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.7, 1.4], [0, 0.01, 0]));
                }
                return new AnimationClip("ReadLoop", 1.4, tracks);
            }

            //7. PageFlip (one-hand quick flip)
            case "PageFlip": {
                if (!rightHand) {
                    if (!leftHand) return null;
                    // use left if right not present 
                    const times = [0, 0.12, 0.28];
                    return new AnimationClip("PageFlip", 0.45, [new NumberKeyframeTrack(`${leftHand.name}.rotation[x]`, times, [0, -1.1, 0])]);
                }
                const times = [0, 0.12, 0.28];
                return new AnimationClip("PageFlip", 0.45, [new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, times, [0, -1.1, 0])]);
            }

            //8. Point_Right 
            case "Point_Right": {
                if (!rightHand) return null;
                const times = [0, 0.25, 0.5];
                // raise and extend right hand 
                return new AnimationClip("Point_Right", 0.6, [
                    new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, times, [0, -0.9, -0.6]),
                    new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, times, [0, 0.15, 0.08]),
                ]);
            }

            //9. Point_Left 
            case "Point_Left": {
                if (!leftHand) return null;
                return new AnimationClip("Point_Left", 0.6, [
                    new NumberKeyframeTrack(`${leftHand.name}.rotation[x]`, [0, 0.25, 0.5], [0, -0.9, -0.6]),
                    new NumberKeyframeTrack(`${leftHand.name}.rotation[z]`, [0, 0.25, 0.5], [0, -0.15, -0.08]),
                ]);
            }

            //10. Clapping (both hands move inward then outward)
            case "Clapping": {
                const tracks: any[] = [];
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.position[x]`, [0, 0.2, 0.4], [0, 0.06, 0]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.position[x]`, [0, 0.2, 0.4], [0, -0.06, 0]));
                if (tracks.length === 0 && rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.2, 0.4], [0, -0.02, 0]));
                return new AnimationClip("Clapping", 0.6, tracks);
            }

            //11. TipHat 
            case "TipHat": {
                const tracks: any[] = [];
                // rotate head slightly and move hand up if hat exists 
                if (headNode) tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[z]`, [0, 0.25, 0.5], [0, -0.35, 0]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, [0, 0.25, 0.5], [0, -0.8, 0]));
                if (hatNode) tracks.push(new NumberKeyframeTrack(`${hatNode.name}.rotation[z]`, [0, 0.25, 0.5], [0, -0.35, 0]));
                if (tracks.length === 0 && rootNode) {
                    // fallback: small root bow 
                    tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[z]`, [0, 0.25, 0.5], [0, -0.05, 0]));
                }
                return new AnimationClip("TipHat", 0.9, tracks);
            }

            //12. Bow_Deep 
            case "Bow_Deep": {
                const tracks: any[] = [];
                if (spine) tracks.push(new NumberKeyframeTrack(`${spine.name}.rotation[x]`, [0, 0.4, 0.9], [0, 0.8, 0.2]));
                else if (rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[z]`, [0, 0.4, 0.9], [0, -0.18, -0.02]));
                return new AnimationClip("Bow_Deep", 1.0, tracks);
            }

            //13. Shrug 
            case "Shrug": {
                const tracks: any[] = [];
                // rotate both shoulders/hands slightly outward if present (approx)
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[z]`, [0, 0.2, 0.4], [0, 0.25, 0]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, [0, 0.2, 0.4], [0, -0.25, 0]));
                else if (rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.rotation[y]`, [0, 0.2, 0.4], [0, 0.06, 0]));
                return new AnimationClip("Shrug", 0.6, tracks);
            }

            //14. Facepalm 
            case "Facepalm": {
                if (!rightHand && !leftHand) return null;
                const hand = rightHand || leftHand!;
                return new AnimationClip("Facepalm", 1.0, [new NumberKeyframeTrack(`${hand.name}.rotation[x]`, [0, 0.3, 0.8], [0, -1.3, -0.6])]);
            }

            //15. Head_Shake_No 
            case "Head_Shake_No": {
                if (!headNode) return null;
                const times = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
                // small Y-rotation oscillation for "no"
                const vals = makeEulerQuaternionValues("y", [0, 0.35, -0.35, 0.35, -0.35, 0]);
                return new AnimationClip("Head_Shake_No", 0.9, [new QuaternionKeyframeTrack(`${headNode.name}.quaternion`, times, vals)]);
            }

            //16. Head_Nod_Yes 
            case "Head_Nod_Yes": {
                if (!headNode) return null;
                const times = [0, 0.12, 0.24, 0.36, 0.48];
                const qvals = makeEulerQuaternionValues("x", [0, 0.25, -0.12, 0.25, 0]);
                return new AnimationClip("Head_Nod_Yes", 0.6, [new QuaternionKeyframeTrack(`${headNode.name}.quaternion`, times, qvals)]);
            }

            //17. Laugh_Point (small laugh + point)
            case "Laugh_Point": {
                const tracks: any[] = [];
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, [0, 0.3, 0.6], [0, 0.7, 0]));
                if (headNode) tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[x]`, [0, 0.3, 0.6], [0, -0.08, 0]));
                return new AnimationClip("Laugh_Point", 0.8, tracks);
            }

            //18. Dance_TwoStep 
            case "Dance_TwoStep": {
                if (!rootNode) return null;
                const times = [0, 0.25, 0.5, 0.75, 1.0];
                const vals = [0, 0.06, -0.06, 0.06, 0];
                return new AnimationClip("Dance_TwoStep", 1.0, [new NumberKeyframeTrack(`${rootNode.name}.position[x]`, times, vals)]);
            }

            //19. RockStarPose 
            case "RockStarPose": {
                const tracks: any[] = [];
                if (spine) tracks.push(new NumberKeyframeTrack(`${spine.name}.rotation[y]`, [0, 0.2, 0.6], [0, 0.35, 0]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, [0, 0.2, 0.6], [0, -1.2, -0.9]));
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[z]`, [0, 0.2, 0.6], [0, 0.6, 0.3]));
                return new AnimationClip("RockStarPose", 1.2, tracks);
            }

            //20. JazzHands 
            case "JazzHands": {
                const tracks: any[] = [];
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[z]`, [0, 0.15, 0.3, 0.45], [0, 0.9, -0.9, 0]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, [0, 0.15, 0.3, 0.45], [0, -0.9, 0.9, 0]));
                return new AnimationClip("JazzHands", 0.9, tracks);
            }

            //21. ThinkPose (hand on chin)
            case "ThinkPose": {
                const tracks: any[] = [];
                const hand = rightHand || leftHand;
                if (!hand) return null;
                tracks.push(new NumberKeyframeTrack(`${hand.name}.rotation[x]`, [0, 0.3], [0, -1.0]));
                if (headNode) tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[x]`, [0, 0.3], [0, 0.12]));
                return new AnimationClip("ThinkPose", 1.0, tracks);
            }

            //22. Celebrate (raise arms)
            case "Celebrate": {
                const tracks: any[] = [];
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[x]`, [0, 0.25], [0, -1.35]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, [0, 0.25], [0, -1.35]));
                if (!leftHand && !rightHand && rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.25], [0, 0.06]));
                return new AnimationClip("Celebrate", 0.8, tracks);
            }

            //23. SitDown 
            case "SitDown": {
                if (!rootNode) return null;
                return new AnimationClip("SitDown", 1.2, [new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.6, 1.2], [0, -0.6, -0.6])]);
            }

            //24. StandUp 
            case "StandUp": {
                if (!rootNode) return null;
                return new AnimationClip("StandUp", 1.0, [new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.5, 1.0], [-0.6, 0, 0])]);
            }

            //25. RunInPlace 
            case "RunInPlace": {
                if (!rootNode) return null;
                return new AnimationClip("RunInPlace", 0.8, [new NumberKeyframeTrack(`${rootNode.name}.position[z]`, [0, 0.2, 0.4, 0.6, 0.8], [0, 0.02, -0.02, 0.02, 0])]);
            }

            //26. PeekOver (lean forward, peek)
            case "PeekOver": {
                if (!rootNode && !headNode) return null;
                const tracks: any[] = [];
                if (headNode) tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[x]`, [0, 0.25, 0.6], [0, -0.25, -0.05]));
                else tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[z]`, [0, 0.25, 0.6], [0, -0.05, 0]));
                return new AnimationClip("PeekOver", 0.8, tracks);
            }

            //27. Surprise (hands up)
            case "Surprise": {
                const tracks: any[] = [];
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[x]`, [0, 0.2], [0, -1.2]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[x]`, [0, 0.2], [0, -1.2]));
                return new AnimationClip("Surprise", 0.7, tracks);
            }

            //28. Tada (sprightly reveal)
            case "Tada": {
                const tracks: any[] = [];
                if (rootNode) tracks.push(new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0, 0.12, 0.24], [0, 0.09, 0]));
                if (leftHand) tracks.push(new NumberKeyframeTrack(`${leftHand.name}.rotation[z]`, [0, 0.12], [0, 0.7]));
                if (rightHand) tracks.push(new NumberKeyframeTrack(`${rightHand.name}.rotation[z]`, [0, 0.12], [0, -0.7]));
                return new AnimationClip("Tada", 0.5, tracks);
            }

            //29. ClippyPaperclip (playful bounce)
            case "ClippyPaperclip": {
                if (!rootNode) return null;
                const times = [0, 0.18, 0.36, 0.54, 0.72, 0.9];
                const vals = [0, 0.08, -0.05, 0.08, -0.02, 0];
                return new AnimationClip("ClippyPaperclip", 1.0, [new NumberKeyframeTrack(`${rootNode.name}.position[y]`, times, vals)]);
            }

            //30. CameraPose (pose & wink)
            case "CameraPose": {
                const tracks: any[] = [];
                if (headNode) tracks.push(new NumberKeyframeTrack(`${headNode.name}.rotation[y]`, [0, 0.2], [0, 0.12]));
                // wink: simulate with morph target if available (not implemented here), fallback small head tilt 
                return new AnimationClip("CameraPose", 0.6, tracks);
            }

            default:
                return null;
        }
    },
};

// Register all procedural ids so they appear in listing even if clips not registered
[
    "Idle", "Idle_SoftNod", "Wave_Hello", "Wave_ThreeTimes", "PresentBook", "ReadLoop", "PageFlip",
    "Point_Right", "Point_Left", "Clapping", "TipHat", "Bow_Deep", "Shrug", "Facepalm", "Head_Shake_No",
    "Head_Nod_Yes", "Laugh_Point", "Dance_TwoStep", "RockStarPose", "JazzHands", "ThinkPose", "Celebrate",
    "SitDown", "StandUp", "RunInPlace", "PeekOver", "Surprise", "Tada", "ClippyPaperclip", "CameraPose"
].forEach((id) => {
    if (!registry.has(id)) registry.set(id, { type: "procedural", id, desc: `${id} (procedural fallback)` });
});

export default animationRegistry;
