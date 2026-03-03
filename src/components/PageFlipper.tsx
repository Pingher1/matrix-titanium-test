import React, { useEffect, useState } from "react";
import { eventBus } from "../lib/eventBus";

export default function PageFlipper({ pages }: { pages: Array<{ id: string; text: string; image?: string }> }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [highlight, setHighlight] = useState<{ pageId: string; wordIndex: number } | null>(null);

    useEffect(() => {
        const onHighlight = ({ pageId, wordIndex }: any) => setHighlight({ pageId, wordIndex });
        const onPageEnd = () => {
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
    if (!page) return null;

    const words = (page.text || "").split(/\s+/);

    return (
        <div className="w-full max-w-4xl h-[540px] relative rounded-xl overflow-hidden bg-white shadow-2xl border-4 border-[#282a36]">
            {page.image && (
                <img
                    src={page.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-[5px] brightness-95"
                />
            )}
            <div className="relative z-10 p-10 text-gray-900 text-2xl leading-relaxed flex flex-wrap content-center h-full bg-white/40">
                {words.map((w, i) => {
                    const isHighlighted = highlight && highlight.pageId === page.id && highlight.wordIndex === i;
                    return (
                        <span
                            key={i}
                            className={`px-[2px] mx-[2px] transition-colors duration-[60ms] rounded ${isHighlighted ? 'bg-yellow-300' : 'bg-transparent'}`}
                        >
                            {w}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
