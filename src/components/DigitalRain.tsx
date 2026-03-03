import React, { useEffect, useRef } from 'react';

interface DigitalRainProps {
    color?: string;
    speed?: number;
    density?: number;
}

const DigitalRain: React.FC<DigitalRainProps> = ({
    color = '#0F0',
    speed = 1,
    density = 0.95
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Matrix characters (Katakana + Latin + Numerals)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*/\\|アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン'.split('');

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = Math.random() * -100; // Start off-screen
        }

        const draw = () => {
            // Black background with slight opacity to create the fade trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                // Reset drop to top randomly to create staggered rain
                if (drops[i] * fontSize > canvas.height && Math.random() > density) {
                    drops[i] = 0;
                }

                drops[i] += speed;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed, density]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none w-full h-full"
            style={{ background: 'black' }}
        />
    );
};

export default DigitalRain;
