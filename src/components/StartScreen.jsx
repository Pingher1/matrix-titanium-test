import { useState } from 'react';
// Image served from public/assets folder - Industry Standard
const professionalLogo = "/assets/trt_professional_logo.svg";

const StartScreen = ({ onEnter }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(true);
        // Delay slightly for animation before triggering callback
        setTimeout(() => {
            onEnter();
        }, 800);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100, // Topmost layer
            transition: 'opacity 0.8s ease-out',
            opacity: isClicked ? 0 : 1,
            pointerEvents: isClicked ? 'none' : 'auto'
        }}>
            {/* Xbox-style Power Button */}
            <button
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'radial-gradient(circle at 30% 30%, #333, #000)',
                    cursor: 'pointer',
                    boxShadow: isHovered || isClicked
                        ? '0 0 30px #0f0, inset 0 0 20px rgba(0, 255, 0, 0.5)'
                        : '0 0 15px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    transform: isClicked ? 'scale(1.5)' : (isHovered ? 'scale(1.1)' : 'scale(1)'),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    outline: 'none'
                }}
            >
                {/* Texas Logo Image */}
                <img
                    src={professionalLogo}
                    alt="Enter Matrix"
                    style={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                        filter: isHovered || isClicked ? 'drop-shadow(0 0 5px #fff)' : 'drop-shadow(0 0 2px #0f0)',
                        transition: 'all 0.3s ease',
                        opacity: 0.9
                    }}
                />

                {/* Text Label */}
                <span style={{
                    position: 'absolute',
                    bottom: '-40px',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    textShadow: '0 0 5px #0f0',
                    whiteSpace: 'nowrap',
                    opacity: isHovered ? 1 : 0.7,
                    transition: 'opacity 0.3s'
                }}>
                    THE RICHARDSON TEAM
                </span>
            </button>
        </div>
    );
};

export default StartScreen;
