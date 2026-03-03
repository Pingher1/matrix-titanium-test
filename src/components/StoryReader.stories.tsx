import React from "react";
import StoryReader from "./StoryReader";

export default {
    title: "Reader/StoryReader",
    component: StoryReader,
};

const sampleText =
    "Once upon a time in a glowing orchard, a tiny robot named Tiko found a bright button that played music. Tiko danced and learned to be kind.";

export const Live = () => <StoryReader initialText={sampleText} voices={[{ id: "browser", name: "Browser TTS" }]} mock={false} />;

// Mock visual demonstration (no API)
export const Mock = () => <StoryReader initialText={sampleText} voices={[{ id: "browser", name: "Browser TTS" }]} mock={true} />;
