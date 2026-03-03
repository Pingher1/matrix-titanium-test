import React from "react";
import { useSmythOSDispatch } from "../state/smythos/reducer";

type Asset = { id: string; title: string; thumbnail: string; preview?: string; metadata?: any };

export default function AssetTile({ asset, onPreview }: { asset: Asset; onPreview: (a: Asset) => void }) {
    const dispatch = useSmythOSDispatch();

    const proxyUrl = `/api/asset/proxy?url=${encodeURIComponent(asset.thumbnail || asset.preview || "")}`;

    const importAsBase = () => {
        const slot = {
            id: `adobe_${asset.id}`,
            url: proxyUrl,
            name: asset.title,
            type: "base" as const,
            loaded: false,
        };
        dispatch({ type: "IMPORT_TEXTURE", payload: slot });
    };

    const importAsNormal = () => {
        const slot = {
            id: `adobe_${asset.id}_normal`,
            url: proxyUrl,
            name: asset.title,
            type: "normal" as const,
            loaded: false,
        };
        dispatch({ type: "IMPORT_TEXTURE", payload: slot });
    };

    const importAsRoughness = () => {
        const slot = {
            id: `adobe_${asset.id}_roughness`,
            url: proxyUrl,
            name: asset.title,
            type: "roughness" as const,
            loaded: false,
        };
        dispatch({ type: "IMPORT_TEXTURE", payload: slot });
    };


    return (
        <div style={tileWrap}>
            <div style={thumbWrap}>
                <img src={proxyUrl} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
            </div>
            <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.title}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                    <button onClick={() => onPreview(asset)} style={previewBtn}>Preview</button>
                    <button onClick={importAsBase} style={importBtn}>Map Base</button>
                    <button onClick={importAsNormal} style={importBtn}>Map Normal</button>
                    <button onClick={importAsRoughness} style={importBtn}>Map Roughness</button>
                </div>
            </div>
        </div>
    );
}

const tileWrap: React.CSSProperties = { width: 220, padding: 8, background: "rgba(10, 15, 25, 0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" };
const thumbWrap: React.CSSProperties = { width: "100%", height: 140, background: "#000", borderRadius: 6, overflow: "hidden" };
const previewBtn: React.CSSProperties = { background: "rgba(255,255,255,0.1)", color: "#fff", padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", fontSize: 11, cursor: 'pointer' };
const importBtn: React.CSSProperties = { background: "#ff7a18", color: "#fff", padding: "4px 8px", borderRadius: 6, border: "none", fontSize: 11, cursor: 'pointer', fontWeight: 'bold' };
