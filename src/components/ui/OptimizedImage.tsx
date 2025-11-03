import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  // Add more props for responsive images if needed, e.g., srcSet, sizes
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, loading = 'lazy', ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading} // Default to lazy loading
      {...props}
    />
  );
};

export default OptimizedImage;