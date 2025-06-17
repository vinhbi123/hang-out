import React from 'react';
import backgroundImage from '../../assets/Background.png';

const BackgroundImage = () => {
    return (
        <div className="relative w-1/2">
            <img
                src={backgroundImage}
                alt="beach"
                className="w-full h-full object-cover rounded-r-[50px]"
            />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white rounded-b-2xl p-2 mt-2">
                <img
                    src="src/assets/Bird Design4 1.png"
                    alt="Bird Logo"
                    className="w-20 h-20 object-contain"
                />
            </div>
        </div>
    );
};

export default BackgroundImage;