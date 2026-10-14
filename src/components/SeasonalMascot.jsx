import React from 'react';
import mascot from '../assets/mascot.svg';

// ── Calcola il tema in base alla data ──────────────────────────────────────
function getStagione() {
  const now = new Date();
  const m = now.getMonth() + 1; // 1-12
  const d = now.getDate();

  // Capodanno: 31 dic → 2 gen
  if ((m === 12 && d === 31) || (m === 1 && d <= 2)) return 'capodanno';
  // Epifania: 3 → 6 gen
  if (m === 1 && d >= 3 && d <= 6) return 'epifania';
  // San Valentino: 10 → 14 feb
  if (m === 2 && d >= 10 && d <= 14) return 'valentino';
  // San Patrizio: 14 → 17 mar
  if (m === 3 && d >= 14 && d <= 17) return 'patrizio';
  // Halloween: 15 → 31 ott
  if (m === 10 && d >= 15) return 'halloween';
  // Natale: 1 dic → 30 dic
  if (m === 12 && d <= 30) return 'natale';
  // Estate: 15 giu → 31 ago
  if ((m === 6 && d >= 15) || m === 7 || m === 8) return 'estate';

  return 'default';
}

// ── Badge testuale ─────────────────────────────────────────────────────────
export function SeasonBadge({ lang }) {
  const stagione = getStagione();
  const isEn = lang === 'en';

  const badges = {
    halloween:  { it: '🎃 Buon Halloween!',      en: '🎃 Happy Halloween!' },
    natale:     { it: '🎄 Buon Natale!',          en: '🎄 Merry Christmas!' },
    capodanno:  { it: '🎆 Felice Anno Nuovo!',    en: '🎆 Happy New Year!' },
    epifania:   { it: '🧙‍♀️ Buona Epifania!',      en: '🧙‍♀️ Happy Epiphany!' },
    valentino:  { it: '💝 Buon San Valentino!',   en: '💝 Happy Valentine\'s!' },
    patrizio:   { it: '🍀 Buon San Patrizio!',    en: '🍀 Happy St. Patrick\'s!' },
    estate:     { it: '☀️ Buona estate!',          en: '☀️ Enjoy the summer!' },
    default:    null,
  };

  const badge = badges[stagione];
  if (!badge) return null;

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '12px', fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      background: 'rgba(255,255,255,0.15)',
      borderRadius: '20px',
      padding: '3px 10px',
      marginTop: '6px',
    }}>
      {isEn ? badge.en : badge.it}
    </span>
  );
}

// ── Overlay SVG stagionale ─────────────────────────────────────────────────
function Overlay({ stagione }) {
  if (stagione === 'default') return null;

  const overlays = {
    halloween: (
      <>
        {/* Cappello da strega */}
        <polygon points="44,0 34,20 54,20" fill="#1E1B2E" />
        <rect x="30" y="19" width="28" height="6" rx="3" fill="#1E1B2E" />
        <rect x="39" y="21" width="10" height="4" rx="1" fill="#F59E0B" />
        <rect x="41" y="22" width="6" height="2.5" rx="0.5" fill="#1E1B2E" />
        {/* Zucca nella carriola */}
        <ellipse cx="32" cy="72" rx="10" ry="8" fill="#F97316" />
        <rect x="31" y="64" width="2.5" height="4" rx="1.2" fill="#15803D" />
        {/* Triangoli occhi/bocca zucca */}
        <polygon points="28,71 30,68 32,71" fill="#1E1B2E" />
        <polygon points="33,71 35,68 37,71" fill="#1E1B2E" />
        <polygon points="28,74 32,77 36,74" fill="#1E1B2E" />
        {/* Pipistrellino */}
        <path d="M6 18 Q10 13 14 18 Q10 15 6 18Z" fill="rgba(30,27,46,0.7)" />
        <path d="M78 14 Q82 9 86 14 Q82 11 78 14Z" fill="rgba(30,27,46,0.6)" />
      </>
    ),

    natale: (
      <>
        {/* Cappello Babbo Natale */}
        <polygon points="44,1 33,23 55,23" fill="#DC2626" />
        <circle cx="44" cy="2" r="4.5" fill="white" />
        <rect x="30" y="22" width="28" height="7" rx="3.5" fill="white" />
        {/* Pacco regalo carriola */}
        <rect x="22" y="64" width="20" height="16" rx="3" fill="#DC2626" />
        <rect x="31" y="64" width="2.5" height="16" fill="#FDE047" />
        <rect x="22" y="71" width="20" height="2.5" fill="#FDE047" />
        <ellipse cx="27" cy="64" rx="4.5" ry="3" fill="#FDE047" opacity="0.9" transform="rotate(-20,27,64)" />
        <ellipse cx="37" cy="64" rx="4.5" ry="3" fill="#FDE047" opacity="0.9" transform="rotate(20,37,64)" />
        <circle cx="32" cy="64" r="3" fill="#FDE047" />
        {/* Neve */}
        <circle cx="8" cy="30" r="2.5" fill="white" opacity="0.7" />
        <circle cx="80" cy="22" r="2" fill="white" opacity="0.6" />
        <circle cx="6" cy="55" r="2" fill="white" opacity="0.5" />
        <circle cx="82" cy="50" r="2.5" fill="white" opacity="0.6" />
      </>
    ),

    capodanno: (
      <>
        {/* Cappellino party */}
        <polygon points="44,0 35,22 53,22" fill="#7C3AED" />
        <rect x="33" y="21" width="22" height="5" rx="2.5" fill="#A78BFA" />
        <circle cx="44" cy="1.5" r="3.5" fill="#FDE047" />
        {/* Coriandoli */}
        <rect x="8" y="18" width="6" height="3.5" rx="1" fill="#F472B6" transform="rotate(-20,8,18)" />
        <rect x="74" y="15" width="5" height="3" rx="1" fill="#34D399" transform="rotate(15,74,15)" />
        <rect x="12" y="42" width="5" height="3" rx="1" fill="#60A5FA" transform="rotate(30,12,42)" />
        <rect x="72" y="38" width="6" height="3" rx="1" fill="#FDE047" transform="rotate(-10,72,38)" />
        <circle cx="18" cy="28" r="2.5" fill="#F97316" opacity="0.7" />
        <circle cx="70" cy="26" r="2" fill="#EC4899" opacity="0.7" />
        {/* Bottiglia spumante carriola */}
        <rect x="30" y="60" width="10" height="20" rx="3.5" fill="#15803D" />
        <rect x="31" y="55" width="8" height="7" rx="2.5" fill="#166534" />
        <ellipse cx="35" cy="55" rx="4" ry="2.5" fill="#A3E635" />
        <circle cx="35" cy="67" r="1.2" fill="white" opacity="0.4" />
        <circle cx="33" cy="72" r="1" fill="white" opacity="0.3" />
        {/* Fuochi artificicio mini */}
        <circle cx="76" cy="10" r="2" fill="#FDE047" />
        <line x1="76" y1="6" x2="76" y2="3" stroke="#FDE047" strokeWidth="1.5" opacity="0.7" />
        <line x1="79" y1="8" x2="81" y2="5" stroke="#F472B6" strokeWidth="1.5" opacity="0.7" />
        <line x1="73" y1="8" x2="71" y2="5" stroke="#60A5FA" strokeWidth="1.5" opacity="0.7" />
        <line x1="80" y1="11" x2="83" y2="11" stroke="#34D399" strokeWidth="1.5" opacity="0.7" />
      </>
    ),

    epifania: (
      <>
        {/* Cappello befana */}
        <polygon points="44,1 36,23 52,23" fill="#1E1B2E" />
        <ellipse cx="44" cy="23" rx="14" ry="4.5" fill="#374151" />
        <circle cx="40" cy="11" r="1.5" fill="#FDE047" opacity="0.9" />
        <circle cx="48" cy="15" r="1.2" fill="#FDE047" opacity="0.8" />
        <circle cx="44" cy="7" r="1" fill="#FDE047" opacity="0.7" />
        {/* Scopa nella carriola */}
        <line x1="40" y1="60" x2="26" y2="78" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
        <path d="M23,75 Q27,71 31,75 Q27,78 23,75Z" fill="#D97706" />
        <path d="M24,78 Q28,74 32,78 Q28,81 24,78Z" fill="#B45309" />
        {/* Calza */}
        <path d="M50,60 Q55,60 56,66 Q57,72 55,77 Q54,79 51,79 Q48,79 48,75 Q48,70 51,69 Q53,68 53,66 Q53,62 50,60Z" fill="#DC2626" />
        <rect x="49" y="72" width="5" height="3.5" rx="1" fill="#92400E" opacity="0.4" />
        {/* Stelle */}
        <circle cx="8" cy="22" r="2" fill="#FDE047" opacity="0.6" />
        <circle cx="80" cy="18" r="1.5" fill="#FDE047" opacity="0.5" />
        <circle cx="6" cy="48" r="1.5" fill="#FDE047" opacity="0.5" />
      </>
    ),

    valentino: (
      <>
        {/* Cuore sopra la testa */}
        <path d="M37,8 C37,4.5 41,2.5 44,6 C47,2.5 51,4.5 51,8 C51,13 44,18 44,18 C44,18 37,13 37,8Z" fill="#E11D48" />
        {/* Cuori nella carriola */}
        <path d="M26,68 C26,65.5 28.5,64.5 30,66.5 C31.5,64.5 34,65.5 34,68 C34,71 30,74 30,74 C30,74 26,71 26,68Z" fill="#E11D48" opacity="0.9" />
        <path d="M36,70 C36,68.5 37.8,67.8 39,69.5 C40.2,67.8 42,68.5 42,70 C42,72.5 39,75 39,75 C39,75 36,72.5 36,70Z" fill="#F43F5E" opacity="0.8" />
        {/* Fiocchetto */}
        <path d="M37,43 C37,40.5 40.5,39 44,41.5 C47.5,39 51,40.5 51,43 C47.5,43.5 44,44.5 44,44.5 C44,44.5 40.5,43.5 37,43Z" fill="#FB7185" opacity="0.75" />
        {/* Cuori volanti */}
        <path d="M8,22 C8,20 10,19 11,21 C12,19 14,20 14,22 C14,24.5 11,26.5 11,26.5 C11,26.5 8,24.5 8,22Z" fill="#E11D48" opacity="0.45" />
        <path d="M74,16 C74,14.5 75.8,13.8 76.5,15.5 C77.2,13.8 79,14.5 79,16 C79,18 76.5,19.5 76.5,19.5 C76.5,19.5 74,18 74,16Z" fill="#E11D48" opacity="0.4" />
      </>
    ),

    patrizio: (
      <>
        {/* Cilindro verde */}
        <rect x="32" y="6" width="24" height="18" rx="2.5" fill="#15803D" />
        <rect x="28" y="23" width="32" height="6" rx="3" fill="#166534" />
        <rect x="32" y="19" width="24" height="4.5" fill="#1E1B2E" />
        <rect x="39" y="20" width="10" height="3.5" rx="0.5" fill="#FDE047" />
        <rect x="41" y="21" width="6" height="2" rx="0.5" fill="#1E1B2E" />
        {/* Trifoglio carriola */}
        <circle cx="28" cy="68" r="6.5" fill="#22C55E" />
        <circle cx="36" cy="68" r="6.5" fill="#22C55E" />
        <circle cx="32" cy="62" r="6.5" fill="#22C55E" />
        <line x1="32" y1="68" x2="32" y2="79" stroke="#15803D" strokeWidth="2.5" />
        {/* Trifoglietti */}
        <circle cx="10" cy="32" r="4" fill="#22C55E" opacity="0.45" />
        <circle cx="15" cy="32" r="4" fill="#22C55E" opacity="0.45" />
        <circle cx="12.5" cy="28" r="4" fill="#22C55E" opacity="0.45" />
        <line x1="12.5" y1="33" x2="12.5" y2="40" stroke="#15803D" strokeWidth="1.5" opacity="0.45" />
        {/* Arcobaleno */}
        <defs>
          <linearGradient id="rb" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="33%" stopColor="#FDE047" />
            <stop offset="66%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        <path d="M4,78 Q18,58 32,78" stroke="url(#rb)" strokeWidth="3.5" fill="none" opacity="0.55" strokeLinecap="round" />
      </>
    ),

    estate: (
      <>
        {/* Occhiali da sole */}
        <rect x="30" y="22" width="13" height="9" rx="4.5" fill="#1E1B2E" />
        <rect x="47" y="22" width="13" height="9" rx="4.5" fill="#1E1B2E" />
        <line x1="43" y1="26" x2="47" y2="26" stroke="#1E1B2E" strokeWidth="2.5" />
        <line x1="30" y1="26" x2="25" y2="24" stroke="#1E1B2E" strokeWidth="2.5" />
        <line x1="60" y1="26" x2="65" y2="24" stroke="#1E1B2E" strokeWidth="2.5" />
        <path d="M33,23 Q35,26 34,30" stroke="white" strokeWidth="1.2" opacity="0.35" fill="none" />
        <path d="M50,23 Q52,26 51,30" stroke="white" strokeWidth="1.2" opacity="0.35" fill="none" />
        {/* Ombrellino carriola */}
        <line x1="34" y1="60" x2="34" y2="78" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22,64 Q34,54 46,64" fill="#F97316" />
        <path d="M22,64 Q28,57 34,64" fill="#EF4444" />
        <path d="M34,64 Q40,57 46,64" fill="#FDE047" />
        {/* Sole */}
        <circle cx="76" cy="12" r="7" fill="#FDE047" opacity="0.85" />
        <line x1="76" y1="3" x2="76" y2="0" stroke="#FDE047" strokeWidth="2" opacity="0.6" />
        <line x1="85" y1="12" x2="88" y2="12" stroke="#FDE047" strokeWidth="2" opacity="0.6" />
        <line x1="83" y1="5" x2="85" y2="3" stroke="#FDE047" strokeWidth="2" opacity="0.6" />
        <line x1="69" y1="5" x2="67" y2="3" stroke="#FDE047" strokeWidth="2" opacity="0.6" />
        <line x1="76" y1="21" x2="76" y2="24" stroke="#FDE047" strokeWidth="2" opacity="0.6" />
      </>
    ),
  };

  return overlays[stagione] || null;
}

// ── Componente principale ──────────────────────────────────────────────────
export default function SeasonalMascot() {
  const stagione = getStagione();

  return (
    <div style={{ position: 'absolute', bottom: '8px', right: '12px', width: '86px', height: '86px', zIndex: 2 }}>
      {/* Quokka base */}
      <img
        src={mascot}
        alt=""
        style={{ width: '86px', height: '86px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      {/* Overlay stagionale */}
      {stagione !== 'default' && (
        <svg
          viewBox="0 0 90 90"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <Overlay stagione={stagione} />
        </svg>
      )}
    </div>
  );
}
