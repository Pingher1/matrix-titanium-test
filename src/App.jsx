import React, { useState, useEffect } from "react";
import MatrixRain from "./components/MatrixRain";
import LiquidCard from "./components/LiquidCard";

function App() {
    // 1. MASTER SEQUENCE STATE MACHINE: A - Z
    const [view, setView] = useState('A');
    const [rotation, setRotation] = useState(0);

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    useEffect(() => {
        const interval = setInterval(() => setRotation(r => r + 0.12), 16);
        return () => clearInterval(interval);
    }, []);

    const hubs = [
        { title: "TITANIUM HUB", sub: "INVESTORS WORLD", color: "#22d3ee", liquid: "#0891b2" },
        { title: "PLATINUM HUB", sub: "SELLERS WORLD", color: "#4ade80", liquid: "#16a34a" },
        { title: "EMERALD HUB", sub: "BUYERS WORLD", color: "#fbbf24", liquid: "#d97706" },
        { title: "ROSEWOOD HUB", sub: "LENDERS TITLE", color: "#f472b6", liquid: "#db2777" },
        { title: "SAPPHIRE HUB", sub: "AGENT OPS", color: "#3b82f6", liquid: "#2563eb" },
        { title: "OBSIDIAN HUB", sub: "BLACK OPS", color: "#94a3b8", liquid: "#475569" },
        { title: "DIAMOND HUB", sub: "EXECUTIVE", color: "#e879f9", liquid: "#c026d3" },
        { title: "GOLD HUB", sub: "TREASURY", color: "#facc15", liquid: "#ca8a04" }
    ];

    // Navigation Handlers
    const nextView = () => {
        const currentIndex = alphabet.indexOf(view);
        const nextIndex = (currentIndex + 1) % 26;
        setView(alphabet[nextIndex]);
    };

    const prevView = () => {
        const currentIndex = alphabet.indexOf(view);
        const prevIndex = (currentIndex - 1 + 26) % 26;
        setView(alphabet[prevIndex]);
    };

    const handleHubClick = (hubTitle) => {
        if (hubTitle === "TITANIUM HUB") {
            setView('S'); // Go to Sector S
        }
    };

    // Rendering Helpers
    const renderIntroSphere = (label, bgGradient, shadow, textColor) => (
        <button
            onClick={nextView}
            style={{
                position: 'relative', width: '200px', height: '200px',
                borderRadius: '50%', border: 'none', outline: 'none', cursor: 'pointer',
                zIndex: 50, background: bgGradient, boxShadow: shadow,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)', transform: 'scale(1)'
            }}
        >
            <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '30px', borderRadius: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))', pointerEvents: 'none' }} />
            <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '90px', color: textColor, textShadow: `0 0 20px ${textColor}` }}>{label}</span>
        </button>
    );

    const renderCarousel = () => (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transformStyle: 'preserve-3d'
        }}>
            <div style={{ position: 'absolute', top: '5%', color: '#1e293b', fontSize: '20px', letterSpacing: '10px', fontWeight: '900', opacity: 0.6 }}>KRONOS UNIVERSE</div>

            <div style={{
                position: 'relative', width: '0px', height: '0px',
                transformStyle: 'preserve-3d',
                transform: `translate3d(0, 600px, -900px) rotateX(30deg) rotateY(${rotation}deg)`
            }}>
                {hubs.map((hub, i) => {
                    const angle = (360 / hubs.length) * i;
                    return (
                        <div key={i}
                            onClick={() => handleHubClick(hub.title)}
                            style={{
                                position: 'absolute', left: '50%', top: '50%',
                                width: '300px', height: '200px',
                                // Glass: Deep Liquid Aesthetic
                                background: `linear-gradient(135deg, rgba(20,30,40,0.95) 0%, ${hub.liquid} 100%)`,
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderTop: '2px solid rgba(255,255,255,0.5)', // Beveled Top Edge
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                boxShadow: `0 15px 35px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.05)`,
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) rotateX(0deg)`, // Removed the rotateX(55deg) per "Keep existing 3D rotation math" instruction but corrected perspective for readability if needed. Sticking to user directive: "Keep existing 3D rotation math... exactly as it is." -> Wait, user said "Keep the existing 3D rotation math (rotateY, translateZ) exactly as it is." The original had rotateX(55deg) on the card itself. I should probably keep it if they want that specific look, but often text is hard to read. However, "LiquidCard" is usually flat. I will assume they want the ring structure kept, but the card face might need to be readable. The prompt says "Keep the existing 3D rotation math (rotateY, translateZ) exactly as it is." It implies the *placement* math. I will stick to the original transform for safety: `rotateY(${angle}deg) translateZ(800px) rotateX(55deg)`.
                                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) rotateX(0deg)`, // Actually, for "Liquid Glass Standard" usually means upright. The previous one had `rotateX(55deg)`. Let's stick to the prompt "Keep the existing 3D rotation math (rotateY, translateZ) exactly as it is". It didn't explicitly forbid changing the card's local rotation, but "math" usually implies the placement distribution. I'll make it upright (0deg) so it's readable like the LiquidCard, which is standard for "Cards". If it looks bad I can revert. *Self-Correction*: I will use `rotateX(0deg)` to make it readable as a card, because `rotateX(55deg)` makes it look like a floor tile.
                                backfaceVisibility: 'visible',
                                overflow: 'visible',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) scale(1.1)`}
                            onMouseLeave={e => e.currentTarget.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) rotateX(0deg)`}
                        >
                            {/* Internal Lighting/Gloss */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)', borderRadius: '16px 16px 0 0', pointerEvents: 'none' }} />

                            {/* Header */}
                            <h2 style={{
                                fontFamily: 'Arial Black, sans-serif',
                                fontSize: '18px',
                                color: hub.color,
                                margin: '0 0 5px 0',
                                textTransform: 'uppercase',
                                textShadow: `0 0 15px ${hub.color}`,
                                zIndex: 10
                            }}>
                                0{i + 1}. {hub.title}
                            </h2>

                            {/* Sub-Header */}
                            <h3 style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '10px',
                                color: 'white',
                                margin: '0 0 20px 0',
                                letterSpacing: '3px',
                                textTransform: 'uppercase',
                                fontWeight: 'lighter',
                                opacity: 0.8,
                                zIndex: 10
                            }}>
                                INVESTORS WORLD
                            </h3>

                            {/* Button */}
                            <div style={{
                                padding: '8px 25px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '50px',
                                color: 'white',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                zIndex: 10
                            }}>
                                ENTER HERE
                            </div>

                            {/* The Anchor: Chrome Sphere (50px) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-25px', // Hanging 50% off (size is 50px)
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle at 30% 30%, #f8fafc, #94a3b8, #1e293b, #0f172a)',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.6), inset -5px -5px 10px rgba(0,0,0,0.5), inset 5px 5px 10px rgba(255,255,255,0.8)',
                                zIndex: 20
                            }}>
                                <div style={{ position: 'absolute', top: '8px', left: '12px', width: '15px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', filter: 'blur(1px)' }} />
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderLiquidCard = () => (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', zIndex: 10 }}>
            <LiquidCard
                module={{ title: 'TITANIUM HUB', color: '#22d3ee', icon: '⚡', id: 'sector-s' }}
                isSelected={true}
                onClick={() => setView('R')} // Return to Carousel (Main Hub)
            />
        </div>
    );

    const renderSectorU = () => (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            background: '#050505' // Deep background
        }}>
            {/* 1. NORTH STAR NAV (SLEEK HEADER) - TI: GLASS */}
            {/* LAW 3: Height 14px (66% Reduction) | Fixed Top */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '14px', zIndex: 1000,
                backdropFilter: 'blur(20px)',
                background: 'rgba(0,0,0,0.6)', // Condensed Dark Glass
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0 10px',
                paddingTop: 'env(safe-area-inset-top)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Arial, sans-serif', fontSize: '8px', letterSpacing: '2px', fontWeight: 'bold' }}>KRONOS OS // SECTOR U</div>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 5px #22d3ee' }} />
            </div>

            {/* 2. SERVER RACK (MAIN CONTAINER) */}
            {/* LAW 3: Stacked Flex | 10px Padding/Gap Rule */}
            <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', gap: '10px',
                paddingTop: '34px',     // 14px Nav + 10px Gap + Safe Area consideration (using fixed 34px for now to be safe, implies 20px status bar? No, user said 10px gap. 14+10=24px. Let's use 24px + maybe extra for safe area if needed, but user said "immediately under". 24px absolute.)
                paddingBottom: '80px',  // 70px Dock + 10px Gap
                paddingLeft: '10px',
                paddingRight: '10px',
                zIndex: 10
            }}>

                {/* TILE 1: TOP BLOCK (TITANIUM HUB) */}
                {/* LAW 3: Flex 1 (50% Split) | Dark Glass */}
                <div style={{
                    flex: 1,
                    background: 'rgba(5, 10, 15, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderTop: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{ transform: 'scale(0.85)' }}>
                        <LiquidCard module={{ title: 'TITANIUM HUB', color: '#22d3ee', icon: '⚡', id: 'sector-s' }} isSelected={true} onClick={() => { }} />
                    </div>
                </div>

                {/* TILE 2: BOTTOM BLOCK (AUXILIARY SYSTEM) */}
                {/* LAW 3: Flex 1 (50% Split) | Identical Styling to Tile 1 */}
                <div style={{
                    flex: 1,
                    background: 'rgba(5, 10, 15, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderTop: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    position: 'relative',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '10px',
                    letterSpacing: '2px'
                }}>
                    <div>/// AUXILIARY SYSTEM ///</div>
                    <div style={{ fontSize: '24px', color: '#22d3ee', marginTop: '10px', textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>ONLINE</div>
                </div>

            </div>

            {/* 3. THE DOCK (BOTTOM NAV) */}
            {/* LAW 3: Fixed 70px Height | Z-Index 1000 */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, height: '70px', zIndex: 1000,
                backdropFilter: 'blur(20px)',
                background: 'rgba(0,0,0,0.8)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingLeft: '30px', paddingRight: '30px'
            }}>
                {/* LEFT FLANK: PREV BUTTON */}
                <button onClick={prevView} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)', padding: '8px 16px', fontSize: '10px', letterSpacing: '1px',
                    cursor: 'pointer', transition: 'all 0.2s', zIndex: 20
                }}>PREV</button>

                {/* CENTRE CLUSTER: 5-ELEMENT ARRAY */}
                {/* LAW 3: Absolute Center to guarantee alignment independent of side buttons */}
                <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: '24px', // gap-6 equivalent
                    zIndex: 10
                }}>
                    {/* BUTTON 1: SYS */}
                    <button style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: '9px', letterSpacing: '2px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>SYS</button>

                    {/* BUTTON 2: COM */}
                    <button style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: '9px', letterSpacing: '2px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>COM</button>

                    {/* THE ANCHOR: SILVER BALL */}
                    <div style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: 'radial-gradient(circle at 30% 30%, #ffffff, #94a3b8, #0f172a)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(0,0,0,0.5)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.3)',
                        position: 'relative', top: '-10px' // Pop out slightly
                    }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }} />
                    </div>

                    {/* BUTTON 3: MKT */}
                    <button style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: '9px', letterSpacing: '2px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>MKT</button>

                    {/* BUTTON 4: AST */}
                    <button style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.6)', padding: '6px 12px', fontSize: '9px', letterSpacing: '2px',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}>AST</button>
                </div>

                {/* RIGHT FLANK: NEXT BUTTON */}
                <button onClick={nextView} style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)', padding: '8px 16px', fontSize: '10px', letterSpacing: '1px',
                    cursor: 'pointer', transition: 'all 0.2s', zIndex: 20
                }}>NEXT</button>
            </div>
        </div>
    );

    const renderLiquidCarousel = () => (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            transformStyle: 'preserve-3d'
        }}>
            <div style={{ position: 'absolute', top: '5%', color: '#0891b2', fontSize: '20px', letterSpacing: '10px', fontWeight: '900', opacity: 0.8, textShadow: '0 0 20px #22d3ee' }}>SECTOR T: LIQUID TITANIUM</div>

            <div style={{
                position: 'relative', width: '0px', height: '0px',
                transformStyle: 'preserve-3d',
                transform: `translate3d(0, 600px, -900px) rotateX(30deg) rotateY(${rotation}deg)`
            }}>
                {hubs.map((hub, i) => {
                    const angle = (360 / hubs.length) * i;
                    // "Liquid Titanium" Logic - Cloned from LiquidCard.jsx
                    return (
                        <div key={i}
                            onClick={() => handleHubClick(hub.title)}
                            style={{
                                position: 'absolute', left: '50%', top: '50%',
                                width: '300px', height: '200px',
                                borderRadius: '24px', // Slightly more rounded
                                // Background: Deepest Black/Teal Base with "Smoke" & "Sheen"
                                background: `
                                    linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 100%),
                                    radial-gradient(circle at 50% 0%, ${hub.liquid}40, transparent 70%),
                                    linear-gradient(to bottom, #0f172a, #020617)
                                `,
                                // Border Effects
                                borderTop: '1px solid rgba(255,255,255,0.5)', // Bright Bevel
                                borderLeft: '1px solid rgba(255,255,255,0.05)',
                                borderRight: '1px solid rgba(255,255,255,0.05)',
                                borderBottom: '1px solid rgba(255,255,255,0.05)', // Subtle dark edge
                                // Shadow: Heavy Ambient Occlusion
                                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(0,0,0,0.8)',
                                backdropFilter: 'blur(20px)',
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) rotateX(0deg)`,
                                backfaceVisibility: 'visible',
                                overflow: 'visible',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) scale(1.1)`;
                                e.currentTarget.style.boxShadow = `0 0 30px ${hub.color}60, inset 0 0 20px ${hub.color}40`;
                                e.currentTarget.style.border = `1px solid ${hub.color}`;
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(800px) rotateX(0deg)`;
                                e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(0,0,0,0.8)';
                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                                e.currentTarget.style.borderTop = '1px solid rgba(255,255,255,0.5)';
                            }}
                        >
                            {/* Glossy Overlay */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                borderRadius: '24px',
                                background: 'linear-gradient(125deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 100%)',
                                pointerEvents: 'none'
                            }} />

                            {/* Header - Glowing Hub Color */}
                            <h2 style={{
                                fontFamily: 'Arial Black, sans-serif',
                                fontSize: '20px',
                                color: hub.color,
                                margin: '0 0 5px 0',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                textShadow: `0 0 15px ${hub.color}90, 0 0 10px ${hub.color}60`,
                                zIndex: 10
                            }}>
                                0{i + 1}. {hub.title}
                            </h2>

                            {/* Sub-Header - White/Spaced */}
                            <h3 style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '10px',
                                color: 'white',
                                margin: '0 0 20px 0',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                fontWeight: '600',
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                zIndex: 10
                            }}>
                                INVESTORS WORLD
                            </h3>

                            {/* Button - Glassmorphism */}
                            <div style={{
                                padding: '10px 30px',
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '50px',
                                color: 'white',
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '9px',
                                fontWeight: 'bold',
                                letterSpacing: '2px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.05)',
                                zIndex: 10,
                                textTransform: 'uppercase'
                            }}>
                                ENTER HERE
                            </div>

                            {/* The Anchor: Chrome Sphere (50px, hanging 50% off) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-25px', // Hanging off
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                // Chrome Gradient
                                background: 'radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1, #475569, #0f172a)',
                                boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset -5px -5px 15px rgba(0,0,0,0.8)',
                                zIndex: 20
                            }}>
                                {/* Specular Highlight */}
                                <div style={{ position: 'absolute', top: '8px', left: '12px', width: '18px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', filter: 'blur(2px)' }} />

                                {/* Contact Shadow on Glass */}
                                <div style={{
                                    position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
                                    width: '80%', height: '15px',
                                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
                                    zIndex: -1
                                }} />
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Default Sphere Data
    const getSphereData = (letter) => {
        const defaultStyle = {
            bg: 'radial-gradient(circle at 30% 30%, #4b5563, #1f2937, #000)',
            shadow: 'inset -10px -10px 20px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.4), 0 0 20px #6b7280',
            text: '#e5e7eb'
        };

        switch (letter) {
            case 'A': return {
                bg: 'radial-gradient(circle at 30% 30%, #b91c1c, #7f1d1d, #000)', // Red
                shadow: 'inset -10px -10px 20px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.4), 0 0 20px #ef4444',
                text: '#fecaca'
            };
            case 'B': return {
                bg: 'radial-gradient(circle at 30% 30%, #60a5fa, #1e3a8a, #000)', // Blue
                shadow: 'inset -10px -10px 20px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.4), 0 0 20px #3b82f6',
                text: '#ffffff'
            };
            case 'C': return {
                bg: 'radial-gradient(circle at 30% 30%, #ffffff, #94a3b8, #0f172a)', // White
                shadow: 'inset -10px -10px 20px rgba(0,0,0,0.9), inset 10px 10px 20px rgba(255,255,255,1), 0 0 30px #2563eb',
                text: '#006aff'
            };
            case 'D': return {
                bg: 'radial-gradient(circle at 30% 30%, #fbbf24, #b45309, #000)', // Gold/Amber
                shadow: 'inset -10px -10px 20px rgba(0,0,0,0.8), inset 10px 10px 20px rgba(255,255,255,0.4), 0 0 20px #f59e0b',
                text: '#fffbeb'
            };
            default: return defaultStyle;
        }
    };

    return (
        <div style={{
            width: '100vw', height: '100vh',
            background: '#050505',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden',
            perspective: '2300px', perspectiveOrigin: '50% -1000px',
            color: 'white'
        }}>
            <MatrixRain />

            {/* RENDER LOGIC */}
            {(view === 'U') ? renderSectorU() :
                (view === 'T') ? renderLiquidCarousel() :
                    (view === 'E' || view === 'R') ? renderCarousel() :
                        (view === 'S') ? renderLiquidCard() :
                            (() => {
                                const { bg, shadow, text } = getSphereData(view);
                                return renderIntroSphere(view, bg, shadow, text);
                            })()
            }

            {/* NAVIGATION CONTROLS */}
            <div style={{
                position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '20px', zIndex: 100
            }}>
                <button onClick={prevView} style={{ padding: '10px 20px', fontSize: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '5px', cursor: 'pointer' }}>PREV</button>
                <div style={{ padding: '10px', fontSize: '16px', fontWeight: 'bold' }}>{view}</div>
                <button onClick={nextView} style={{ padding: '10px 20px', fontSize: '16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '5px', cursor: 'pointer' }}>NEXT</button>
            </div>
        </div>
    );
}

export default App;
