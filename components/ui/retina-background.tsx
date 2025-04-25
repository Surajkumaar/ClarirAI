import React, { ReactNode } from 'react';

type RetinaBackgroundProps = {
  children: ReactNode;
  overlay?: boolean;
  className?: string;
  opacity?: 'light' | 'medium' | 'dark' | 'none';
};

const RetinaBackground = ({
  children,
  overlay = false,
  className = '',
  opacity = 'medium',
}: RetinaBackgroundProps) => {
  // Define opacity values
  const opacityClasses = {
    none: 'bg-opacity-0',
    light: 'bg-opacity-10',
    medium: 'bg-opacity-20',
    dark: 'bg-opacity-40',
  };

  if (overlay) {
    return (
      <div className={`relative ${className}`}>
        <div className={`absolute inset-0 retina-background bg-teal-50 bg-blend-soft-light ${opacityClasses[opacity]} z-0`} />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return <div className={`retina-background ${className}`}>{children}</div>;
};

export default RetinaBackground;
