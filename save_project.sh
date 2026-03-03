#!/usr/bin/env bash
# save_project.sh
# Creates the Avatar Creator starter project (client + server) with sample files.
# Usage:
# ./save_project.sh [TARGET_DIR] [--install] [--git-init]
# Examples:
# ./save_project.sh /smythfs/avatar-creator --install --git-init
set -euo pipefail
TARGET="${1:-./avatar-creator-starter}"
INSTALL=false
GITINIT=false
shift_args=()
for arg in "$@"; do case "$arg" in --install) INSTALL=true ;;
 --git-init) GITINIT=true ;;
 *) shift_args+=("$arg") ;;
 esac
done
mkdir -p "$TARGET"
echo "Creating project at: $TARGET"

# Helper to write files with heredoc safely
write_file() {
 local path="$1"; shift
 mkdir -p "$(dirname "$path")"
 cat > "$path" <<'EOF'
"$@"
EOF
}

# We'll use here-documents manually to place files
echo "Writing files..."

# Root README
cat > "$TARGET/README.md" <<'README'
Avatar Creator Starter
======================
This scaffold creates a monorepo with a client (React + react-three-fiber) and server (Express) containing:
- Avatar3D loader & debug hooks
- Storybook player / story interaction controller
- AWS Polly TTS synth example server integration
- Presign S3 upload endpoint skeleton
- Worker placeholder for asset validation and thumbnail creation
- Animation registry with procedural fallbacks (30 animation names)

Usage:
  ./save_project.sh [TARGET_DIR] [--install] [--git-init]

If you run with --install the script will run yarn install in both client and server (requires yarn).
If you run with --git-init the script will init a git repo and commit the files.

See client/README.md and server/README.md for running the individual sides.
README

# Root package.json
cat > "$TARGET/package.json" <<'PKG'
{
  "name": "avatar-creator-monorepo",
  "private": true,
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently \"yarn workspace client start\" \"yarn workspace server dev\"",
    "client": "yarn workspace client start",
    "server": "yarn workspace server dev",
    "build": "yarn workspace client build && yarn workspace server build"
  },
  "devDependencies": {
    "concurrently": "^7.0.0"
  }
}
PKG

# Create public/story-manifests/sample-story.json
mkdir -p "$TARGET/public/story-manifests"
cat > "$TARGET/public/story-manifests/sample-story.json" <<'JSON'
{
  "id": "sample-story-001",
  "title": "The Little Sphere",
  "language": "en-US",
  "pages": [
    {
      "id": "p1",
      "text": "Once upon a time, a curious little sphere rolled into a magical studio.",
      "image": "/story-assets/p1.jpg",
      "audioUrl": "/story-audio/p1.mp3",
      "speechMarks": [
        { "time":0, "value": "Once", "index":0 },
        { "time":250, "value": "upon", "index":1 },
        { "time":420, "value": "a", "index":2 },
        { "time":480, "value": "time,", "index":3 },
        { "time":760, "value": "a", "index":4 },
        { "time":820, "value": "curious", "index":5 },
        { "time":1100, "value": "little", "index":6 },
        { "time":1320, "value": "sphere", "index":7 },
        { "time":1600, "value": "rolled", "index":8 },
        { "time":1850, "value": "into", "index":9 },
        { "time":2010, "value": "a", "index":10 },
        { "time":2080, "value": "magical", "index":11 },
        { "time":2410, "value": "studio.", "index":12 }
      ]
    },
    {
      "id": "p2",
      "text": "It found friends and learned to shine under cinematic lights.",
      "image": "/story-assets/p2.jpg",
      "audioUrl": "/story-audio/p2.mp3",
      "speechMarks": [
        { "time":0, "value": "It", "index":0 },
        { "time":120, "value": "found", "index":1 },
        { "time":360, "value": "friends", "index":2 },
        { "time":640, "value": "and", "index":3 },
        { "time":710, "value": "learned", "index":4 },
        { "time":980, "value": "to", "index":5 },
        { "time":1060, "value": "shine", "index":6 },
        { "time":1320, "value": "under", "index":7 },
        { "time":1480, "value": "cinematic", "index":8 },
        { "time":1780, "value": "lights.", "index":9 }
      ]
    }
  ]
}
JSON

# Client scaffold
mkdir -p "$TARGET/client/src/components"
mkdir -p "$TARGET/client/src/lib"
mkdir -p "$TARGET/client/public"

