import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
}

const Marquee: React.FC<MarqueeProps> = ({ children, speed = 'normal', direction = 'left' }) => {
  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow':
        return '30s';
      case 'normal':
        return '20s';
      case 'fast':
        return '10s';
      default:
        return '20s';
    }
  };

  const animationDirection = direction === 'left' ? 'normal' : 'reverse';

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-content {
          display: inline-block;
          animation: marquee-scroll ${getAnimationDuration()} linear infinite ${animationDirection};
          padding-left: 100%; /* Start off-screen */
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="marquee-content">
        {children}
      </div>
    </div>
  );
};

export default Marquee;