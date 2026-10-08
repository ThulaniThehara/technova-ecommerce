export function LoginIllustration({ className = "w-full h-44" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="login-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="login-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="login-key" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="login-padlock" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <filter id="login-shadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1E3A8A" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Decorative backdrop shapes */}
      <path
        d="M260 180 C290 180 320 150 310 100 C300 50 250 40 220 70 C190 100 230 180 260 180 Z"
        fill="#E0E7FF"
        opacity="0.8"
      />
      <path
        d="M80 190 C40 190 30 150 50 120 C70 90 110 110 120 140 C130 170 120 190 80 190 Z"
        fill="#EFF6FF"
      />

      {/* City/window grid backdrop */}
      <rect x="250" y="80" width="40" height="90" rx="3" fill="#BFDBFE" opacity="0.35" />
      <line x1="260" y1="80" x2="260" y2="170" stroke="#93C5FD" strokeWidth="1" opacity="0.5" />
      <line x1="270" y1="80" x2="270" y2="170" stroke="#93C5FD" strokeWidth="1" opacity="0.5" />
      <line x1="280" y1="80" x2="280" y2="170" stroke="#93C5FD" strokeWidth="1" opacity="0.5" />

      {/* Gears */}
      <g transform="translate(100, 32) scale(0.65)" fill="#93C5FD" opacity="0.8">
        <circle cx="20" cy="20" r="14" fill="#93C5FD" />
        <circle cx="20" cy="20" r="6" fill="#EFF6FF" />
        <rect x="17" y="2" width="6" height="36" rx="2" />
        <rect x="2" y="17" width="36" height="6" rx="2" />
        <rect x="6" y="6" width="28" height="28" rx="2" transform="rotate(45 20 20)" />
      </g>
      <g transform="translate(122, 20) scale(0.5)" fill="#60A5FA" opacity="0.9">
        <circle cx="20" cy="20" r="14" fill="#60A5FA" />
        <circle cx="20" cy="20" r="6" fill="#EFF6FF" />
        <rect x="17" y="2" width="6" height="36" rx="2" />
        <rect x="2" y="17" width="36" height="6" rx="2" />
      </g>

      {/* Main Tablet / Device */}
      <g filter="url(#login-shadow)">
        <rect x="100" y="45" width="116" height="142" rx="14" fill="url(#login-screen)" />
        {/* Inner screen frame */}
        <rect x="108" y="55" width="100" height="122" rx="8" fill="#1E40AF" stroke="#60A5FA" strokeWidth="1.5" />
        {/* Home bar / camera dot */}
        <circle cx="158" cy="50" r="2" fill="#93C5FD" />
        
        {/* Padlock on screen */}
        {/* Shackle */}
        <path
          d="M142 105 V92 C142 83 174 83 174 92 V105"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Body */}
        <rect x="132" y="102" width="52" height="42" rx="8" fill="url(#login-padlock)" />
        {/* Keyhole */}
        <circle cx="158" cy="120" r="4" fill="#9F1239" />
        <path d="M156 122 L155 132 H161 L160 122 Z" fill="#9F1239" />
      </g>

      {/* Floating Sparkles */}
      <circle cx="78" cy="86" r="2.5" fill="#3B82F6" />
      <circle cx="92" cy="110" r="1.5" fill="#60A5FA" />
      <circle cx="288" cy="54" r="2.5" fill="#3B82F6" />
      <path d="M72 70 L75 75 L80 78 L75 81 L72 86 L69 81 L64 78 L69 75 Z" fill="#60A5FA" opacity="0.6" />

      {/* Character holding key */}
      {/* Legs */}
      <rect x="242" y="148" width="6" height="38" rx="3" fill="#1E3A8A" />
      <rect x="252" y="148" width="6" height="38" rx="3" fill="#172554" />
      {/* Shoes */}
      <ellipse cx="243" cy="186" rx="6" ry="2.5" fill="#0F172A" />
      <ellipse cx="255" cy="186" rx="6" ry="2.5" fill="#0F172A" />
      {/* Torso */}
      <rect x="238" y="112" width="22" height="38" rx="6" fill="#2563EB" />
      {/* Head */}
      <circle cx="249" cy="98" r="9" fill="#FDBA74" />
      {/* Hair */}
      <path d="M241 96 C241 89 257 87 259 95 C259 98 255 100 249 100 C245 100 241 98 241 96 Z" fill="#1E293B" />
      {/* Arms holding the key */}
      <path d="M240 120 L212 116" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" />
      <circle cx="210" cy="116" r="3.5" fill="#FDBA74" />

      {/* Key */}
      <g filter="url(#login-shadow)">
        <ellipse cx="192" cy="114" rx="14" ry="11" fill="url(#login-key)" />
        <ellipse cx="192" cy="114" rx="6" ry="5" fill="#FFFFFF" />
        <rect x="200" y="111" width="34" height="6" rx="3" fill="url(#login-key)" />
        <rect x="220" y="115" width="4" height="7" rx="1.5" fill="url(#login-key)" />
        <rect x="228" y="115" width="4" height="5" rx="1.5" fill="url(#login-key)" />
      </g>
    </svg>
  );
}

