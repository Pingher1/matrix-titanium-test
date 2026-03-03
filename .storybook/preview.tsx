import type { Preview } from "@storybook/react";
import React from "react";
import "../src/index.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
            expanded: true
        },
        backgrounds: {
            default: "dark",
            values: [
                { name: "dark", value: "#071018" },
                { name: "light", value: "#ffffff" },
            ],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: 20, background: "#071018", minHeight: "100vh" }} >
                <Story />
            </div>
        ),
    ],
};

export default preview;