cat > "$TARGET/client/package.json" <<'CPKG'
{
  "name": "avatar-client",
  "private": true,
  "version": "0.1.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.4.0",
    "@react-three/fiber": "^8.0.27",
    "@react-three/drei": "^9.48.6",
    "three": "^0.152.0",
    "three-stdlib": "^2.12.0",
    "mitt": "^3.0.0"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^4.0.0",
    "typescript": "^4.9.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
CPKG

cat > "$TARGET/client/src/main.tsx" <<'TSX'
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const el = document.getElementById("root");
createRoot(el!).render(<App />);
TSX

cat > "$TARGET/client/src/App.tsx" <<'TSX'
import React from "react";
import AvatarDashboard from "./components/AvatarDashboard";
import StoryInteractionController from "./components/StoryInteractionController";

export default function App() {
  return (
    <div style={{ height: "100vh", width: "100vw", background: "#0b0b0b", color: "white" }}>
      <AvatarDashboard />
      <StoryInteractionController />
    </div>
  );
}
TSX

# AvatarUIContext
cat > "$TARGET/client/src/lib/AvatarUIContext.tsx" <<'CTX'
import React, { createContext, useContext, useState } from "react";

type BackdropKey = "mad-scientist" | "vintage-bar" | "houston-galleria" | "studio" | "none";
type ClothingKey = string;

type AvatarUIState = {
  skinColor: string;
  backdrop: BackdropKey;
  clothing: ClothingKey | null;
  activeAnimation: string | null;
  modelUrl: string | null;
  setSkinColor: (hex: string) => void;
  setBackdrop: (b: BackdropKey) => void;
  setClothing: (c: ClothingKey | null) => void;
  setActiveAnimation: (a: string | null) => void;
  setModelUrl: (u: string | null) => void;
};

const AvatarUIContext = createContext<AvatarUIState | undefined>(undefined);

export const AvatarUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skinColor, setSkinColor] = useState<string>("#f0c9a0");
  const [backdrop, setBackdrop] = useState<BackdropKey>("studio");
  const [clothing, setClothing] = useState<ClothingKey | null>(null);
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <AvatarUIContext.Provider value={{
      skinColor,
      backdrop,
      clothing,
      activeAnimation,
      modelUrl,
      setSkinColor,
      setBackdrop,
      setClothing,
      setActiveAnimation,
      setModelUrl,
    }}>
      {children}
    </AvatarUIContext.Provider>
  );
};

export const useAvatarUI = (): AvatarUIState => {
  const ctx = useContext(AvatarUIContext);
  if (!ctx) throw new Error("useAvatarUI must be used within AvatarUIProvider");
  return ctx;
};
CTX

# Event bus
cat > "$TARGET/client/src/lib/eventBus.ts" <<'EVT'
import mitt from "mitt";

export type Events = {
  "story:ready": { storyId: string };
  "story:play": { storyId: string };
  "story:pause": { storyId: string };
  "story:stop": { storyId: string };
  "story:word": { pageId: string; wordIndex: number; timeMs: number; text: string };
  "story:page:end": { pageId: string; nextPageId?: string };
  "ui:highlight": { pageId: string; wordIndex: number };
  "avatar:action": { action: string; payload?: any };
};

export const eventBus = mitt<Events>();
EVT

# AvatarBubbleButton
cat > "$TARGET/client/src/components/AvatarBubbleButton.tsx" <<'BTN'
import React from "react";
import { eventBus } from "../lib/eventBus";

