import { motion } from 'framer-motion';

export type BlipMood = 'idle' | 'cheer' | 'sweat' | 'sad' | 'sleep' | 'focus';

export default function Blip({ mood = 'idle', className = '' }: { mood?: BlipMood, className?: string }) {
  // Volumetric animations
  const float = {
    y: [0, -6, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };
  
  const shadowFloat = {
    scale: [1, 0.8, 1],
    opacity: [0.6, 0.3, 0.6],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  };

  const jump = {
    y: [0, -15, 0],
    scaleY: [1, 1.05, 0.95, 1],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" }
  };

  const jumpShadow = {
    scale: [1, 0.5, 1],
    opacity: [0.6, 0.1, 0.6],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" }
  };

  const shake = {
    x: [-1, 1, -1],
    transition: { duration: 0.1, repeat: Infinity }
  };

  const sleepFloat = {
    y: [0, -4, 0],
    rotate: [0, 3, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  };

  let animation: any = float;
  let shadowAnim: any = shadowFloat;
  
  if (mood === 'cheer') {
    animation = jump;
    shadowAnim = jumpShadow;
  }
  if (mood === 'sweat') {
    animation = shake;
    shadowAnim = { scale: 1, opacity: 0.6 };
  }
  if (mood === 'sleep') {
    animation = sleepFloat;
  }

  return (
    <div className={`relative ${className} flex flex-col items-center justify-center`}>
      <motion.div animate={animation} className="relative z-10 w-full h-full">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
          <defs>
            {/* Soft gradient body */}
            <linearGradient id="bodyGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF3E0" />
              <stop offset="100%" stopColor="#F5ECE3" />
            </linearGradient>
            
            {/* Core shadow for volume */}
            <radialGradient id="bodyShadow" cx="30" cy="30" r="80" gradientUnits="userSpaceOnUse">
              <stop offset="50%" stopColor="transparent" />
              <stop offset="100%" stopColor="rgba(36,27,47,0.15)" />
            </radialGradient>
            
            {/* Inner top highlight for puffiness */}
            <linearGradient id="bodyHighlight" x1="50" y1="10" x2="50" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Accent colored parts */}
            <linearGradient id="accentGrad" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#FF9C80" />
              <stop offset="100%" stopColor="#FF8B6B" />
            </linearGradient>
            
            <filter id="softDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#241B2F" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Body Base - Clean rounded pill/egg shape */}
          <g filter="url(#softDropShadow)">
            <path d="M50 15 C 80 15, 85 45, 80 70 C 75 85, 25 85, 20 70 C 15 45, 20 15, 50 15 Z" fill="url(#bodyGrad)" />
            <path d="M50 15 C 80 15, 85 45, 80 70 C 75 85, 25 85, 20 70 C 15 45, 20 15, 50 15 Z" fill="url(#bodyShadow)" />
            <path d="M50 15 C 80 15, 85 45, 80 70 C 75 85, 25 85, 20 70 C 15 45, 20 15, 50 15 Z" fill="url(#bodyHighlight)" />
            
            {/* Little belly patch */}
            <path d="M50 55 C 65 55, 70 70, 65 80 C 60 85, 40 85, 35 80 C 30 70, 35 55, 50 55 Z" fill="rgba(255,139,107,0.15)" />
          </g>
          
          {/* Eyes (Duolingo/Finch style - solid dark aubergine) */}
          {mood === 'sleep' ? (
            <>
              <path d="M35 45 Q 40 48 45 45" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M55 45 Q 60 48 65 45" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" fill="none" />
              <motion.text x="75" y="25" fontSize="14" fill="#8E7C9E" fontWeight="bold" animate={{ opacity: [0, 1, 0], y: [-5, -15], x: [0, 5] }} transition={{ duration: 2, repeat: Infinity }}>Z</motion.text>
            </>
          ) : mood === 'sad' ? (
            <>
              <circle cx="38" cy="45" r="5" fill="#241B2F" />
              <circle cx="62" cy="45" r="5" fill="#241B2F" />
              {/* Sad eyebrows */}
              <path d="M32 38 L 42 40" stroke="#241B2F" strokeWidth="3" strokeLinecap="round" />
              <path d="M68 38 L 58 40" stroke="#241B2F" strokeWidth="3" strokeLinecap="round" />
              {/* Tear */}
              <circle cx="38" cy="55" r="3" fill="#5EC8B0" />
            </>
          ) : mood === 'focus' ? (
            <>
              <path d="M32 45 L 42 45" stroke="#241B2F" strokeWidth="5" strokeLinecap="round" />
              <path d="M68 45 L 58 45" stroke="#241B2F" strokeWidth="5" strokeLinecap="round" />
              {/* Headphones */}
              <path d="M25 50 C 25 15, 75 15, 75 50" stroke="#5EC8B0" strokeWidth="5" strokeLinecap="round" fill="none" />
              <rect x="20" y="40" width="8" height="20" rx="4" fill="#FF8B6B" />
              <rect x="72" y="40" width="8" height="20" rx="4" fill="#FF8B6B" />
            </>
          ) : mood === 'cheer' ? (
            <>
              <path d="M34 42 L 42 42" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" />
              <path d="M38 38 L 38 46" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" />
              <path d="M58 42 L 66 42" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" />
              <path d="M62 38 L 62 46" stroke="#241B2F" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : mood === 'sweat' ? (
            <>
              <circle cx="38" cy="45" r="5" fill="#241B2F" />
              <circle cx="62" cy="45" r="5" fill="#241B2F" />
              <path d="M75 35 Q 80 42 75 45 Q 70 42 75 35" fill="#5EC8B0" />
            </>
          ) : (
            <>
              {/* Idle: Cute large pupils with catchlights */}
              <circle cx="38" cy="45" r="5" fill="#241B2F" />
              <circle cx="37" cy="43.5" r="1.5" fill="#FFFFFF" />
              <circle cx="62" cy="45" r="5" fill="#241B2F" />
              <circle cx="61" cy="43.5" r="1.5" fill="#FFFFFF" />
            </>
          )}

          {/* Cute little beak/mouth */}
          {mood === 'sad' ? (
            <path d="M48 55 Q 50 53 52 55" stroke="#FF8B6B" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : mood === 'cheer' ? (
            <path d="M45 52 C 45 60, 55 60, 55 52 Z" fill="#FF8B6B" />
          ) : (
            <path d="M48 53 Q 50 56 52 53" stroke="#FF8B6B" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}
          
          {/* Rosy cheeks */}
          <circle cx="28" cy="50" r="4" fill="rgba(255,139,107,0.3)" />
          <circle cx="72" cy="50" r="4" fill="rgba(255,139,107,0.3)" />
        </svg>
      </motion.div>
      
      {/* Contact Shadow on the "ground" */}
      <motion.div 
        animate={shadowAnim}
        className="absolute -bottom-2 w-12 h-3 bg-black rounded-[100%] blur-[4px] z-0"
      />
    </div>
  );
}
