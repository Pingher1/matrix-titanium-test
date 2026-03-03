import React, { useEffect, useState } from "react";
import ModuleDetail from "./ModuleDetail";

type ModuleEntry = {
    moduleId: string;
    version: string;
    title?: string;
    builtAt?: string;
    author?: string;
    assetsCount?: number;
    assetsSizeBytes?: number;
};

export default function ModulesDashboard() {
    const [modules, setModules] = useState<ModuleEntry[]>([]);
    const [selected, setSelected] = useState<null | { moduleId: string; version: string }>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch("/api/modules")
            .then((r) => r.json())
            .then((data) => {
                // Expect Kronos to return { modules: [...] } or an array 
                const list = Array.isArray(data) ? data : data.modules || data.items || [];
                // Normalize entries 
                const normalized = list.map((m: any) => ({
                    moduleId: m.moduleId || m.id || m.name,
                    version: m.version || m.tag || (m.gitCommit || "").slice(0, 7),
                    title: m.title || m.moduleId,
                    builtAt: m.builtAt || m.createdAt || null,
                    author: (m.kronosMetadata && m.kronosMetadata.author) || m.author || null,
                    assetsCount: m.assetsCount || (m.assets && m.assets.length) || null,
                    assetsSizeBytes: m.assetsSizeBytes || null,
                }));
                setModules(normalized);
            })
            .catch((err) => {
                setError(String(err));
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h2>Published Modules</h2>
            {loading && <div>Loading modules...</div>}
            {error && <div style={{ color: "red" }}>Error: {error}</div>}
            <div style={{ maxHeight: 420, overflow: "auto", border: "1px solid #222", borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#111", color: "#fff" }}>
                        <tr>
                            <th style={{ padding: 8 }}>Module</th>
                            <th style={{ padding: 8 }}>Version</th>
                            <th style={{ padding: 8 }}>Title</th>
                            <th style={{ padding: 8 }}>Built</th>
                            <th style={{ padding: 8 }}>Assets</th>
                            <th style={{ padding: 8 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((m) => (
                            <tr key={`${m.moduleId}:${m.version}`} style={{ borderBottom: "1px solid #222", color: "#ddd" }}>
                                <td style={{ padding: 8 }}>{m.moduleId}</td>
                                <td style={{ padding: 8 }}>{m.version}</td>
                                <td style={{ padding: 8 }}>{m.title}</td>
                                <td style={{ padding: 8 }}>{m.builtAt ? new Date(m.builtAt).toLocaleString() : "-"}</td>
                                <td style={{ padding: 8 }}>{m.assetsCount ?? "-"}</td>
                                <td style={{ padding: 8 }}>
                                    <button onClick={() => setSelected({ moduleId: m.moduleId!, version: m.version! })}>Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div style={{ marginTop: 16 }}>
                    <ModuleDetail moduleId={selected.moduleId} version={selected.version} onClose={() => setSelected(null)} />
                </div>
            )}
        </div>
    );
}
