import { useState, useEffect, useRef } from 'react';
// Image served from public/assets folder - Industry Standard for Static Assets
const texasLogo = "/assets/trt_texas_logo.png";

const Carousel = () => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const carouselRef = useRef(null);

    // 10 Tiles as requested
    const items = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Module ${i + 1}`,
        content: `System Data Block ${i + 1}`
    }));

    const radius = 450; // Increased radius for 10 items to fit nicely
    const itemAngle = 360 / items.length;

    // Auto-rotation effect
    useEffect(() => {
        if (!isDragging) {
            const interval = setInterval(() => {
                setRotation(prev => prev - 0.15); // Slightly slower for more items
            }, 16);
            return () => clearInterval(interval);
        }
    }, [isDragging]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        setRotation(prev => prev + deltaX * 0.3); // Slower manual rotation sensitivity
        setStartX(e.clientX);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        setRotation(prev => prev + deltaX * 0.3);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            className="carousel-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
                perspective: '1200px', // Increased perspective for deeper view
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 20
            }}
        >
            <div
                className="carousel-ring"
                ref={carouselRef}
                style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${rotation}deg)`,
                    position: 'relative',
                    width: '300px',
                    height: '200px',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
            >
                {items.map((item, index) => {
                    const angle = index * itemAngle;
                    return (
                        <div
                            key={item.id}
                            className="carousel-item"
                            style={{
                                position: 'absolute',
                                width: '260px',
                                height: '360px', // Taller cards for better presence
                                left: '20px',
                                top: '-60px', // Center vertically relative to container
                                backgroundColor: 'rgba(10, 20, 10, 0.65)', // Darker semi-transparent base
                                border: '1px solid rgba(0, 255, 255, 0.3)', // Cyan hint
                                borderTop: '1px solid rgba(255, 255, 255, 0.5)', // Highlight top
                                borderBottom: '1px solid rgba(255, 0, 255, 0.3)', // Magenta hint bottom
                                boxShadow: '0 0 20px rgba(0, 255, 100, 0.1), inset 0 0 20px rgba(0, 20, 0, 0.5)',
                                borderRadius: '15px',
                                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                color: '#e0ffe0',
                                textShadow: '0 0 5px rgba(0, 255, 0, 0.5)',
                                backdropFilter: 'blur(8px)',
                                userSelect: 'none',
                                padding: '20px',
                                textAlign: 'center',
                                backfaceVisibility: 'visible',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Watermark Background */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '80%',
                                height: '80%',
                                backgroundImage: `url(${texasLogo})`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                opacity: 0.15, // Subtle watermark
                                zIndex: -1,
                                filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) brightness(0.8)' // Greenish tint
                            }} />

                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #00ffff, #ff00ff)',
                                marginBottom: '15px',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                                opacity: 0.8
                            }} />

                            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>{item.title}</h3>
                            <p style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>{item.content}</p>

                            <div style={{
                                marginTop: 'auto',
                                width: '80%',
                                height: '1px',
                                background: 'linear-gradient(90deg, transparent, #0f0, transparent)',
                                opacity: 0.5
                            }} />
                            <div style={{
                                marginTop: '10px',
                                fontSize: '0.7rem',
                                color: '#0ff',
                                letterSpacing: '2px'
                            }}>ACCESS</div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default Carousel;
