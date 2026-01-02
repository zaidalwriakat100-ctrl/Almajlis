
import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackType?: 'person' | 'generic';
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  alt, 
  fallbackType = 'person', 
  className, 
  ...props 
}) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`} role="img" aria-label={alt}>
        {fallbackType === 'person' ? (
           <User className="w-1/2 h-1/2" />
        ) : (
           <div className="w-full h-full bg-slate-200" />
        )}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default ImageWithFallback;
