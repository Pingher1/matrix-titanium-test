import React, { useState } from "react";
import { motion } from "framer-motion";
import LiquidCard from "./LiquidCard";

const modules = [
    { id: 1, title: "BUYER INTEL", color: "#00f0ff", icon: "🏢" },
    { id: 2, title: "SELLER OPS", color: "#ff003c", icon: "💰" },
    { id: 3, title: "LENDER VAULT", color: "#fcee0a", icon: "🏦" },
    { id: 4, title: "AGENT COMMAND", color: "#00ff00", icon: "🕶️" },
];

const LiquidHUD = ({ isActive }) => {
    const [rotation, setRotation] = useState(0);

    const rotateRing = (direction) => {
        setRotation((prev) => prev + (direction * 90));
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">

            {/* 3D STAGE - SATURN VIEW */}
            <div className="relative w-full h-full flex items-center justify-center perspective-[1200px] overflow-hidden">

                {/* THE ORBITING RING (Steep 30deg Tilt for 'File Cabinet' view) */}
                <motion.div
                    className="relative w-[300px] h-[400px] pointer-events-auto"
                    style={{ transformStyle: "preserve-3d" }}
                    initial={{ rotateX: 30 }}
                    animate={{ rotateY: rotation, rotateX: 30 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    {modules.map((module, index) => {
                        const angle = index * (360 / modules.length);
                        return (
                            <div
                                key={module.id}
                                className="absolute inset-0 flex items-center justify-center"
                                style={{
                                    // Push out to 550px for a wide, clear orbit
                                    transform: `rotateY(${angle}deg) translateZ(550px)`,
                                }}
                            >
                                {/* Counter-rotate -10deg so they face the user while orbiting */}
                                <div style={{ transform: "rotateX(-10deg)" }}>
                                    <LiquidCard
                                        module={module}
                                        isSelected={false}
                                        onClick={() => rotateRing(-1)}
                                    />

                                    {/* THE "FILE TAG" (North West Corner) */}
                                    <div className="absolute -top-4 -left-4 px-2 py-1 bg-white/10 border border-white/20 rounded-tr-lg rounded-bl-lg text-[8px] font-mono text-white/70 backdrop-blur-md">
                                        FILE: 0{module.id}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* INVISIBLE TOUCH ZONES FOR ROTATION (Optional easy spin) */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-30 pointer-events-auto cursor-w-resize" onClick={() => rotateRing(1)} />
                <div className="absolute inset-y-0 right-0 w-1/4 z-30 pointer-events-auto cursor-e-resize" onClick={() => rotateRing(-1)} />

            </div>
        </div>
    );
};

export default LiquidHUD;
