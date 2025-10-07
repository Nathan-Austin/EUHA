
import React from 'react';

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}>
      {children}
    </div>
  );
};

export default SectionContainer;
