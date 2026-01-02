import React from 'react';

interface ParticlesProps {
    count?: number;
    className?: string;
}

const Particles: React.FC<ParticlesProps> = ({ count = 20, className = '' }) => {
    // إنشاء مصفوفة من الجزيئات مع خصائص عشوائية
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 6 + 2, // حجم بين 2 و 8
        left: Math.random() * 100, // موقع أفقي عشوائي
        delay: Math.random() * 20, // تأخير عشوائي
        duration: Math.random() * 20 + 15, // مدة الحركة بين 15 و 35 ثانية
        opacity: Math.random() * 0.3 + 0.1, // شفافية بين 0.1 و 0.4
    }));

    return (
        <div className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
            {/* الجزيئات العائمة */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-parliament-wood/20"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.left}%`,
                        bottom: '-20px',
                        opacity: particle.opacity,
                        animation: `floatUp ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                    }}
                />
            ))}

            {/* جزيئات إضافية بأشكال مختلفة */}
            {particles.slice(0, 10).map((particle) => (
                <div
                    key={`star-${particle.id}`}
                    className="absolute bg-parliament-accent/10"
                    style={{
                        width: `${particle.size * 1.5}px`,
                        height: `${particle.size * 1.5}px`,
                        left: `${(particle.left + 50) % 100}%`,
                        bottom: '-20px',
                        opacity: particle.opacity * 0.7,
                        transform: 'rotate(45deg)',
                        animation: `floatUp ${particle.duration * 1.2}s ease-in-out ${particle.delay + 5}s infinite`,
                    }}
                />
            ))}

            {/* Style للـ animation */}
            <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: var(--particle-opacity, 0.3);
          }
          90% {
            opacity: var(--particle-opacity, 0.3);
          }
          100% {
            transform: translateY(-100vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes drift {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(20px);
          }
        }
      `}</style>
        </div>
    );
};

export default Particles;
