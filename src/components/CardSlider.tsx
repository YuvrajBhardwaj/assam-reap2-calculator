import React from 'react';
import { useEffect } from 'react';

interface CardSliderProps {
  children: React.ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
}

const CardSlider: React.FC<CardSliderProps> = ({ children, speed = 'normal', direction = 'left' }) => {
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

  
  let cardsArray: JSX.Element[] = [];
  if (Array.isArray(children)) {
    cardsArray = children as JSX.Element[];
  } else {
    cardsArray = [children as JSX.Element];
  }
  
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="inline-block ani">
        {cardsArray.map((card, index) => (
          <div
            key={index}
            className={`inline-block px-4 ${index !== 0 ? 'ml-8' : ''}`}
          >
            {card}
          </div>
        ))}
        {cardsArray.map((card, index) => (
          <div
            key={`clone-${index}`}
            className="inline-block px-4 ml-8"
          >
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardSlider