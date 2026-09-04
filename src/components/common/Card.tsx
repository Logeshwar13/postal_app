import type { ReactNode } from 'react';
import { useState } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  padding?: number | string;
}

export const Card = ({ children, className = '', hoverable = false, onClick, padding = 20 }: CardProps) => {
  const [lifted, setLifted] = useState(false);

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => hoverable && setLifted(true)}
      onMouseLeave={() => hoverable && setLifted(false)}
      style={{
        background: 'white',
        borderRadius: 16,
        padding,
        border: '1px solid #f0f0f0',
        boxShadow: lifted
          ? '0 8px 24px rgba(0,0,0,0.10)'
          : '0 2px 8px rgba(0,0,0,0.05)',
        transform: lifted ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: onclick ? 'pointer' : 'default',
        color: '#111827',
      }}
    >
      {children}
    </div>
  );
};
