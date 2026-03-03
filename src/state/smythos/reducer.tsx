import React, { createContext, useReducer, useContext, ReactNode, useEffect } from "react";
import { AvatarUIState, PBRState, TextureSlot, LightingState, ExportState } from "./avatar-ui-context";
import { DEFAULT_AVATAR_UI_STATE } from "./defaults";

export type AvatarAction =
    | { type: "SET_PBR"; payload: Partial<PBRState> }
    | { type: "SET_MATERIAL_STATE"; payload: AvatarUIState["pbr"]["materialState"] }
    | { type: "SET_TRANSFORM"; payload: Partial<PBRState["transform"]> }
    | { type: "IMPORT_TEXTURE"; payload: TextureSlot }
    | { type: "REMOVE_TEXTURE"; payload: { id: string } }
    | { type: "SET_LIGHTING"; payload: Partial<LightingState> }
    | { type: "SET_EXPORT"; payload: Partial<ExportState> }
    | { type: "SET_UI"; payload: Partial<AvatarUIState["ui"]> }
    | { type: "SET_ICON_POSITION"; payload: { left?: number; bottom?: number } }
    | { type: "RESET" }
    | { type: "BATCH_UPDATE"; payload: Partial<AvatarUIState> };

function reducer(state: AvatarUIState, action: AvatarAction): AvatarUIState {
    switch (action.type) {
        case "SET_PBR":
            return {
                ...state,
                pbr: { ...state.pbr, ...action.payload },
                updatedAt: new Date().toISOString(),
            };
        case "SET_MATERIAL_STATE":
            return {
                ...state,
                pbr: { ...state.pbr, materialState: action.payload },
                updatedAt: new Date().toISOString(),
            };
        case "SET_TRANSFORM":
            return {
                ...state,
                pbr: {
                    ...state.pbr,
                    transform: { ...state.pbr.transform, ...action.payload }
                },
                updatedAt: new Date().toISOString(),
            };
        case "IMPORT_TEXTURE":
            return {
                ...state,
                textures: [...state.textures, action.payload],
                updatedAt: new Date().toISOString(),
            };
        case "REMOVE_TEXTURE":
            return {
                ...state,
                textures: state.textures.filter((t) => t.id !== action.payload.id),
                updatedAt: new Date().toISOString(),
            };
        case "SET_LIGHTING":
            return {
                ...state,
                lighting: { ...state.lighting, ...action.payload },
                updatedAt: new Date().toISOString(),
            };
        case "SET_EXPORT":
            return {
                ...state,
                export: { ...state.export, ...action.payload },
                updatedAt: new Date().toISOString(),
            };
        case "SET_UI":
            return {
                ...state,
                ui: { ...state.ui, ...action.payload },
                updatedAt: new Date().toISOString(),
            };
        case "SET_ICON_POSITION": {
            const incoming = action.payload || {};
            const currentIcon = state.ui.iconPosition || { left: 18, bottom: 18 };
            const nextIcon = { left: incoming.left ?? currentIcon.left, bottom: incoming.bottom ?? currentIcon.bottom };
            return {
                ...state,
                ui: { ...state.ui, iconPosition: nextIcon },
                updatedAt: new Date().toISOString(),
            };
        }
        case "BATCH_UPDATE":
            return {
                ...state,
                ...action.payload,
                updatedAt: new Date().toISOString(),
            };
        case "RESET":
            return { ...DEFAULT_AVATAR_UI_STATE, updatedAt: new Date().toISOString() };
        default:
            return state;
    }
}

/* Context */
const AvatarStateContext = createContext<AvatarUIState | undefined>(undefined);
const AvatarDispatchContext = createContext<React.Dispatch<AvatarAction> | undefined>(undefined);

export const SmythOSProvider = ({ children, initialState }: { children: ReactNode; initialState?: AvatarUIState }) => {
    const [state, dispatch] = useReducer(reducer, initialState ?? DEFAULT_AVATAR_UI_STATE);

    useEffect(() => {
        const handler = (ev: Event) => {
            const customEv = ev as CustomEvent;
            const a = customEv.detail;
            if (!a) return;

            // Allow targeting specific slots (base, normal, roughness), fallback to base
            const targetSlot = a.targetSlot || "base";

            dispatch({
                type: "IMPORT_TEXTURE",
                payload: {
                    id: `adobe_${a.id}_${targetSlot}`,
                    url: `/api/asset/proxy?url=${encodeURIComponent(a.preview || a.thumbnail)}`,
                    name: a.title,
                    type: targetSlot,
                    loaded: false,
                },
            });
        };
        window.addEventListener("adobe:import", handler);
        return () => window.removeEventListener("adobe:import", handler);
    }, []);

    return (
        <AvatarStateContext.Provider value={state}>
            <AvatarDispatchContext.Provider value={dispatch}>{children}</AvatarDispatchContext.Provider>
        </AvatarStateContext.Provider>
    );
};

export const useSmythOSState = (): AvatarUIState => {
    const ctx = useContext(AvatarStateContext);
    if (!ctx) throw new Error("useSmythOSState must be used within SmythOSProvider");
    return ctx;
};

export const useSmythOSDispatch = (): React.Dispatch<AvatarAction> => {
    const ctx = useContext(AvatarDispatchContext);
    if (!ctx) throw new Error("useSmythOSDispatch must be used within SmythOSProvider");
    return ctx;
};
