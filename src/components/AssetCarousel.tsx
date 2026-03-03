import React from "react";

export default function AssetCarousel({ children }: { children: React.ReactNode }) {
    return (
        <div className="scrollbar-hide" style={{ overflowX: "auto", whiteSpace: "nowrap", padding: 12, display: "flex", gap: 12, scrollBehavior: 'smooth' }}>
            {React.Children.map(children, (c, i) => (
                <div style={{ display: "inline-block", verticalAlign: "top" }}>{c}</div>
            ))}
        </div>
    );
}
