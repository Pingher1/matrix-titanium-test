import React from 'react';
import { motion } from 'framer-motion';

const LiquidCard = ({ title, value, icon: Icon, delay = 0 }) => {
    return (
        <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{
                y: [0, -10, 0],
                opacity: 1
            }}
            transition={{
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay
                },
                opacity: { duration: 0.5 }
            }}
            style={{
                background: 'rgba(20, 20, 30, 0.6)', // Dark Glass
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: '#ececec',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>{title}</span>
                {Icon && <Icon size={20} color="#00f0ff" />}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                {value}
            </div>
        </motion.div>
    );
};

export default LiquidCard;
