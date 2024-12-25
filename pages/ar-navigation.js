import React from 'react';
import dynamic from 'next/dynamic';

const ARNavigation = dynamic(() => import('../components/ARNavigation'), { ssr: false });

const ARNavigationPage = () => {
    return (
        <div className="ar-navigation-page">
            <ARNavigation />
        </div>
    );
};

export default ARNavigationPage;

