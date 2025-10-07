
import React from 'react';

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  backgroundImage?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, children, backgroundImage }) => {
  const heroStyle = backgroundImage ? {
    backgroundImage: `url(${backgroundImage})`,
  } : {};

  // Base classes
  let heroClasses = `relative text-white px-4 sm:px-6 lg:px-8 text-center`;

  // Apply styles conditionally
  if (backgroundImage) {
    heroClasses += ' bg-cover bg-center py-20';
  } else {
    heroClasses += ' bg-[#08040e] pb-20 pt-36'; // pt-36 = 9rem = 4rem for nav + 5rem for spacing
  }

  return (
    <div className={heroClasses} style={heroStyle}>
      {/* Overlay */}
      {backgroundImage && <div className="absolute inset-0 bg-black/60"></div>}
      
      <div className="relative">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
        {subtitle && <p className="mt-4 text-xl text-gray-200">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
};

export default Hero;
