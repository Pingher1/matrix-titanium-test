import React, { useState, useEffect } from "react";
import AssetTile from "./AssetTile";

type Asset = { id: string; title: string; thumbnail: string; preview?: string; metadata?: any };

export default function AssetBrowser() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

    const search = async (query: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/adobe/search?q=${encodeURIComponent(query)}`);
            const json = await res.json();
            setResults(json.assets || []);
        } catch (err) {
            console.error("search failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // initial curated query to populate
        search("seamless texture liquid glass");
    }, []);

    return (
        <div className="w-full text-white font-sans">
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search(q)}
                    placeholder="Search Adobe Stock Textures..."
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: 'none' }}
                />
                <button onClick={() => search(q)} style={{ padding: "8px 16px", borderRadius: 8, background: "#ff7a18", color: "#fff", fontWeight: "bold", cursor: 'pointer', border: 'none' }}>Search Core</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, maxHeight: '60vh', overflowY: 'auto', padding: '4px' }} className="scrollbar-hide">
                {results.map((a) => (
                    <AssetTile key={a.id} asset={a} onPreview={(asset) => setPreviewAsset(asset)} />
                ))}
            </div>

            {loading && <div style={{ marginTop: 12, textAlign: 'center', color: '#ff7a18' }}>Bridging to Adobe Stock Cloud...</div>}

            {previewAsset && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: 'blur(5px)' }}>
                    <div style={{ width: 880, maxWidth: '90vw', background: "#071018", borderRadius: 12, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                            <h3 style={{ color: "#fff", margin: 0, fontSize: 20 }}>{previewAsset.title}</h3>
                            <button onClick={() => setPreviewAsset(null)} style={{ background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕ Close</button>
                        </div>
                        <div style={{ display: "flex", gap: 24, flexWrap: 'wrap' }}>
                            <img src={`/api/asset/proxy?url=${encodeURIComponent(previewAsset.preview || previewAsset.thumbnail)}`} alt={previewAsset.title} style={{ width: 420, maxWidth: '100%', height: 420, objectFit: "cover", borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                            <div style={{ flex: 1, color: "#ddd", minWidth: 250 }}>
                                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#888', marginBottom: 8 }}>Adobe Stock Metadata</div>
                                <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, background: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
                                    {JSON.stringify(previewAsset.metadata || {}, null, 2)}
                                </pre>
                                <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
                                    <button onClick={() => {
                                        const evt = new CustomEvent("adobe:import", { detail: { ...previewAsset, targetSlot: 'base' } });
                                        window.dispatchEvent(evt as any);
                                        setPreviewAsset(null);
                                    }} style={{ background: "#ff7a18", color: "#fff", padding: "10px 16px", borderRadius: 8, cursor: 'pointer', border: 'none', fontWeight: 'bold' }}>Import as Base</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
