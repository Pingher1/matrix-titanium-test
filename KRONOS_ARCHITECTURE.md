# Kronos Avatar Forge - System Architecture & Progress Logs

This document serves as a persistent snapshot of the architectural decisions, components, and backend microservices that have been constructed for the Kronos Avatar Forge project. This is your "Save Point." If you or SMYTHOS need to reference how the 3D, UI, or Storybook pipelines operate, everything is logged here.

## 1. Global Application Architecture
The application has been restructured from a single-page viewer into a scalable, multi-suite React application using React Router and dynamic JSON configurations.

*   **`public/app-menus/menu-v1.json`**: The global routing configuration mapping the three major application suites (`Avatar Studio`, `Storybook Library`, and `Barbie World`).
*   **`src/state/MenuContext.tsx`**: A React Context that loads the JSON menu payload on bootstrap and provides the navigation mapping to the application.
*   **`src/components/AppTopNav.tsx`**: The unified top navigation menu that floats above all apps, featuring quick-switch routes between the three major suites.
*   **`src/App.tsx`**: The root entrypoint wrapped in `BrowserRouter` and `MenuLoader`. Mounts the 3D Canvas, the Storybook players, and the Barbie placeholder widgets depending on the route.

## 2. 3D React Three Fiber Engine (Avatar Studio)
The core 3D generation and rendering engine built on top of Three.js and `@react-three/fiber` / `@react-three/drei`.

*   **`src/components/AvatarCanvas.tsx`**: The `<Canvas>` root element. Handles cinematic lighting, reflections (`preset="studio"`), and camera restrictions via `OrbitControls`.
*   **`src/components/ModelLoader.tsx`**: The hero loader for `.glb` files. It handles skin pigmentation materials, toggling mesh visibility for clothing, applying shadows, and bridging the animations from the GLB or the procedural registry. Crucially, it exposes `window.__playAvatarAnimation` and `window.__setMorph` for external UI controllers.
*   **`src/lib/animationRegistry.ts`**: A procedural animation fallback system calculating mathematical Three.js `AnimationClip` KeyFrame tracks (like `nod`, `wave`, `pageFlip`) when a rig doesn't have the baked-in animation clip.
*   **`src/state/AvatarUIContext.tsx`**: The Context Provider that manages user UI inputs (skinColor, clothing, activeAnimation) and reactively streams them to the 3D `<Canvas>`.

## 3. Storybook TTS & Karaoke Pipeline
The interactive storybook system capable of processing AWS Polly audio and timestamp arrays for karaoke-style highlights and physical Avatar bridging.

*   **`src/lib/eventBus.ts`**: An ultra-fast event emitter using `mitt`. Handles `"story:play"`, `"story:word"`, `"ui:highlight"`, and `"avatar:action"` events across the UI asynchronously.
*   **`src/lib/AvatarActionBridge.ts`**: The listener module that converts `eventBus` semantic actions (like `"presentBook"` or `"pageFlip"`) directly into `ModelLoader.tsx` window bindings to make the Avatar move.
*   **`src/hooks/useSpeechSync.ts`**: The engine for the Karaoke logic. Evaluates the playing `<audio>` element against a set of `SpeechMarks` timestamps inside a `requestAnimationFrame` loop, dispatching `"story:word"` to the UI.
*   **`src/components/PageFlipper.tsx`**: The 2D DOM visual overlay parsing the current story page. Contains precise text-token highlighting driven by the `useSpeechSync` engine.
*   **`src/controllers/StoryInteractionController.tsx`**: The background orchestrator binding the event bus to the active Story ID.
*   **`public/story-manifests/sample-story.json`**: A synthetic test manifest mocking an AWS Polly `speechMarks` payload to test the `PageFlipper` without backend calls.

## 4. Backend Express Microservices
The backend API (`server/`) handling heavy AWS S3 data-shuttling, validation, and AWS Polly generation.

*   **`server/src/index.ts`**: The Express.js bootstrap file containing CORS, Morgan loggers, and the `/api/tts/` and `/api/presign/` endpoint mappings.
*   **`server/src/tts/pollySynthesize.ts`**: An AWS SDK V3 script binding to AWS Polly `neural` voices capable of parsing text/SSML payload strings into dual S3 `.mp3` and `.speechmarks.json` artifacts.
*   **`server/src/tts/pollyExpress.ts`**: The Express POST `/api/tts/synthesize` wrapper firing multiple `pollySynthesize` operations depending on the length of a Story Manifest.
*   **`server/src/upload/presign.ts`**: A secure POST endpoint dynamically generating 5 minute expiration AWS S3 Presigned POST URLs so clients can upload assets (Max 50MB) without exposing IAM secrets.
*   **`server/worker/validatePublish.js`**: A skeleton script mapped out to run async background validations (Draco compression via `gltf-pipeline`, Blender rendering, or virus scanning) once a file hits the S3 bucket.

## Next Steps / Standby Mode
The entire foundation for the 3D Viewer, the global navigation wrappers, the Storybook Karaoke renderer, and the Express/AWS upload backend have been constructed and injected into the filesystem. 

**Awaiting the next code drop from SMYTHOS regarding the 'BarbieWorld' modules, the Decorator screens, Shop integration, or Parental Gates.**
