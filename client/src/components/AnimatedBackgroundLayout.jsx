import React, { useEffect, useState } from 'react';
import ParticleBackground from './ParticleBackground';

const AnimatedBackgroundLayout = ({ children }) => {
    const [scrollY, setScrollY] = useState(0);

    // Handle scroll for parallax effects
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative transition-colors duration-300">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Parallax Animated Blobs */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ transform: `translateY(${scrollY * 0.5}px)` }}
            >
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {children}
            </div>

            {/* Inline CSS for Blob Animations */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default AnimatedBackgroundLayout;
