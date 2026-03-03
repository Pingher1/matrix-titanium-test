import React from "react";
import HDRIEnvironment from "./HDRIEnvironment";

export default {
    title: "Environment/HDRIEnvironment",
    component: HDRIEnvironment,
};

export const Studio = () => (
    <div style={{ height: 360 }}>
        <HDRIEnvironment />
        <div style={{ position: "absolute", top: 16, left: 16, color: "#fff" }}>Studio preset (visual)</div>
    </div>
);

export const LemonadeCustom = () => (
    <div style={{ height: 360 }}>
        <HDRIEnvironment />
        <div style={{ position: "absolute", top: 16, left: 16, color: "#fff" }}>Custom Lemonade HDRI (preview)</div>
    </div>
);
