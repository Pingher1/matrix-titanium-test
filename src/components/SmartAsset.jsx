import React, { useState } from 'react';

const SYSTEM_FALLBACK = '/assets/matrix_grid_placeholder.png'; // Verified existence via copy

const SmartAsset = ({ src, type, alt, fallbackSrc, className }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        console.warn(`⚠️ SmartAsset Alert: Failed to load ${src}. Engaging Fallback.`);
        setHasError(true);
        setIsLoading(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    if (hasError) {
        return (
            <img
                src={fallbackSrc || SYSTEM_FALLBACK}
                alt="Asset Offline"
                className={`${className} opacity-50 grayscale`}
            />
        );
    }

    if (type === 'video') {
        return (
            <video
                src={src}
                className={className}
                autoPlay
                loop
                muted
                playsInline
                onError={handleError}
                onLoadedData={handleLoad}
            />
        );
    }

    return (
        <img
            src={src}
            alt={alt || 'Smart Asset'}
            className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-500`}
            onError={handleError}
            onLoad={handleLoad}
        />
    );
};

export default SmartAsset;
