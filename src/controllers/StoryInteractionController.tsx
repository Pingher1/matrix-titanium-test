import React, { useEffect, useState } from "react";
import { eventBus } from "../lib/eventBus";
import useSpeechSync from "../hooks/useSpeechSync";
import { initAvatarBridge } from "../lib/AvatarActionBridge";

/**
 * Place <StoryInteractionController /> near top-level of app so it hears events.
 * The controller expects story manifests to be available (cached or fetched).
 */
export default function StoryInteractionController() {
    const [currentStory, setCurrentStory] = useState<any | null>(null);
    const [pageIndex, setPageIndex] = useState(0);

    // Initialize the bridge once
    useEffect(() => {
        initAvatarBridge();
    }, []);

    // Fetch or setup the sample story when a play event fires
    useEffect(() => {
        const onPlay = async ({ storyId }: any) => {
            // If we don't have the story yet, we would fetch it. 
            // For now, we manually import the sample to mock the API response.
            if (!currentStory || currentStory.id !== storyId) {
                try {
                    const sampleStories = await import("../../public/story-manifests/sample-story.json");
                    setCurrentStory(sampleStories.default || sampleStories);
                    setPageIndex(0);
                } catch (e) {
                    console.error("Could not load story manifest", e);
                }
            }

            eventBus.emit("avatar:action", { action: "presentBook", payload: {} });

            // Delay before speech starts (to let present animation play out)
            setTimeout(() => {
                // UI event to tick player or trigger initial word
                eventBus.emit("ui:highlight", { pageId: currentStory?.pages?.[0]?.id ?? "", wordIndex: 0 });
            }, 600);
        };

        const onWord = (payload: any) => {
            eventBus.emit("ui:highlight", { pageId: payload.pageId, wordIndex: payload.wordIndex });
            eventBus.emit("avatar:action", { action: "phoneme", payload: { text: payload.text } });
        };

        const onPageEnd = (payload: any) => {
            setPageIndex((i) => Math.min(i + 1, (currentStory?.pages?.length || 1) - 1));
            eventBus.emit("avatar:action", { action: "pageFlip", payload: {} });
        };

        eventBus.on("story:play", onPlay);
        eventBus.on("story:word", onWord);
        eventBus.on("story:page:end", onPageEnd);

        return () => {
            eventBus.off("story:play", onPlay);
            eventBus.off("story:word", onWord);
            eventBus.off("story:page:end", onPageEnd);
        };
    }, [currentStory]); // Remove page from dependencies to prevent constant rebinding

    const page = currentStory?.pages?.[pageIndex];

    // Hook instance processes audio + speech marks and drives the `story:word` event loop
    useSpeechSync(page?.audioUrl ?? null, page?.speechMarks ?? null, page?.id ?? null);

    // We can render the PageFlipper directly as a child of this orchestrator just for the demo flow,
    // or return null and mount PageFlipper elsewhere.
    if (!currentStory) return null;

    return (
        <div className="fixed top-24 right-10 z-30 pointer-events-auto transform transition-all">
            {/* Use a lazy loaded component or import it at top if this returns UI */}
        </div>
    );
}
