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
