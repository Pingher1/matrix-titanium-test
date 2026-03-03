import React, { useEffect, useState } from "react";

export default function ModuleDetail({ moduleId, version, onClose }: { moduleId: string; version: string; onClose: () => void }) {
    const [manifest, setManifest] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`/api/modules/${encodeURIComponent(moduleId)}/${encodeURIComponent(version)}`)
            .then((r) => r.json())
            .then((data) => setManifest(data))
            .catch((err) => setError(String(err)))
            .finally(() => setLoading(false));
    }, [moduleId, version]);

    return (
        <div style={{ background: "#0b0b0b", color: "#fff", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Module: {moduleId} / {version}</h3>
                <div><button onClick={onClose}>Close</button></div>
            </div>
            {loading && <div>Loading manifest...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            {manifest && (
                <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                        <h4>Manifest JSON</h4>
                        <pre style={{ maxHeight: 320, overflow: "auto", background: "#0a0a0a", padding: 8, borderRadius: 6 }}>
                            {JSON.stringify(manifest, null, 2)}
                        </pre>
                    </div>
                    <div style={{ width: 420 }}>
                        <h4>Assets ({manifest.assets ? manifest.assets.length : 0})</h4>
                        <div style={{ maxHeight: 300, overflow: "auto", background: "#020202", padding: 8, borderRadius: 6 }}>
                            {manifest.assets && manifest.assets.map((a: any, idx: number) => (
                                <div key={idx} style={{ marginBottom: 8, borderBottom: "1px dashed #222", paddingBottom: 6 }}>
                                    <div style={{ fontSize: 13 }}>{a.path}</div>
                                    <div style={{ fontSize: 12, color: "#aaa" }}>{a.humanSize || (a.size ? (a.size + " bytes") : "")}</div>
                                    <div style={{ marginTop: 6 }}>
                                        <a href={a.url} target="_blank" rel="noreferrer" style={{ color: "#7bd" }}>Download</a>
                                        <button onClick={() => { navigator.clipboard.writeText(a.sha256 || ""); }} style={{ marginLeft: 8 }}>Copy SHA256</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <h4>Signature</h4>
                            <div>
                                {manifest.signatureValid !== undefined ? (
                                    <div>Signature status: <strong style={{ color: manifest.signatureValid ? "#8f8" : "#f88" }}>{String(manifest.signatureValid)}</strong></div>
                                ) : (
                                    <div>Signature: not verified (server must verify)</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
