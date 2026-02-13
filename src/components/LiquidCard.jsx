import React, { useState } from 'react';

const LiquidCard = ({ onClick }) => {
    // Interactive State for 3D tilt effect on hover
    const [style, setStyle] = useState({});

    // Mouse movement handler for glassmorphism tilt
    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        setStyle({ transform: `rotateY(${x}deg) rotateX(${-y}deg)` });
    };

    const handleMouseLeave = () => {
        setStyle({ transform: `rotateY(0deg) rotateX(0deg)` });
    };

    // The Stack: 10 layers for depth
    const layers = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
        <div
            style={{
                perspective: '1200px', // Enhanced perspective for depth
                display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
        >
            <div
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    position: 'relative',
                    width: '600px',
                    height: '350px',
                    transformStyle: 'preserve-3d', // Critical for depth
                    transition: 'transform 0.1s ease-out',
                    cursor: 'pointer',
                    ...style
                }}
            >
                {/* THE STACK: Ghost Layers for Thickness */}
                {layers.map((layer) => (
                    <div key={layer} style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        borderRadius: '24px',
                        background: 'rgba(2, 6, 23, 0.9)', // Dense glass/dark matter
                        border: '1px solid rgba(255,255,255,0.05)', // Catch light on edges
                        transform: `translateZ(-${layer * 2}px)`, // Extrude backwards
                        pointerEvents: 'none',
                        boxShadow: layer === 10 ? '0 50px 100px -20px rgba(0,0,0,0.9)' : 'none' // Shadow on the last layer
                    }} />
                ))}

                {/* MAIN FACE: Liquid Titanium Design (translateZ(0)) */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    borderRadius: '24px',
                    // Background: Deepest Black/Teal Base
                    // Layer 1: Radial Gradient "Smoke"
                    // Layer 2: Linear Gradient "Sheen"
                    background: `
                        linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 100%),
                        radial-gradient(circle at 50% 0%, rgba(34,211,238,0.15), transparent 70%),
                        linear-gradient(to bottom, #0f172a, #020617)
                    `,
                    // Border Effects
                    borderTop: '1px solid rgba(255,255,255,0.5)', // Bright Bevel
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)', // Subtle dark edge
                    // Shadow: Heavy Ambient Occlusion handled by back layer
                    backdropFilter: 'blur(20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'visible', // Allow sphere to hang off
                    transform: 'translateZ(0px)', // Front face
                    backfaceVisibility: 'hidden' // Clean up rendering
                }}>

                    {/* Glossy Overlay for High-End Glass Look */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: '24px',
                        background: 'linear-gradient(125deg, rgba(255,255,255,0.03) 0%, transparent 40%, transparent 100%)',
                        pointerEvents: 'none'
                    }} />

                    {/* Content Container */}
                    <div style={{ zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateZ(20px)' }}>

                        {/* Header: Glowing Cyan */}
                        <h1 style={{
                            fontFamily: 'Arial Black, sans-serif',
                            fontSize: '36px',
                            color: '#22d3ee', // Cyan
                            margin: '0 0 8px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            textShadow: '0 0 25px rgba(34, 211, 238, 0.6), 0 0 10px rgba(34, 211, 238, 0.4)'
                        }}>
                            01. TITANIUM HUB
                        </h1>

                        {/* Sub-Header: Bright White, Wide Tracking */}
                        <h2 style={{
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '12px',
                            color: '#ffffff',
                            margin: '0 0 45px 0',
                            letterSpacing: '10px',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            INVESTORS WORLD
                        </h2>

                        {/* Button: Glassmorphism, White Border, Soft Glow */}
                        <button style={{
                            padding: '14px 45px',
                            background: 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50px',
                            color: 'white',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '3px',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.05)', // Levitation
                            textTransform: 'uppercase',
                            transform: 'translateZ(10px)' // Additional pop
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(34,211,238,0.15)';
                                e.currentTarget.style.borderColor = '#22d3ee';
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(34,211,238,0.5), inset 0 0 10px rgba(34,211,238,0.2)';
                                e.currentTarget.style.transform = 'translateZ(15px) translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3), inset 0 0 10px rgba(255,255,255,0.05)';
                                e.currentTarget.style.transform = 'translateZ(10px)';
                            }}
                        >
                            ENTER HERE
                        </button>

                    </div>

                    {/* The Anchor: Chrome Sphere - Popping OUT of the glass (translateZ(20px)) */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-35px', // Hanging off
                        left: '50%',
                        transform: 'translateX(-50%) translateZ(30px)', // Pushed forward
                        width: '70px', // slightly larger for anchor presence
                        height: '70px',
                        borderRadius: '50%',
                        // Chrome Gradient: White -> Silver -> Slate -> Dark Blue
                        background: 'radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1, #475569, #0f172a)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset -5px -5px 15px rgba(0,0,0,0.8)',
                        zIndex: 20
                    }}>
                        {/* Specular Highlight */}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '18px',
                            width: '25px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            filter: 'blur(3px)'
                        }} />

                        {/* Contact Shadow on the Glass (Pseudo-element simulation) */}
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%) rotateX(90deg)', // Flattened on the "glass" plane? Actually, just positioned behind sphere
                            width: '80%',
                            height: '20px',
                            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)',
                            zIndex: -1,
                            filter: 'blur(5px)'
                        }} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LiquidCard;
