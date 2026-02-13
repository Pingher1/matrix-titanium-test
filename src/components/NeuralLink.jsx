import React from 'react';
import { motion } from 'framer-motion';

const NeuralLink = ({ isActive, message = "ESTABLISHING HANDSHAKE...", color = "#00f0ff" }) => {
    if (!isActive) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50, // Top layer
            pointerEvents: 'none', // Let clicks pass through
            backdropFilter: 'blur(2px)' // Slight blur for focus
        }}>
            {/* Core Neural Pulse */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: [0, 360]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    width: '300px',
                    height: '300px',
                    border: `2px solid ${color}`,
                    borderRadius: '50%',
                    boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}`,
                    position: 'absolute'
                }}
            />

            {/* Inner Ring */}
            <motion.div
                animate={{
                    scale: [1, 0.8, 1],
                    rotate: [360, 0]
                }}
                transition={{
                    duration: 1.5, // Slightly faster for "Effectiveness"
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    width: '200px',
                    height: '200px',
                    border: '1px dashed #ff003c', // Keep red accent for contrast, or make dynamic? Let's keep red for the "Core" heat.
                    borderRadius: '50%',
                    position: 'absolute'
                }}
            />

            {/* Text Indicator */}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{
                    color: color,
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    textShadow: `0 0 5px ${color}`,
                    marginTop: '400px', // Push below circle
                    background: 'rgba(0,0,0,0.9)',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: `1px solid ${color}`
                }}
            >
                {message}
            </motion.div>
        </div>
    );
};

export default NeuralLink;
