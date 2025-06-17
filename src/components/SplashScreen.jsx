import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splashAnimation from '../../src/assets/Animation - 1749649878254.gif';
const SplashScreen = ({ onComplete }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete(); // Call the callback to proceed
        }, 5000); // 5 seconds

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, [onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                transition: 'background-color 0.3s ease', // Smooth transition for hover
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'; // White semi-transparent on hover
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000'; // Back to black on leave
            }}
        >
            <img
                src={splashAnimation}
                alt="Splash Animation"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
        </div>
    );
};

export default SplashScreen;