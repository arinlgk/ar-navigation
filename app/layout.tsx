// app/layout.tsx
import React from 'react';

export const metadata = {
  title: 'Your App Title',
  description: 'Your App Description',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
