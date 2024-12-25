import React from 'react';
import Link from 'next/link';

const HomePage = () => {
    return (
        <div className="homepage">
            <h1>Welcome to UMP Pekan AR Navigation</h1>
            <p>Explore the Universiti Malaysia Pahang Pekan Campus using augmented reality. Navigate to key locations with ease!</p>
            <ul>
                <li>✓ Easy navigation to key locations</li>
                <li>✓ Real-time AR guidance</li>
                <li>✓ Works while walking around campus</li>
            </ul>
            <Link href="/ar-navigation">
                <span className="start-button">Start AR Navigation</span>
            </Link>
        </div>
    );
};

export default HomePage;

