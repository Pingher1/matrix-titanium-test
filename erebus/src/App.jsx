import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, ShieldAlert } from 'lucide-react';
import LiquidCard from './components/LiquidCard';
import axios from 'axios';

function App() {
    const [stats, setStats] = useState({
        status: 'OFFLINE',
        latency: 0,
        assets: 124, // Placeholder
        threats: 0
    });

    useEffect(() => {
        const pingJehovah = async () => {
            try {
                const start = Date.now();
                await axios.get('http://localhost:4000/');
                const latency = Date.now() - start;
                setStats(prev => ({ ...prev, status: 'ONLINE', latency }));
            } catch (e) {
                setStats(prev => ({ ...prev, status: 'OFFLINE', latency: 0 }));
            }
        };

        const interval = setInterval(pingJehovah, 2000); // Heartbeat
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#0a0a0a',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Background Gradient */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* HUD Header */}
            <header style={{
                zIndex: 10,
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(5px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert color={stats.status === 'ONLINE' ? '#00ff41' : '#ff003c'} />
                    <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '2px' }}>EREBUS // ADVERSARY</h1>
                </div>
                <div style={{ fontFamily: 'monospace', color: '#00f0ff' }}>
                    PORT: 5174 | JEHOVAH: {stats.status} ({stats.latency}ms)
                </div>
            </header>

            {/* The Liquid Grid */}
            <main style={{
                zIndex: 10,
                flex: 1,
                padding: '40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                alignContent: 'center'
            }}>
                <LiquidCard
                    title="System Load"
                    value={`${(Math.random() * 20 + 10).toFixed(1)}%`}
                    icon={Activity}
                    delay={0}
                />
                <LiquidCard
                    title="Active Nodes"
                    value="3"
                    icon={Server}
                    delay={0.2}
                />
                <LiquidCard
                    title="Harvested Assets"
                    value={stats.assets}
                    icon={Database}
                    delay={0.4}
                />
                <LiquidCard
                    title="Security Level"
                    value="DEFCON 4"
                    icon={ShieldAlert}
                    delay={0.6}
                />
            </main>
        </div>
    );
}

export default App;
