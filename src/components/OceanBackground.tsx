import React, { useMemo } from 'react';

export const OceanBackground: React.FC = () => {
  // Pre-generate stable random bubbles for ambient underwater atmosphere
  const bubbles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      size: Math.floor(10 + Math.random() * 24),
      left: Math.floor(Math.random() * 96) + '%',
      duration: Math.floor(12 + Math.random() * 18) + 's',
      delay: Math.floor(Math.random() * 10) + 's',
      opacity: 0.25 + Math.random() * 0.45,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print" aria-hidden="true">
      {/* Deep Ocean gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #063158 0%, #031c36 45%, #021326 85%, #010a14 100%)'
        }}
      />

      {/* Luminous cyan caustics / underwater light cone rays */}
      <div className="absolute -top-32 left-1/4 w-[700px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full" />
      <div className="absolute top-10 right-10 w-[500px] h-[400px] bg-pink-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-1/3 w-[600px] h-[350px] bg-teal-500/10 blur-[110px] rounded-full" />

      {/* Animated Rising Bubbles */}
      {bubbles.map(b => (
        <div
          key={b.id}
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            animationDuration: b.duration,
            animationDelay: b.delay,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  );
};