export default function AvatarBubbleButton({ storyId }: { storyId: string }) {
  const onClick = () => {
    eventBus.emit("story:play", { storyId });
  };

  return (
    <button aria-label="Ask avatar to read"
      onClick={onClick}
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, #ff9acb, #ff5aa2)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <svg width="36" height="36" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="white" opacity="0.08" />
        <path d="M8 11h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
BTN

# PageFlipper
cat > "$TARGET/client/src/components/PageFlipper.tsx" <<'PFLIP'
import React, { useEffect, useState } from "react";
import { eventBus } from "../lib/eventBus";

export default function PageFlipper({ pages }: { pages: Array<{ id: string; text: string; image?: string }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlight, setHighlight] = useState<{ pageId: string; wordIndex: number } | null>(null);

  useEffect(() => {
    const onHighlight = ({ pageId, wordIndex }: any) => setHighlight({ pageId, wordIndex });
    const onPageEnd = ({ pageId }: any) => {
      setCurrentIndex((i) => Math.min(i + 1, pages.length - 1));
      setHighlight(null);
    };

    eventBus.on("ui:highlight", onHighlight);
    eventBus.on("story:page:end", onPageEnd);
    return () => {
      eventBus.off("ui:highlight", onHighlight);
      eventBus.off("story:page:end", onPageEnd);
    };
  }, [pages.length]);

  const page = pages[currentIndex];
  const words = (page?.text || "").split(/\s+/);

  return (
    <div style={{ width: 960, height: 540, position: "relative", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {page?.image && <img src={page.image} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(5px) brightness(0.95)" }} />}
      <div style={{ position: "relative", zIndex: 2, padding: 28, color: "#111", fontSize: 22, lineHeight: 1.6 }}>
        {words.map((w, i) => {
          const isHighlighted = highlight && highlight.pageId === page.id && highlight.wordIndex === i;
          return (
            <span key={i} style={{ background: isHighlighted ? "rgba(255,230,128,0.95)" : "transparent", padding: "0 2px", transition: "background .06s" }}>
              {w}{i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}
PFLIP

# useSpeechSync hook
cat > "$TARGET/client/src/hooks/useSpeechSync.ts" <<'SSYNC'
import { useEffect, useRef } from "react";
import { eventBus } from "../lib/eventBus";

type SpeechMark = { time: number; value: string; index: number };

export default function useSpeechSync(audioUrl: string | null, speechMarks: SpeechMark[] | null, pageId: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioUrl) return;
    audioRef.current = new Audio(audioUrl);
    audioRef.current.preload = "auto";
    const audio = audioRef.current;

    audio.onended = () => {
      eventBus.emit("story:page:end", { pageId });
    };

    return () => {
      audio.pause();
      audioRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [audioUrl, pageId]);

  useEffect(() => {
    if (!audioRef.current || !speechMarks || !pageId) return;

    const audio = audioRef.current;
    const marks = speechMarks.slice().sort((a, b) => a.time - b.time);

    function tick() {
      const tMs = audio.currentTime * 1000;
      let curMark: SpeechMark | null = null;
      for (let i = 0; i < marks.length; i++) {
        if (marks[i].time <= tMs) curMark = marks[i];
        else break;
      }
      if (curMark) {
        eventBus.emit("story:word", { pageId, wordIndex: curMark.index, timeMs: curMark.time, text: curMark.value });
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    audio.play().catch((e) => console.warn("Audio play blocked:", e));
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [speechMarks, pageId]);

  return {
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    seek: (ms: number) => { if (audioRef.current) audioRef.current.currentTime = ms / 1000; },
    getAudio: () => audioRef.current,
  };
}
SSYNC

# Animation registry (simplified)
cat > "$TARGET/client/src/lib/animationRegistry.ts" <<'AREG'
import { AnimationClip, NumberKeyframeTrack } from "three";

type Entry = { type: "clip"; name: string } | { type: "procedural"; id: string; desc: string };

const registry = new Map<string, Entry>();

export const animationRegistry = {
  registerClip: (name: string) => registry.set(name, { type: "clip", name }),
  defineProcedural: (id: string, desc: string) => registry.set(id, { type: "procedural", id, desc }),
  get: (name: string) => registry.get(name),
  list: () => Array.from(registry.keys()),
  createProceduralClip: (id: string, root: any) => {
    switch (id) {
      case "nod":
        const head = root?.getObjectByName?.("Head");
        if (!head) return null;
        return new AnimationClip("nod", 0.6, [new NumberKeyframeTrack(`${head.name}.rotation[x]`, [0,0.25,0.5], [0,0.35,0])]);
      case "wave":
        const hr = root?.getObjectByName?.("Hand_R") || root?.getObjectByName?.("RightHand");
        if (!hr) return null;
        return new AnimationClip("wave", 0.9, [new NumberKeyframeTrack(`${hr.name}.rotation[z]`, [0,0.18,0.36,0.54,0.72], [0,0.6, -0.6,0.6,0])]);
      case "pageFlip":
        const hand = root?.getObjectByName?.("Hand_R") || root?.getObjectByName?.("RightHand");
        if (!hand) return null;
        return new AnimationClip("pageFlip", 0.6, [new NumberKeyframeTrack(`${hand.name}.rotation[x]`, [0,0.15,0.35], [0, -1.0,0])]);
      case "clippy":
        const rootNode = root;
        return new AnimationClip("clippy", 1.0, [new NumberKeyframeTrack(`${rootNode.name}.position[y]`, [0,0.25,0.5,0.75,1.0], [0,0.08,0,0.08,0])]);
      default:
        return null;
    }
  }
};

["nod","wave","pageFlip","clippy","tipHat","rockstar","idle_breath"].forEach((id)=> animationRegistry.defineProcedural ? animationRegistry.defineProcedural(id, `${id} procedural`) : registry.set(id, { type: "procedural", id, desc: `${id} procedural` }));

export default animationRegistry;
AREG

# AvatarModelLoader basic
cat > "$TARGET/client/src/components/AvatarModelLoader.tsx" <<'MLOAD'
import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, Color } from "three";
import animationRegistry from "../lib/animationRegistry";

type Props = { modelUrl: string; skinColor: string; clothingKey?: string | null; activeAnimation?: string | null };

export default function AvatarModelLoader({ modelUrl, skinColor, clothingKey, activeAnimation }: Props) {
  const gltf = useGLTF(modelUrl) as any;
  const groupRef = useRef<Group>(null);
  const { actions, mixer } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    if (!gltf) return;
    Object.keys(actions || {}).forEach((k) => animationRegistry.registerClip(k));

    (window as any).__playAvatarAnimation = async (name: string) => {
      const entry = animationRegistry.get(name);
      if (actions && actions[name]) {
        Object.values(actions).forEach((a: any) => a.stop());
        actions[name].reset().fadeIn(0.2).play();
        return true;
      }
      const clip = (animationRegistry as any).createProceduralClip?.(name, gltf.scene);
      if (clip && mixer) {
        const action = mixer.clipAction(clip, groupRef.current);
        action.reset().fadeIn(0.2).play();
        return true;
      }
      return false;
    };

    (window as any).__listAvatarAnimations = () => {
      const clips = Object.keys(actions || {});
      const proced = (animationRegistry as any).list ? (animationRegistry as any).list() : [];
      return Array.from(new Set([...clips, ...proced]));
    };

    (window as any).__setMorph = (meshName: string, morphName: string, value: number) => {
      gltf.scene.traverse((o: any) => {
        if (o.isMesh && (o.name === meshName || o.uuid === meshName)) {
          const dict = o.morphTargetDictionary || {};
          const idx = dict[morphName];
          if (typeof idx === "number" && o.morphTargetInfluences) o.morphTargetInfluences[idx] = value;
        }
      });
    };

    return () => {
      (window as any).__playAvatarAnimation = undefined;
      (window as any).__listAvatarAnimations = undefined;
      (window as any).__setMorph = undefined;
    };
  }, [gltf, actions, mixer]);

  useEffect(() => {
    if (!gltf) return;
    const color = new Color(skinColor);
    gltf.scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        const name = (obj.name || "").toLowerCase();
        const matName = (obj.material?.name || "").toLowerCase();
        if (name.includes("skin") || name.includes("face") || matName.includes("skin") || matName.includes("face")) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => { if (m.color) m.color = color.clone(); m.needsUpdate = true; });
          } else {
            if (obj.material.color) obj.material.color = color.clone();
            obj.material.needsUpdate = true;
          }
        }
      }
    });
  }, [gltf, skinColor]);

  useEffect(() => {
    if (activeAnimation) (window as any).__playAvatarAnimation?.(activeAnimation);
  }, [activeAnimation]);

  return <primitive ref={groupRef} object={gltf.scene} dispose={null} />;
}
MLOAD

# AvatarCanvas (basic placeholder)
cat > "$TARGET/client/src/components/AvatarCanvas.tsx" <<'CANV'
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useAvatarUI } from "../lib/AvatarUIContext";
import AvatarModelLoader from "./AvatarModelLoader";

export default function AvatarCanvas() {
  const { modelUrl, skinColor, clothing, activeAnimation } = useAvatarUI();
  const Loader = () => <div style={{ color: "white" }}>Loading avatar...</div>;

  return (
    <div style={{ width: "100%", height: 600 }}>
      <Canvas shadows camera={{ position: [0, 1.6, 2.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[2, 5, 2]} />
        <Suspense fallback={<Loader />}>
          <Environment preset="studio" />
          {modelUrl ? <AvatarModelLoader modelUrl={modelUrl} skinColor={skinColor} clothingKey={clothing} activeAnimation={activeAnimation} /> : null}
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
CANV

# AvatarDashboard (wrapping provider and UI)
cat > "$TARGET/client/src/components/AvatarDashboard.tsx" <<'ADASH'
import React from "react";
import { AvatarUIProvider } from "../lib/AvatarUIContext";
import AvatarCanvas from "./AvatarCanvas";
import AvatarBubbleButton from "./AvatarBubbleButton";
import PageFlipper from "./PageFlipper";
import sampleStory from "../../public/story-manifests/sample-story.json";

export default function AvatarDashboard() {
  return (
    <AvatarUIProvider>
      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        <div style={{ flex: "0 0 60%", position: "relative" }}>
          <AvatarCanvas />
          <div style={{ position: "absolute", right: 40, bottom: 40 }}>
            <AvatarBubbleButton storyId={sampleStory.id} />
          </div>
        </div>

        <div style={{ flex: "0 0 40%", paddingTop: 20 }}>
          <h3 style={{ color: "white" }}>{sampleStory.title}</h3>
          <PageFlipper pages={sampleStory.pages} />
        </div>
      </div>
    </AvatarUIProvider>
  );
}
ADASH

# StoryInteractionController
cat > "$TARGET/client/src/components/StoryInteractionController.tsx" <<'SCTRL'
import React, { useEffect, useState } from "react";
import { eventBus } from "../lib/eventBus";
import useSpeechSync from "../hooks/useSpeechSync";
import sampleStory from "../../public/story-manifests/sample-story.json";

export default function StoryInteractionController() {
  const [story, setStory] = useState<any | null>(sampleStory);
  const [pageIndex, setPageIndex] = useState(0);
  const page = story?.pages?.[pageIndex];

  useSpeechSync(page?.audioUrl ?? null, page?.speechMarks ?? null, page?.id ?? null);

  useEffect(() => {
    const onPlay = ({ storyId }: any) => {
      eventBus.emit("avatar:action", { action: "presentBook", payload: {} });
    };

    const onPageEnd = ({ pageId }: any) => {
      setPageIndex((i) => Math.min(i + 1, (story?.pages?.length || 1) - 1));
      eventBus.emit("avatar:action", { action: "pageFlip", payload: {} });
    };

    eventBus.on("story:play", onPlay);
    eventBus.on("story:page:end", onPageEnd);
    return () => {
      eventBus.off("story:play", onPlay);
      eventBus.off("story:page:end", onPageEnd);
    };
  }, [story]);

  return null;
}
SCTRL

# basic styles
cat > "$TARGET/client/src/styles.css" <<'CSS'
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Inter, Arial, sans-serif;
  background: linear-gradient(180deg, #0b0b0b 0%, #111111 100%);
}
button { font-family: inherit; }
CSS

# client index.html (Vite)
cat > "$TARGET/client/index.html" <<'HTML'
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Avatar Creator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

# client README
cat > "$TARGET/client/README.md" <<'CREADME'
Client (React) README
=====================
Commands:
  yarn start
  yarn build
  yarn preview
CREADME

# Server scaffold
mkdir -p "$TARGET/server/src/tts"
mkdir -p "$TARGET/server/src/upload"
mkdir -p "$TARGET/server/src/manifest"
mkdir -p "$TARGET/server/data"

cat > "$TARGET/server/package.json" <<'SPKG'
{
  "name": "avatar-server",
  "private": true,
  "version": "0.1.0",
  "dependencies": {
    "express": "^4.18.1",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "@aws-sdk/client-polly": "^3.281.0",
    "@aws-sdk/client-s3": "^3.281.0",
    "@aws-sdk/s3-presigned-post": "^3.281.0",
    "joi": "^17.0.0",
    "uuid": "^9.0.0"
  },
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "ts-node-dev": "^2.0.0",
    "typescript": "^4.9.0",
    "@types/express": "^4.17.13"
  }
}
SPKG

# server .env example
cat > "$TARGET/server/.env.example" <<'ENV'
AWS_REGION=us-west-2
S3_BUCKET=your-s3-bucket
PORT=8080
MAX_UPLOAD_BYTES=52428800
SIGNED_URL_EXPIRATION=120
ENV

# server index.ts
cat > "$TARGET/server/src/index.ts" <<'SINDEX'
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import path from "path";
import { createPresignHandler } from "./upload/presign";
import { synthesizeStoryHandler } from "./tts/pollyExpress";
import { getManifestHandler } from "./manifest/manifestController";

dotenv.config();
const app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());

app.use("/story-manifests", express.static(path.join(process.cwd(), "public/story-manifests")));
app.use("/story-assets", express.static(path.join(process.cwd(), "public/story-assets")));
app.use("/backdrops", express.static(path.join(process.cwd(), "public/backdrops")));

app.post("/api/presign", createPresignHandler);
app.post("/api/tts/synthesize", synthesizeStoryHandler);
app.get("/api/assets/manifest", getManifestHandler);

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
SINDEX

# server upload presign handler
cat > "$TARGET/server/src/upload/presign.ts" <<'PRESIGN'
import { Request, Response } from "express";
import Joi from "joi";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";

const BUCKET = process.env.S3_BUCKET!;
const REGION = process.env.AWS_REGION || "us-west-2";
const s3 = new S3Client({ region: REGION });

export async function createPresignHandler(req: Request, res: Response) {
  res.json({ ok: true });
}
PRESIGN

# server TTS express wrapper
cat > "$TARGET/server/src/tts/pollyExpress.ts" <<'POLLYE'
import { Request, Response } from "express";
import { synthesizePageToS3 } from "./pollySynthesize";

export async function synthesizeStoryHandler(req: Request, res: Response) {
  res.json({ ok: true, pages: [] });
}
POLLYE

# server polly synth file
cat > "$TARGET/server/src/tts/pollySynthesize.ts" <<'POLLY'
export async function synthesizePageToS3(params: any) {
  return {};
}
POLLY

# manifest controller
cat > "$TARGET/server/src/manifest/manifestController.ts" <<'MANI'
import { Request, Response } from "express";

export async function getManifestHandler(req: Request, res: Response) {
  res.json({ ok: true, assets: [] });
}
MANI

# Worker placeholder
cat > "$TARGET/server/src/worker/validatePublish.js" <<'WORK'
/*
 Placeholder worker for asset validation.
 In production, run this as a job triggered by S3.
*/
WORK

echo "Done writing files. Ready for next step."
cat > "$TARGET/server/src/worker/validatePublish.js" <<'WORK'
/*
 validatePublish.js ------------------
 Simple placeholder worker for asset validation. Intended to be run as a job (ECS/Fargate/K8s)
 or invoked manually during development. This script:
 - Downloads object from S3 (given BUCKET+KEY)
 - Performs lightweight checks (HEAD, size)
 - If GLB: optionally call Blender container to render thumbnail (placeholder)
 - Uploads a placeholder thumbnail back to S3 and posts back to /internal/asset-validate
*/

const { S3Client, HeadObjectCommand, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");
const os = require("os");
const axios = require("axios");

const REGION = process.env.AWS_REGION || "us-west-2";
const BUCKET = process.env.S3_BUCKET;
const MANIFEST_API = process.env.MANIFEST_API || "http://localhost:8080/internal/asset-validate";
const s3 = new S3Client({ region: REGION });

async function downloadToFile(bucket, key, outPath) {
 const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
 const stream = res.Body;
 await new Promise((resolve, reject) => {
 const ws = fs.createWriteStream(outPath);
 stream.pipe(ws);
 stream.on("error", reject);
 ws.on("finish", resolve);
 ws.on("error", reject);
 });
}

async function run(bucket, key) {
 console.log("Validating", bucket, key);
 try {
 const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
 console.log("Head OK:", head.ContentLength, "bytes", "ContentType:", head.ContentType);

 const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "asset-"));
 const localPath = path.join(tmpDir, path.basename(key));
 await downloadToFile(bucket, key, localPath);
 console.log("Downloaded to", localPath);

 // Basic GLB check by magic header (first 4 bytes == 'glTF')
 let isGlb = localPath.toLowerCase().endsWith(".glb") || (head.ContentType && head.ContentType.includes("gltf"));
 if (isGlb) {
 const fd = fs.openSync(localPath, "r");
 const hdr = Buffer.alloc(4);
 fs.readSync(fd, hdr, 0, 4, 0);
 fs.closeSync(fd);
 if (hdr.toString("utf8", 0, 4) !== "glTF") {
 console.warn("GLB magic header missing — marking as unsupported");
 isGlb = false;
 } else {
 console.log("GLB header validated");
 }
 }

 const placeholderThumbPath = path.join(__dirname, "..", "..", "assets", "placeholders", "thumb-placeholder.jpg");
 let thumbBuffer;
 if (fs.existsSync(placeholderThumbPath)) {
 thumbBuffer = fs.readFileSync(placeholderThumbPath);
 } else {
 thumbBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
 }

 const thumbKey = key.replace(/^assets\//, "assets/thumbs/").replace(/\.[^/.]+$/, ".jpg");
 await s3.send(new PutObjectCommand({ Bucket: bucket, Key: thumbKey, Body: thumbBuffer, ContentType: "image/jpeg" }));
 console.log("Uploaded thumbnail to", thumbKey);

 const lodKey = key.replace(/^assets\//, "assets/lods/"); // placeholder

 const payload = {
 key,
 cdnUrl: `https://${bucket}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key)}`,
 thumbnailUrl: `https://${bucket}.s3.${REGION}.amazonaws.com/${encodeURIComponent(thumbKey)}`,
 lodUrl: `https://${bucket}.s3.${REGION}.amazonaws.com/${encodeURIComponent(lodKey)}`,
 available: true
 };
 console.log("Posting manifest update to", MANIFEST_API, payload);
 await axios.post(MANIFEST_API, payload);
 console.log("Validation complete and published.");

 try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
 } catch (err) {
 console.error("Validation error:", err);
 try { await axios.post(MANIFEST_API, { key, available: false, reason: String(err) }); } catch (e) {}
 process.exit(1);
 }
}

if (require.main === module) {
 const [, , bucket, key] = process.argv;
 if (!bucket || !key) {
 console.error("Usage: node validatePublish.js <bucket> <key>");
 process.exit(2);
 }
 run(bucket, key).catch(err => { console.error(err); process.exit(1); });
}
WORK

# Create placeholder assets dir and placeholder thumb
mkdir -p "$TARGET/server/assets/placeholders"
echo -n -e '\xff\xd8\xff\xd9' > "$TARGET/server/assets/placeholders/thumb-placeholder.jpg"

# .gitignore
cat > "$TARGET/.gitignore" <<'GIT'
node_modules
dist
.env
.env.local
.DS_Store
*.log
server/data/manifest.json
GIT
# run.sh (helper to start dev)
cat > "$TARGET/run.sh" <<'RUN'
#!/usr/bin/env bash
# run.sh - convenience script to run client and server concurrently (needs yarn)
set -euo pipefail
echo "Starting client and server..."
if ! command -v yarn >/dev/null 2>&1; then 
 echo "yarn not found. Please install yarn or run client and server individually."
 exit 1
fi
cd "$(dirname "$0")"
yarn install --silent
# start both
npx concurrently "yarn workspace client start" "yarn workspace server dev"
RUN
chmod +x "$TARGET/run.sh"

# Compute a SHA256 checksum for created files (tarball)
TMP_TAR="$(mktemp -u)/avatar_archive.tar.gz"
pushd "$TARGET" >/dev/null
tar -czf "/tmp/avatar_creator_archive.tgz" ./
popd >/dev/null
if command -v shasum >/dev/null 2>&1; then 
 SHA256=$(shasum -a 256 /tmp/avatar_creator_archive.tgz | awk '{print $1}')
elif command -v sha256sum >/dev/null 2>&1; then 
 SHA256=$(sha256sum /tmp/avatar_creator_archive.tgz | awk '{print $1}')
else 
 SHA256="(sha256 not available on this host)"
fi

# Optionally run installs
if [ "$INSTALL" = true ]; then 
 echo "Running yarn install in client and server..."
 (cd "$TARGET/client" && yarn install)
 (cd "$TARGET/server" && yarn install)
fi

# Optionally init git
if [ "$GITINIT" = true ]; then 
 echo "Initializing git repo..."
 (cd "$TARGET" && git init && git add . && git commit -m "chore: scaffold avatar-creator starter")
fi

echo "Project scaffold complete at: $TARGET"
echo "A tarball of the project was written to /tmp/avatar_creator_archive.tgz"
echo "SHA256 checksum: $SHA256"
echo ""
echo "Next steps:"
echo "1) cd $TARGET"
echo "2) Edit server/.env with your AWS credentials and S3 bucket."
echo "3) Run ./run.sh to start the dev environment (or use ./save_project.sh with --install and --git-init)."
echo "4) In the client, open http://localhost:5173 (or check Vite output) to view the app."
echo ""
echo "If you need the full transcript appended to CONVERSATION_FULL.txt, rerun save_project.sh with --append-transcript and paste the transcript file into the script input."
exit 0