export function SignupIllustration({ className = "w-full h-44" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="signup-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </linearGradient>
        <linearGradient id="signup-phone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="signup-screen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="signup-badge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="signup-shadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Decorative backdrop shapes */}
      <path
        d="M90 180 C50 180 40 140 60 110 C80 80 130 90 150 130 C160 160 130 180 90 180 Z"
        fill="#E0E7FF"
        opacity="0.8"
      />
      <path
        d="M260 190 C220 190 210 160 230 130 C250 100 290 110 300 140 C310 170 300 190 260 190 Z"
        fill="#EFF6FF"
      />

      {/* Decorative foliage / plants */}
      <path d="M72 170 C65 145 80 130 95 138 C90 155 82 165 72 170 Z" fill="#93C5FD" opacity="0.7" />
      <path d="M60 175 C55 155 68 145 80 152 C76 165 68 172 60 175 Z" fill="#60A5FA" opacity="0.6" />

      {/* Floating gears */}
      <g transform="translate(68, 40) scale(0.6)" fill="#93C5FD" opacity="0.7">
        <circle cx="20" cy="20" r="14" fill="#93C5FD" />
        <circle cx="20" cy="20" r="6" fill="#EFF6FF" />
        <rect x="17" y="2" width="6" height="36" rx="2" />
        <rect x="2" y="17" width="36" height="6" rx="2" />
      </g>
      <g transform="translate(88, 28) scale(0.45)" fill="#60A5FA" opacity="0.8">
        <circle cx="20" cy="20" r="14" fill="#60A5FA" />
        <circle cx="20" cy="20" r="6" fill="#EFF6FF" />
        <rect x="17" y="2" width="6" height="36" rx="2" />
        <rect x="2" y="17" width="36" height="6" rx="2" />
      </g>

      {/* Isometric/Perspective Phone showing Registration Card */}
      <g filter="url(#signup-shadow)" transform="translate(125, 30)">
        {/* Phone Body */}
        <rect x="0" y="10" width="100" height="165" rx="14" fill="url(#signup-phone)" />
        {/* Screen */}
        <rect x="5" y="16" width="90" height="152" rx="10" fill="url(#signup-screen)" />
        {/* Notch */}
        <rect x="35" y="20" width="30" height="4" rx="2" fill="#E2E8F0" />
        
        {/* Profile Avatar Card on Screen */}
        <circle cx="50" cy="46" r="14" fill="url(#signup-badge)" />
        {/* Person icon in avatar */}
        <circle cx="50" cy="42" r="5" fill="#FFFFFF" />
        <path d="M41 55 C41 50 45 48 50 48 C55 48 59 50 59 55 Z" fill="#FFFFFF" />

        {/* Input lines on screen */}
        <rect x="18" y="68" width="64" height="8" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
        <line x1="24" y1="72" x2="48" y2="72" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />

        <rect x="18" y="82" width="64" height="8" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
        <line x1="24" y1="86" x2="56" y2="86" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />

        <rect x="18" y="96" width="64" height="8" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
        <line x1="24" y1="100" x2="40" y2="100" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />

        {/* Submit button on screen */}
        <rect x="22" y="114" width="56" height="14" rx="7" fill="#2563EB" />
        <line x1="38" y1="121" x2="62" y2="121" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

        {/* Checkmark badge popping out */}
        <circle cx="82" cy="30" r="10" fill="#10B981" />
        <path d="M78 30 L81 33 L86 27" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Floating Sparkles and checklist icons */}
      <circle cx="280" cy="65" r="2.5" fill="#3B82F6" />
      <circle cx="265" cy="45" r="1.5" fill="#60A5FA" />
      <path d="M290 85 L292 88 L296 90 L292 92 L290 96 L288 92 L284 90 L288 88 Z" fill="#60A5FA" opacity="0.6" />

      {/* Character interacting with screen */}
      {/* Legs */}
      <rect x="248" y="145" width="5" height="42" rx="2.5" fill="#1E3A8A" />
      <rect x="257" y="145" width="5" height="42" rx="2.5" fill="#172554" />
      {/* Shoes */}
      <ellipse cx="249" cy="187" rx="5.5" ry="2.5" fill="#0F172A" />
      <ellipse cx="259" cy="187" rx="5.5" ry="2.5" fill="#0F172A" />
      {/* Skirt / Outfit */}
      <path d="M245 132 L266 132 L269 152 L242 152 Z" fill="#1E40AF" />
      {/* Torso */}
      <rect x="245" y="108" width="18" height="26" rx="5" fill="#F43F5E" />
      {/* Head */}
      <circle cx="254" cy="94" r="8" fill="#FDBA74" />
      {/* Hair */}
      <path d="M246 94 C246 86 261 84 263 92 C263 104 256 106 248 102 Z" fill="#1E293B" />
      {/* Arm pointing to screen */}
      <path d="M248 116 L222 108" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="220" cy="107" r="3" fill="#FDBA74" />
    </svg>
  );
}
